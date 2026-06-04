import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export type GestureNavEvent = 'tab0' | 'tab1' | 'tab2' | 'next' | 'prev' | 'scroll_up' | 'scroll_down';

interface GestureOverlayProps {
  /** Called when a confirmed gesture is detected */
  onGesture: (gesture: GestureNavEvent) => void;
  /** Pauses camera access while true (e.g. when CameraScreen is active) */
  paused: boolean;
}

/**
 * GestureOverlay
 *
 * Invisible component that runs MediaPipe Hands in a 1×1 WebView.
 * The front camera is accessed at 320×240 for low-power inference only;
 * no preview is ever shown to the user.
 *
 * Gesture → Action mapping
 *  ☝️  1 finger (index only)              → tab 0 (Home)
 *  ✌️  2 fingers (index + middle)          → tab 1 (Post)
 *  🤟  3 fingers (index + middle + ring)   → tab 2 (Profile)
 *  👈  Hand sweeps left across frame       → next tab
 *  👉  Hand sweeps right across frame      → previous tab
 *
 * Debouncing: gesture must be held for 700 ms, then a 1.5 s cooldown prevents
 * repeat fires. Swipes bypass the hold-time (they are directional events).
 */
export const GestureOverlay: React.FC<GestureOverlayProps> = ({ onGesture, paused }) => {
  const webViewRef = useRef<WebView>(null);

  // Sync pause/resume to the WebView whenever the prop changes
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: paused ? 'pause' : 'resume' })
      );
    }
  }, [paused]);

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      switch (msg.type) {
        case 'gesture':
          onGesture(msg.val as GestureNavEvent);
          break;
        case 'log':
          console.log('[GestureOverlay]', msg.val);
          break;
        case 'warn':
          console.warn('[GestureOverlay]', msg.val);
          break;
        case 'error':
          console.error('[GestureOverlay ERROR]', msg.val);
          break;
      }
    } catch (_) {
      // Non-JSON messages from WebView internals — safe to ignore
    }
  };

  const htmlBundle = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js" crossorigin="anonymous"></script>
