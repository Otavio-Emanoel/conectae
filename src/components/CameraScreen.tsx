import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { WebView } from 'react-native-webview';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { SPRING_SPECS } from '../constants/motion';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraScreenProps {
  onClose: () => void;
}

const FILTERS = [
  { id: 'normal', name: 'Normal', icon: 'camera' },
  { id: 'geek', name: 'Geek', icon: 'smile' },
  { id: 'cyber', name: 'Cyber', icon: 'eye' },
  { id: 'flower', name: 'Flores', icon: 'sun' },
  { id: 'retro', name: 'Retro', icon: 'film' },
  { id: 'noir', name: 'Noir', icon: 'moon' }
];

export const CameraScreen: React.FC<CameraScreenProps> = ({ onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [activeFilter, setActiveFilter] = useState('normal');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [showGrid, setShowGrid] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Animated values for shutter action
  const shutterScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  const flashStyle = useAnimatedStyle(() => {
    return {
      opacity: flashOpacity.value,
    };
  });

  const shutterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: shutterScale.value }],
    };
  });

  // Synchronize active filter with WebView
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'filter', val: activeFilter }));
    }
  }, [activeFilter]);

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.background} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Feather name="camera" size={64} color={COLORS.background} style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
        <Text style={styles.permissionSubtitle}>
          Precisamos de permissão de câmera para aplicar os filtros MediaPipe ao vivo.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionBtnText}>Permitir Câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.permissionCancelBtn} activeOpacity={0.6}>
          <Text style={styles.permissionCancelBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFacing = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'flip' }));
    }
  };

  const toggleFlash = () => {
    setFlash(prev => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  };

  const handleCapture = () => {
    shutterScale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, SPRING_SPECS.bouncy)
    );

    flashOpacity.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 160 })
    );

    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'capture' }));
    }
  };

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'capture') {
        console.log('[CameraScreen] Foto capturada! Tamanho base64:', msg.val?.length ?? 0);
      } else if (msg.type === 'log') {
        console.log('[WebView]', msg.val);
      } else if (msg.type === 'warn') {
        console.warn('[WebView]', msg.val);
      } else if (msg.type === 'error') {
        console.error('[WebView ERROR]', msg.val);
      }
    } catch (e) {
      // Non-JSON messages from WebView internals – safe to ignore
    }
  };

  const getFlashIcon = () => {
    if (flash === 'on') return 'zap';
    if (flash === 'auto') return 'help-circle';
    return 'zap-off';
  };

  /**
   * Inline HTML bundle with MediaPipe Face Mesh (legacy JS CDN).
   *
   * Key fixes applied vs the previous version:
   *  1. Removed @mediapipe/camera_utils entirely – it internally calls getUserMedia
   *     again, causing a conflict in WebView (second camera acquisition fails silently
   *     or hangs forever on mobile).
   *  2. We call getUserMedia once, attach the stream to <video>, then feed frames to
   *     faceMesh.send() via a requestAnimationFrame loop.
   *  3. console.* is proxied to postMessage so we see WebView logs in the RN console.
   *  4. window.onerror also forwards to postMessage.
   *  5. FaceMesh is initialized AFTER the video starts playing (onloadedmetadata), not
   *     before, so the WASM files are loaded only when the camera is confirmed available.
   */
  const htmlBundle = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%; height: 100%;
      overflow: hidden;
      background: #000;
    }
    #video {
      position: absolute;
      width: 1px; height: 1px;
      opacity: 0;
      pointer-events: none;
    }
    #canvas {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
    }
    #status {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: #fff;
      font-family: -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      padding: 24px;
      pointer-events: none;
      background: rgba(0,0,0,0.7);
      z-index: 10;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js" crossorigin="anonymous"></script>
