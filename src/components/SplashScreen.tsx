import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = SCREEN_WIDTH * 0.6;

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const rotationInner = useSharedValue(0);
  const rotationOuter = useSharedValue(0);
  const progress = useSharedValue(0);
  const loadingOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Logo entrance: spring scale and fade
    logoScale.value = withTiming(1, {
      duration: 900,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    });
    logoOpacity.value = withTiming(1, { duration: 700 });

    // 2. Pulse logo and rings breathing pattern
    logoScale.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1200, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(0.97, { duration: 1200, easing: Easing.bezier(0.4, 0, 0.6, 1) })
        ),
        -1,
        true
      )
    );

    // 3. Slow counter-clockwise rotation for inner dashed circle
    rotationInner.value = withRepeat(
      withTiming(-360, {
        duration: 12000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // 4. Slow clockwise rotation for outer dotted circle
    rotationOuter.value = withRepeat(
      withTiming(360, {
        duration: 18000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // 5. Progress bar fade in
    loadingOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

    // 6. Smooth progress loading fill (runs for 2.2 seconds)
    progress.value = withTiming(1, {
      duration: 2200,
      easing: Easing.bezier(0.25, 0.8, 0.25, 1),
    }, (finished) => {
      if (finished) {
        runOnJS(onFinish)();
      }
    });
  }, [onFinish]);

  // Animated Styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const innerRingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotationInner.value}deg` },
        { scale: logoScale.value }
      ],
      opacity: logoOpacity.value * 0.7,
    };
  });

  const outerRingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotationOuter.value}deg` },
        { scale: logoScale.value }
      ],
      opacity: logoOpacity.value * 0.45,
    };
  });

  const loadingContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: loadingOpacity.value,
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const translateX = (progress.value - 1) * PROGRESS_BAR_WIDTH;
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Brand visual stack with rotating rings */}
        <View style={styles.brandVisualContainer}>
          <Animated.View style={[styles.outerRing, outerRingStyle]} />
          <Animated.View style={[styles.innerRing, innerRingStyle]} />
          
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.View style={[styles.titleContainer, logoAnimatedStyle]}>
          <Text style={styles.title}>CONECTAE</Text>
          <Text style={styles.subtitle}>Sua rede de oportunidades</Text>
        </Animated.View>
      </View>

      {/* Progress Bar Track */}
      <Animated.View style={[styles.loaderContainer, loadingContainerStyle]}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
        </View>
        <Text style={styles.loadingText}>Conectando...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  brandVisualContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(18, 22, 32, 0.08)',
    borderStyle: 'dashed',
  },
  innerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(18, 22, 32, 0.15)',
    borderStyle: 'dotted',
  },
  logoContainer: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  loaderContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  progressBarTrack: {
    width: PROGRESS_BAR_WIDTH,
    height: 6,
    backgroundColor: 'rgba(18, 22, 32, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
