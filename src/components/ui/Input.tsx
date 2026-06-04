import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TextInputProps, 
  TouchableOpacity, 
  ViewStyle,
  Platform
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TIMING_SPECS } from '../../constants/motion';

interface InputProps extends TextInputProps {
  label: string;
  iconName?: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  iconName,
  isPassword = false,
  containerStyle,
  error,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = () => {
    focusAnim.value = withTiming(1, TIMING_SPECS.fluid);
  };

  const handleBlur = () => {
    focusAnim.value = withTiming(0, TIMING_SPECS.fluid);
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [COLORS.inputBorder, COLORS.primary]
    );

    const shadowOpacity = withTiming(focusAnim.value * 0.05, TIMING_SPECS.fluid);

    return {
      borderColor,
      shadowOpacity,
      transform: [
        {
          translateY: withTiming(focusAnim.value * -2, TIMING_SPECS.fluid),
        },
      ],
    };
  });

  const isMultiline = rest.multiline;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Input Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input Field Container */}
      <Animated.View style={[
        styles.container, 
        isMultiline && styles.containerMultiline,
        animatedContainerStyle
      ]}>
        {iconName && (
          <Feather 
            name={iconName} 
            size={20} 
            color={COLORS.inputIcon} 
            style={[styles.leadingIcon, isMultiline && styles.leadingIconMultiline]} 
          />
        )}
        
        <TextInput
          style={[styles.input, isMultiline && styles.inputMultiline, rest.style]}
          placeholderTextColor={COLORS.inputPlaceholder}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.trailingIcon}
            activeOpacity={0.6}
          >
            <Feather 
              name={isPasswordVisible ? 'eye-off' : 'eye'} 
              size={20} 
              color={COLORS.inputIcon} 
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1.5,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 1,
  },
  containerMultiline: {
    height: undefined,
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  leadingIcon: {
    marginRight: 12,
  },
  leadingIconMultiline: {
    marginTop: Platform.OS === 'ios' ? 2 : 4,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.inputText,
    fontSize: 16,
    fontWeight: '500',
  },
  inputMultiline: {
    height: undefined,
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  trailingIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
