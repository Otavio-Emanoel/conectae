import React from 'react';
import Animated, { 
  FadeInDown, 
  FadeOutUp, 
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  CurvedTransition
} from 'react-native-reanimated';

import { StyleProp, ViewStyle } from 'react-native';

type AnimationPreset = 'fade' | 'slideUp' | 'slideSide' | 'scale';

interface AnimateEntranceProps {
  children: React.ReactNode;
  preset?: AnimationPreset;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

const getPresets = (preset: AnimationPreset, delay: number, duration: number) => {
  const d = delay;
  const dur = duration;

  switch (preset) {
    case 'slideUp':
      return {
        entering: FadeInDown.delay(d).duration(dur).springify().damping(22).stiffness(90).mass(1.1),
        exiting: FadeOutUp.duration(dur * 0.8),
      };
    case 'slideSide':
      return {
        entering: SlideInRight.delay(d).duration(dur).springify().damping(20).stiffness(100),
        exiting: SlideOutLeft.duration(dur * 0.8),
      };
    case 'scale':
      return {
        entering: ZoomIn.delay(d).duration(dur).springify().damping(20).stiffness(95).mass(1.1),
        exiting: ZoomOut.duration(dur * 0.8),
      };
    case 'fade':
    default:
      return {
        entering: FadeIn.delay(d).duration(dur),
        exiting: FadeOut.duration(dur),
      };
  }
};

export const AnimateEntrance: React.FC<AnimateEntranceProps> = ({
  children,
  preset = 'slideUp',
  delay = 0,
  duration = 500,
  style,
}) => {
  const motion = getPresets(preset, delay, duration);

  return (
    <Animated.View 
      entering={motion.entering} 
      exiting={motion.exiting}
      layout={CurvedTransition.duration(400)}
      style={[{ width: '100%' }, style]}
    >
      {children}
    </Animated.View>
  );
};
