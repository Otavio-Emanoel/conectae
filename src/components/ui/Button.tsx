import React from 'react';
import { Pressable, StyleSheet, Text, GestureResponderEvent, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { SPRING_SPECS } from '../../constants/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, style, textStyle, icon }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, SPRING_SPECS.snappy);
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_SPECS.snappy);
    opacity.value = withTiming(1, { duration: 100 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.button, animatedStyle, style]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
      {icon && icon}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