</head>
<body style="margin:0;background:#000;overflow:hidden;">
  <video id="video" playsinline muted autoplay
    style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;">
  </video>

  <script>
    // ── Console forwarding ─────────────────────────────────────────────────────
    (function() {
      const fwd = (type, args) => {
        try {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type, val: args.map(String).join(' ') })
          );
        } catch(_) {}
      };
      ['log','warn','error'].forEach(m => {
        const orig = console[m].bind(console);
        console[m] = (...a) => { orig(...a); fwd(m, a); };
      });
      window.onerror = (msg, src, line) => {
        fwd('error', ['Uncaught ' + msg + ' @ ' + src + ':' + line]);
        return false;
      };
    })();

    // ── State ─────────────────────────────────────────────────────────────────
    const video = document.getElementById('video');

    let hands         = null;
    let currentStream = null;
    let rafId         = null;
    let isPaused      = false;
    let isInitialized = false;

    // Gesture hold / cooldown
    let pendingGesture    = null;   // gesture string currently being held
    let pendingStartTime  = 0;
    let lastFireTime      = 0;
    const HOLD_MS         = 700;    // ms gesture must be held before firing
    const COOLDOWN_MS     = 1500;   // ms between successive gesture fires

    // Swipe detection — track wrist X over a rolling 600ms window
    let wristHistory = [];  // [{ x: 0..1, time: ms }]
    const SWIPE_THRESHOLD = 0.22;  // fraction of frame width

    // ── Message handler ────────────────────────────────────────────────────────
    document.addEventListener('message', onRNMsg);
    window.addEventListener('message',   onRNMsg);

    function onRNMsg(e) {
      try {
        const d = JSON.parse(e.data);
        if (d.type === 'pause')  { pauseDetection();  }
        if (d.type === 'resume') { resumeDetection(); }
      } catch(_) {}
    }

    // ── Pause / Resume ─────────────────────────────────────────────────────────
    function pauseDetection() {
      if (isPaused) return;
      isPaused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        currentStream = null;
      }
      video.srcObject = null;
      pendingGesture = null;
      wristHistory   = [];
      console.log('Gesture detection paused.');
    }

    function resumeDetection() {
      if (!isPaused) return;
      isPaused = false;
      console.log('Gesture detection resuming…');
      if (isInitialized) {
        startCamera();
      } else {
        initHands();
      }
    }

    // ── Hand model initialization ──────────────────────────────────────────────
    function initHands() {
      if (hands) return;
      console.log('Initializing MediaPipe Hands…');

      hands = new Hands({
        locateFile: file =>
          'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/' + file
      });

      hands.setOptions({
        maxNumHands:            1,
        modelComplexity:        0,   // 0 = lite (faster), 1 = full
        minDetectionConfidence: 0.6,
        minTrackingConfidence:  0.5
      });

      hands.onResults(onHandResults);

      hands.initialize().then(() => {
        console.log('Hands WASM ready.');
        isInitialized = true;
        if (!isPaused) startCamera();
      }).catch(err => {
        console.error('Hands init error:', err && err.message);
      });
    }

    // ── Camera ─────────────────────────────────────────────────────────────────
    function startCamera() {
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'user' },
          width:  { ideal: 320 },
          height: { ideal: 240 }
        },
        audio: false
      }).then(stream => {
        console.log('Gesture cam acquired.');
        currentStream  = stream;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().then(() => {
            console.log('Gesture cam playing.');
            startRenderLoop();
          }).catch(err => console.error('video.play failed:', err.message));
        };
      }).catch(err => {
        console.error('Gesture getUserMedia error:', err.name, err.message);
      });
    }

    // ── Render loop ────────────────────────────────────────────────────────────
    function startRenderLoop() {
      if (rafId) cancelAnimationFrame(rafId);
      let lastSend = 0;
      const SEND_INTERVAL = 80; // ~12fps inference

      async function loop(ts) {
        if (isPaused) return;
        rafId = requestAnimationFrame(loop);
        if (!video.readyState || video.readyState < 2) return;
        if (ts - lastSend >= SEND_INTERVAL) {
          lastSend = ts;
          try { await hands.send({ image: video }); } catch(_) {}
        }
      }
      rafId = requestAnimationFrame(loop);
    }

    // ── Gesture classification ─────────────────────────────────────────────────
    function isExtended(lm, tipIdx, pipIdx) {
      return lm[tipIdx].y < lm[pipIdx].y - 0.02;
    }

    function classifyStaticGesture(lm) {
      const idx    = isExtended(lm,  8,  6);
      const mid    = isExtended(lm, 12, 10);
      const ring   = isExtended(lm, 16, 14);
      const pinky  = isExtended(lm, 20, 18);

      if  (idx && !mid && !ring && !pinky) return '1finger';  // ☝️
      if  (idx &&  mid && !ring && !pinky) return '2finger';  // ✌️
      if  (idx &&  mid &&  ring && !pinky) return '3finger';  // 🤟
      if  (idx &&  mid &&  ring &&  pinky) return 'open_hand'; // 🖐️
      if  (!idx && !mid && !ring && !pinky) return 'fist';      // ✊
      return null;
    }

    function checkSwipe(wristX) {
      const now = Date.now();
      wristHistory.push({ x: wristX, time: now });
      // Keep only last 600ms
      wristHistory = wristHistory.filter(p => now - p.time < 600);

      if (wristHistory.length < 4) return null;

      const first = wristHistory[0];
      const last  = wristHistory[wristHistory.length - 1];
      const dx    = last.x - first.x;  // positive = moved right in frame

      // MediaPipe X: 0 = left edge, 1 = right edge.
      // For front (mirrored) camera, moving hand RIGHT → dx positive → we treat as 'prev'.
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        wristHistory = []; // reset after detecting swipe
        return dx > 0 ? 'prev' : 'next';
      }
      return null;
    }

    // ── Results handler ────────────────────────────────────────────────────────
    function onHandResults(results) {
      if (isPaused) return;

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        pendingGesture   = null;
        pendingStartTime = 0;
        return;
      }

      const lm  = results.multiHandLandmarks[0];
      const now = Date.now();

      // Swipe check (fires immediately, no hold required)
      const swipe = checkSwipe(lm[0].x);
      if (swipe && now - lastFireTime >= COOLDOWN_MS) {
        lastFireTime   = now;
        pendingGesture = null;
        fireGesture(swipe);
        return;
      }

      // Static gesture check with hold time
      const g = classifyStaticGesture(lm);

      if (!g) {
        pendingGesture   = null;
        pendingStartTime = 0;
        return;
      }

      if (g !== pendingGesture) {
        pendingGesture   = g;
        pendingStartTime = now;
        return;
      }

      // Same gesture — check hold time
      const isScroll = (g === 'open_hand' || g === 'fist');
      const holdTimeRequired = isScroll ? 350 : HOLD_MS;
      const cooldownRequired = isScroll ? 450 : COOLDOWN_MS;

      if (now - pendingStartTime >= holdTimeRequired && now - lastFireTime >= cooldownRequired) {
        lastFireTime     = now;
        pendingStartTime = now; // reset so it doesn't re-fire immediately
        const map = { 
          '1finger': 'tab0', 
          '2finger': 'tab1', 
          '3finger': 'tab2',
          'open_hand': 'scroll_down',
          'fist': 'scroll_up'
        };
        fireGesture(map[g]);
      }
    }

    function fireGesture(val) {
      console.log('Gesture fired:', val);
      try {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'gesture', val })
        );
      } catch(_) {}
    }

    // ── Boot ──────────────────────────────────────────────────────────────────
    initHands();
  </script>
</body>
</html>`;

  return (
    // Invisible layer — sits on top of nothing, blocks no touches
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <WebView
        ref={webViewRef}
        source={{ html: htmlBundle, baseUrl: 'https://localhost' }}
        style={styles.webview}
        javaScriptEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
        originWhitelist={['*']}
        onMessage={handleMessage}
        scrollEnabled={false}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  webview: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
  },
});
