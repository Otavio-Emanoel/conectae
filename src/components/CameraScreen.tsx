import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
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

export const CameraScreen: React.FC<CameraScreenProps> = ({ onClose }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [showGrid, setShowGrid] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

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

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.background} />
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Feather name="camera" size={64} color={COLORS.background} style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
        <Text style={styles.permissionSubtitle}>
          Precisamos da sua permissão para abrir a câmera e capturar momentos incríveis.
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
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(prev => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  };

  const handleCapture = async () => {
    shutterScale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, SPRING_SPECS.bouncy)
    );

    // Trigger physical-like shutter flash blink
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 160 })
    );

    try {
      if (cameraRef.current) {
        // Take a mock or real picture depending on environment
        await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: true
        });
      }
    } catch (e) {
      console.warn("Capture error: ", e);
    }
  };

  const getFlashIcon = () => {
    if (flash === 'on') return 'zap';
    if (flash === 'auto') return 'help-circle'; // Fallback visual mode
    return 'zap-off';
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing={facing} 
        flash={flash}
        ref={cameraRef}
      >
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
      </CameraView>

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
    backgroundColor: '#121620', // Premium dark slate background
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
    backgroundColor: COLORS.background, // neon yellow
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
    backgroundColor: COLORS.background, // bright yellow shutter
  },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
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
  flashOverlay: {
    backgroundColor: COLORS.white,
    zIndex: 99,
  },
});
