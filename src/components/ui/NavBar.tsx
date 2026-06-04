import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
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

  useEffect(() => {
    indicatorTranslateX.value = withSpring(activeIndex * TAB_WIDTH, SPRING_SPECS.snappy);
  }, [activeIndex]);

  // Animated style for the sliding indicator pill
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorTranslateX.value }],
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
        {/* Animated Sliding Indicator Pill */}
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
              <Feather
                name={tab.icon}
                size={24}
                color={isActive ? COLORS.primary : 'rgba(255, 255, 255, 0.6)'}
              />
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
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  indicator: {
    position: 'absolute',
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    backgroundColor: COLORS.background, // neon yellow pill
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