</head>
<body>
  <video id="video" playsinline muted autoplay></video>
  <canvas id="canvas"></canvas>
  <div id="status">
    <div class="spinner"></div>
    <span id="statusText">Iniciando câmera…</span>
  </div>

  <script>
    // ── Console forwarding to React Native ────────────────────────────────────
    (function patchConsole() {
      const send = (type, args) => {
        try {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type, val: args.map(String).join(' ') })
          );
        } catch(_) {}
      };
      ['log','warn','error'].forEach(m => {
        const orig = console[m].bind(console);
        console[m] = (...args) => { orig(...args); send(m, args); };
      });
      window.onerror = (msg, src, line, col, err) => {
        send('error', ['Uncaught ' + msg + ' @ ' + src + ':' + line]);
        return false;
      };
    })();

    // ── State ─────────────────────────────────────────────────────────────────
    const video    = document.getElementById('video');
    const canvas   = document.getElementById('canvas');
    const ctx      = canvas.getContext('2d');
    const status   = document.getElementById('status');
    const statusTx = document.getElementById('statusText');

    let activeFilter = 'normal';
    let facingMode   = 'user';
    let currentStream = null;
    let faceMesh     = null;
    let rafId        = null;
    let meshReady    = false;
    let lastLandmarks = null;

    // ── Message handler from React Native ─────────────────────────────────────
    document.addEventListener('message', onRNMessage);   // Android
    window.addEventListener('message',   onRNMessage);   // iOS

    function onRNMessage(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'filter') {
          activeFilter = data.val;
          console.log('Filter changed to:', activeFilter);
        } else if (data.type === 'flip') {
          facingMode = facingMode === 'user' ? 'environment' : 'user';
          restartCamera();
        } else if (data.type === 'capture') {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'capture', val: dataUrl })
          );
        }
      } catch(e) {}
    }

    // ── Canvas resize ─────────────────────────────────────────────────────────
    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ── FaceMesh initialization ───────────────────────────────────────────────
    function initFaceMesh() {
      if (faceMesh) return;
      console.log('Initializing MediaPipe FaceMesh…');
      statusTx.textContent = 'Carregando modelo IA…';

      faceMesh = new FaceMesh({
        locateFile: file =>
          'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/' + file
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(results => {
        meshReady = true;
        lastLandmarks = (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) || null;
      });

      // Prime the model with a tiny blank image so WASM loads eagerly
      faceMesh.initialize().then(() => {
        console.log('FaceMesh WASM initialized.');
        status.style.display = 'none';
        startRenderLoop();
      }).catch(err => {
        console.error('FaceMesh init error:', err && err.message);
        statusTx.textContent = 'Erro ao carregar modelo: ' + (err && err.message);
      });
    }

    // ── Render loop ───────────────────────────────────────────────────────────
    function startRenderLoop() {
      if (rafId) cancelAnimationFrame(rafId);
      let lastSendTime = 0;
      const SEND_INTERVAL_MS = 66; // ~15 fps for face mesh inference

      async function loop(timestamp) {
        rafId = requestAnimationFrame(loop);

        if (!video.readyState || video.readyState < 2) return;

        // Draw video frame (mirrored for selfie camera)
        ctx.save();
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Apply color / overlay filter first (so AR is on top)
        applyColorFilter();

        // Draw last known AR landmarks
        if (lastLandmarks) {
          drawARFilter(lastLandmarks);
        }

        // Feed frame to face mesh at throttled rate
        if (faceMesh && timestamp - lastSendTime >= SEND_INTERVAL_MS) {
          lastSendTime = timestamp;
          try {
            await faceMesh.send({ image: video });
          } catch(e) {}
        }
      }

      rafId = requestAnimationFrame(loop);
      console.log('Render loop started.');
    }

    // ── Camera startup ────────────────────────────────────────────────────────
    function startCamera() {
      statusTx.textContent = 'Acessando câmera…';
      status.style.display = 'flex';

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width:  { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          console.log('Camera stream acquired.');
          currentStream = stream;
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().then(() => {
              console.log('Video playing. Resolution:', video.videoWidth, 'x', video.videoHeight);
              initFaceMesh();
            }).catch(err => {
              console.error('video.play() failed:', err.message);
              statusTx.textContent = 'Erro ao reproduzir vídeo.';
            });
          };
        })
        .catch(err => {
          console.error('getUserMedia error:', err.name, err.message);
          statusTx.textContent = 'Câmera negada: ' + err.message;
        });
    }

    function stopCamera() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        currentStream = null;
      }
      video.srcObject = null;
      lastLandmarks = null;
    }

    function restartCamera() {
      console.log('Restarting camera, facing:', facingMode);
      stopCamera();
      // Small delay so the previous stream fully releases
      setTimeout(startCamera, 300);
    }

    // ── AR / Color Filters ────────────────────────────────────────────────────

    function applyColorFilter() {
      if (activeFilter === 'retro') drawRetroOverlay();
      else if (activeFilter === 'noir') drawNoirOverlay();
    }

    function drawARFilter(landmarks) {
      if (activeFilter === 'geek')   drawGeekFilter(landmarks);
      else if (activeFilter === 'cyber')  drawCyberFilter(landmarks);
      else if (activeFilter === 'flower') drawFlowerFilter(landmarks);
    }

    function getPoint(lm) {
      const x = facingMode === 'user'
        ? (1 - lm.x) * canvas.width
        : lm.x * canvas.width;
      const y = lm.y * canvas.height;
      return { x, y };
    }

    function drawGeekFilter(lm) {
      const nose     = getPoint(lm[4]);
      const leftEye  = getPoint(lm[159]);
      const rightEye = getPoint(lm[386]);
      const mouth    = getPoint(lm[0]);

      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const angle = Math.atan2(dy, dx);
      const eyeDist = Math.hypot(dx, dy);

      ctx.save();
      ctx.translate(leftEye.x + dx / 2, leftEye.y + dy / 2);
      ctx.rotate(angle);

      const r = eyeDist * 0.45;
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = eyeDist * 0.1;
      ctx.fillStyle = 'rgba(200,230,255,0.18)';

      [-eyeDist * 0.5, eyeDist * 0.5].forEach(cx => {
        ctx.beginPath();
        ctx.arc(cx, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(-eyeDist * 0.5 + r, 0);
      ctx.lineTo(eyeDist * 0.5 - r, 0);
      ctx.stroke();
      ctx.restore();

      // Mustache
      const mc = {
        x: nose.x + (mouth.x - nose.x) * 0.55,
        y: nose.y + (mouth.y - nose.y) * 0.55
      };
      const ms = eyeDist * 0.7;
      ctx.save();
      ctx.translate(mc.x, mc.y);
      ctx.rotate(angle);
      ctx.fillStyle = '#3C2F2F';
      ctx.beginPath();
      ctx.ellipse(-ms * 0.35, 0, ms * 0.40, ms * 0.15, -Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ms * 0.35, 0, ms * 0.40, ms * 0.15, Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawCyberFilter(lm) {
      const leftEye  = getPoint(lm[159]);
      const rightEye = getPoint(lm[386]);
      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const angle   = Math.atan2(dy, dx);
      const eyeDist = Math.hypot(dx, dy);

      ctx.save();
      ctx.translate(leftEye.x + dx / 2, leftEye.y + dy / 2);
      ctx.rotate(angle);

      const vW = eyeDist * 2.0;
      const vH = eyeDist * 0.5;

      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur  = 20;

      ctx.fillStyle   = 'rgba(0,240,255,0.25)';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth   = eyeDist * 0.04;
      ctx.beginPath();
      ctx.roundRect(-vW / 2, -vH / 2, vW, vH, vH * 0.2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle  = '#00F0FF';
      ctx.font       = 'bold ' + (eyeDist * 0.1) + 'px monospace';
      ctx.textAlign  = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SCANNING…', 0, 0);
      ctx.restore();
    }

    function drawFlowerFilter(lm) {
      const leftEye  = getPoint(lm[159]);
      const rightEye = getPoint(lm[386]);
      const forehead = getPoint(lm[10]);
      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const angle   = Math.atan2(dy, dx);
      const eyeDist = Math.hypot(dx, dy);

      ctx.save();
      ctx.translate(forehead.x, forehead.y - eyeDist * 0.3);
      ctx.rotate(angle);

      const cols = ['#FF007F', '#FFD700', '#00E5FF', '#FF6B35', '#9B51E0'];
      const fr   = eyeDist * 0.13;
      cols.forEach((col, i) => {
        const offset = (i - 2) * fr * 2.4;
        // Petals
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.ellipse(
            offset + Math.cos(a) * fr * 0.8,
            Math.sin(a) * fr * 0.8,
            fr * 0.6, fr * 0.35, a, 0, Math.PI * 2
          );
          ctx.fill();
        }
        // Center
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(offset, 0, fr * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawRetroOverlay() {
      // Warm VHS tint
      ctx.fillStyle = 'rgba(245,158,11,0.10)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }

      // REC badge
      const now = new Date();
      const hh = String(now.getHours()).padStart(2,'0');
      const mm = String(now.getMinutes()).padStart(2,'0');
      const ss = String(now.getSeconds()).padStart(2,'0');
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#EF4444';
      ctx.textAlign = 'left';
      ctx.fillText('● REC', 24, 52);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.fillText(hh + ':' + mm + ':' + ss, canvas.width - 24, 52);
    }

    function drawNoirOverlay() {
      // Desaturate via luminance
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
        d[i] = d[i+1] = d[i+2] = lum;
      }
      ctx.putImageData(imgData, 0, 0);

      // Vignette
      const vg = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, canvas.height * 0.25,
        canvas.width/2, canvas.height/2, canvas.height * 0.75
      );
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, canvas.width-20, canvas.height-20);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('NOIR', canvas.width/2, canvas.height - 40);
    }

    // ── Start ──────────────────────────────────────────────────────────────────
    startCamera();
  </script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlBundle, baseUrl: 'https://localhost' }}
        style={StyleSheet.absoluteFillObject}
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

      {/* Rule of Thirds Grid Overlay */}
      {showGrid && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={[styles.gridLine, styles.gridLineHoriz, { top: '33.3%' }]} />
          <View style={[styles.gridLine, styles.gridLineHoriz, { top: '66.6%' }]} />
          <View style={[styles.gridLine, styles.gridLineVert, { left: '33.3%' }]} />
          <View style={[styles.gridLine, styles.gridLineVert, { left: '66.6%' }]} />
        </View>
      )}

      {/* Top Control Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.6}>
          <Feather name="x" size={26} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleFlash} style={styles.iconBtn} activeOpacity={0.6}>
          <Feather name={getFlashIcon()} size={24} color={flash !== 'off' ? COLORS.background : COLORS.white} />
          {flash === 'auto' && <Text style={styles.flashAutoText}>A</Text>}
        </TouchableOpacity>
      </View>

      {/* Sidebar Controls */}
      <View style={styles.sideControls}>
        <TouchableOpacity
          onPress={() => setShowGrid(prev => !prev)}
          style={[styles.sideIconBtn, showGrid && styles.sideIconBtnActive]}
          activeOpacity={0.6}
        >
          <Feather name="grid" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Filters Snap Carousel Row */}
      <View style={styles.filterCarouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterCarouselScroll}
          snapToInterval={84}
          decelerationRate="fast"
        >
          {FILTERS.map(filter => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={[
                  styles.filterItem,
                  isActive && styles.filterItemActive
                ]}
                activeOpacity={0.75}
              >
                <View style={[styles.filterCircle, isActive && styles.filterCircleActive]}>
                  <Feather name={filter.icon as any} size={20} color={isActive ? COLORS.primary : COLORS.white} />
                </View>
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {filter.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom Shutter Dock */}
      <View style={styles.bottomDock}>
        <View style={styles.dockSpacer} />

        {/* Shutter Button */}
        <TouchableOpacity
          onPress={handleCapture}
          activeOpacity={0.9}
          style={styles.shutterOuter}
        >
          <Animated.View style={[styles.shutterInner, shutterStyle]} />
        </TouchableOpacity>

        {/* Flip Camera Control */}
        <TouchableOpacity onPress={toggleFacing} style={styles.flipBtn} activeOpacity={0.6}>
          <Feather name="rotate-cw" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Shutter Flash Blink Feedback Layer */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.flashOverlay, flashStyle]} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#121620',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 12,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontWeight: '600',
  },
  permissionBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.background,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  permissionCancelBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionCancelBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  flashAutoText: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.background,
  },
  sideControls: {
    position: 'absolute',
    left: 20,
    top: SCREEN_HEIGHT / 2 - 100,
    gap: 16,
    zIndex: 10,
  },
  sideIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideIconBtnActive: {
    backgroundColor: COLORS.background,
  },
  bottomDock: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  dockSpacer: {
    width: 48,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
  },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCarouselContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 140 : 120,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 10,
  },
  filterCarouselScroll: {
    paddingHorizontal: SCREEN_WIDTH / 2 - 42,
    alignItems: 'center',
    gap: 16,
  },
  filterItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
  },
  filterItemActive: {
    transform: [{ scale: 1.08 }],
  },
  filterCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCircleActive: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.background,
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  filterLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  filterLabelActive: {
    color: COLORS.background,
    fontWeight: '900',
  },
  flashOverlay: {
    backgroundColor: COLORS.white,
    zIndex: 99,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  gridLineHoriz: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineVert: {
    top: 0,
    bottom: 0,
    width: 1,
  },
});
