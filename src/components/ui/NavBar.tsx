import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing
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

  // Shared values for icon pop scaling
  const homeIconScale = useSharedValue(1);
  const postIconScale = useSharedValue(1);
  const profileIconScale = useSharedValue(1);

  useEffect(() => {
    // 1. Animate horizontal slide translation
    indicatorTranslateX.value = withSpring(activeIndex * TAB_WIDTH, SPRING_SPECS.snappy);

    // 2. Animate the liquid/jelly squish effect during transition
    scaleX.value = withSequence(
      withTiming(1.35, { duration: 160, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
      withSpring(1, SPRING_SPECS.bouncy)
    );
    scaleY.value = withSequence(
      withTiming(0.72, { duration: 160, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
      withSpring(1, SPRING_SPECS.bouncy)
    );

    // 3. Trigger scale pop animation on active icon
    if (activeIndex === 0) {
      homeIconScale.value = withSequence(withTiming(1.3, { duration: 120 }), withSpring(1, SPRING_SPECS.bouncy));
    } else if (activeIndex === 1) {
      postIconScale.value = withSequence(withTiming(1.3, { duration: 120 }), withSpring(1, SPRING_SPECS.bouncy));
    } else if (activeIndex === 2) {
      profileIconScale.value = withSequence(withTiming(1.3, { duration: 120 }), withSpring(1, SPRING_SPECS.bouncy));
    }
  }, [activeIndex]);

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

  // Individual icon animated styles
  const homeIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: homeIconScale.value }] }));
  const postIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: postIconScale.value }] }));
  const profileIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: profileIconScale.value }] }));

  const tabs = [
    { name: 'home' as const, icon: 'home' as const, animatedStyle: homeIconStyle },
    { name: 'post' as const, icon: 'plus-circle' as const, animatedStyle: postIconStyle },
    { name: 'profile' as const, icon: 'user' as const, animatedStyle: profileIconStyle }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        {/* Animated Liquid Sliding Indicator Pill */}
        <Animated.View
          style={[
            styles.indicator,
            indicatorAnimatedStyle
          ]}
        />

        {/* Tab Buttons */}
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => onChangeTab(index)}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <Animated.View style={tab.animatedStyle}>
                <Feather
                  name={tab.icon}
                  size={24}
                  color={isActive ? COLORS.primary : 'rgba(255, 255, 255, 0.65)'}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
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
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    
    // Shadow for elevation depth
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    backgroundColor: COLORS.background, // neon yellow liquid pill
    borderRadius: PILL_HEIGHT / 2,
    left: (TAB_WIDTH - PILL_WIDTH) / 2,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});
