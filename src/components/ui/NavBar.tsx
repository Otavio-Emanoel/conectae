import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { SPRING_SPECS } from '../../constants/motion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NAV_PADDING = 24;
const NAV_CONTENT_WIDTH = SCREEN_WIDTH - NAV_PADDING * 2;
const TAB_WIDTH = NAV_CONTENT_WIDTH / 3;
const PILL_WIDTH = 60;
const PILL_HEIGHT = 38;

interface NavBarProps {
  activeIndex: number;
  onChangeTab: (index: number) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeIndex, onChangeTab }) => {
  // Shared value to control the indicator pill horizontal position
  const indicatorTranslateX = useSharedValue(0);

  // Shared values for the gooey/liquid stretch deformations
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  // Keep track of the gesture dragging status
  const isDragging = useSharedValue(false);
  const startX = useSharedValue(0);

  // Synchronize indicator position with activeIndex state when not dragging
  useEffect(() => {
    if (!isDragging.value) {
      indicatorTranslateX.value = withSpring(activeIndex * TAB_WIDTH, SPRING_SPECS.snappy);
    }
  }, [activeIndex]);

  // Pan gesture to drag the active pill left/right
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      startX.value = indicatorTranslateX.value;
      
      // Initial gooey scale on touch start
      scaleX.value = withSpring(1.15, SPRING_SPECS.snappy);
      scaleY.value = withSpring(0.9, SPRING_SPECS.snappy);
    })
    .onUpdate((event) => {
      const nextX = startX.value + event.translationX;
      // Clamp within navbar boundary [0, 2 * TAB_WIDTH]
      indicatorTranslateX.value = Math.max(0, Math.min(TAB_WIDTH * 2, nextX));

      // Dynamic gooey stretching based on drag velocity
      const velocity = Math.abs(event.velocityX);
      scaleX.value = 1.15 + Math.min(0.35, velocity / 3000);
      scaleY.value = 0.9 - Math.min(0.2, velocity / 6000);
    })
    .onEnd(() => {
      isDragging.value = false;

      // Find the closest tab center position
      const currentX = indicatorTranslateX.value;
      const targetTab = Math.max(0, Math.min(2, Math.round(currentX / TAB_WIDTH)));

      // Snap indicator to closest tab center with spring
      indicatorTranslateX.value = withSpring(targetTab * TAB_WIDTH, SPRING_SPECS.snappy);
      
      // Snap scales back to 1.0
      scaleX.value = withSpring(1, SPRING_SPECS.bouncy);
      scaleY.value = withSpring(1, SPRING_SPECS.bouncy);

      // Trigger tab change callback
      runOnJS(onChangeTab)(targetTab);
    });

  // Animated styles for sliding & deformation
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: indicatorTranslateX.value },
        { scaleX: scaleX.value },
        { scaleY: scaleY.value }
      ],
    };
  });

  const tabs = [
    { name: 'home' as const, icon: 'home' as const },
    { name: 'post' as const, icon: 'plus-circle' as const },
    { name: 'profile' as const, icon: 'user' as const }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        {/* Tab Buttons Overlay (Invisible Touch Areas at zIndex 1) */}
        <View style={styles.buttonsOverlay}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.name}
              onPress={() => onChangeTab(index)}
              style={styles.tabButton}
              activeOpacity={0.8}
            />
          ))}
        </View>

        {/* Animated Liquid Sliding & Draggable Indicator Pill (zIndex 2) */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.indicator,
              indicatorAnimatedStyle
            ]}
          />
        </GestureDetector>

        {/* Icons Overlay (zIndex 3 - pointerEvents none for touch passthrough) */}
        <View style={styles.iconsOverlay} pointerEvents="none">
          {tabs.map((tab, index) => {
            // Calculate animated styles driven dynamically by indicator position
            const activeIconStyle = useAnimatedStyle(() => {
              const dist = Math.abs(indicatorTranslateX.value - index * TAB_WIDTH);
              const progress = Math.max(0, 1 - dist / TAB_WIDTH);
              return {
                opacity: progress,
                transform: [{ scale: 1.0 + progress * 0.25 }],
              };
            });

            const inactiveIconStyle = useAnimatedStyle(() => {
              const dist = Math.abs(indicatorTranslateX.value - index * TAB_WIDTH);
              const progress = Math.max(0, 1 - dist / TAB_WIDTH);
              return {
                opacity: 1 - progress,
                transform: [{ scale: 1.0 + progress * 0.25 }],
              };
            });

            return (
              <View key={tab.name} style={styles.tabIconWrapper}>
                {/* Active state icon (Navy) */}
                <Animated.View style={[StyleSheet.absoluteFillObject, styles.iconCentering, activeIconStyle]}>
                  <Feather name={tab.icon} size={24} color={COLORS.primary} />
                </Animated.View>
                {/* Inactive state icon (Translucent White) */}
                <Animated.View style={[StyleSheet.absoluteFillObject, styles.iconCentering, inactiveIconStyle]}>
                  <Feather name={tab.icon} size={24} color="rgba(255, 255, 255, 0.65)" />
                </Animated.View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: NAV_PADDING,
  },
  navContent: {
    width: '100%',
    height: 64,
    // LiquidGlass styling: translucent glassmorphic backdrop
    backgroundColor: 'rgba(18, 22, 32, 0.84)',
    borderRadius: 32,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    
    // Shadow for elevation depth
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonsOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1,
  },
  iconsOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 3,
  },
  indicator: {
    position: 'absolute',
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    backgroundColor: COLORS.background, // neon yellow liquid pill
    borderRadius: PILL_HEIGHT / 2,
    left: (TAB_WIDTH - PILL_WIDTH) / 2,
    top: (64 - PILL_HEIGHT) / 2, // Centered vertically in 64px container
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconWrapper: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  iconCentering: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

