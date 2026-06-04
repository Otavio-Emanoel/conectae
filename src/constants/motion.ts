import { WithSpringConfig, WithTimingConfig, Easing } from 'react-native-reanimated';

export const SPRING_SPECS = {
  snappy: {
    damping: 15,
    mass: 1,
    stiffness: 120,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  } as WithSpringConfig,
  bouncy: {
    damping: 10,
    mass: 0.8,
    stiffness: 150,
  } as WithSpringConfig,
  smooth: {
    damping: 20,
    mass: 1.2,
    stiffness: 100,
  } as WithSpringConfig,
};

export const TIMING_SPECS = {
  fluid: {
    duration: 350,
    easing: Easing.bezier(0.25, 1, 0.5, 1),
  } as WithTimingConfig,
  linear: {
    duration: 200,
    easing: Easing.linear,
  } as WithTimingConfig,
};
