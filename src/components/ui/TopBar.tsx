import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { SPRING_SPECS } from '../../constants/motion';

interface TopBarProps {
  onSearch?: (text: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearch }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Animation values for the search input expansion
  const searchProgress = useSharedValue(0); // 0 = closed, 1 = open

  const handleOpenSearch = () => {
    setIsSearchActive(true);
    searchProgress.value = withSpring(1, SPRING_SPECS.snappy, (finished) => {
      if (finished && inputRef.current) {
        runOnJS(Keyboard.dismiss)(); // Reset keyboard state
        // Focus the input on JS thread
        runOnJS((ref: any) => ref.current?.focus())(inputRef);
      }
    });
  };

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    searchProgress.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(setIsSearchActive)(false);
        runOnJS(setSearchText)('');
        if (onSearch) {
          runOnJS(onSearch)('');
        }
      }
    });
  };

  const handleChangeText = (text: string) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  // Animated styles for sliding/expanding search bar
  const searchOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: searchProgress.value,
      transform: [
        { translateX: (1 - searchProgress.value) * 50 },
        { scaleX: searchProgress.value }
      ],
    };
  });

  const headerContentStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - searchProgress.value,
      transform: [{ scale: 1 - searchProgress.value * 0.1 }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Default TopBar Content (Logo + Brand + Search Trigger) */}
      <Animated.View style={[styles.headerContent, headerContentStyle]} pointerEvents={isSearchActive ? 'none' : 'auto'}>
        <View style={styles.brandContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>CONECTAE</Text>
        </View>

        <TouchableOpacity
          onPress={handleOpenSearch}
          style={styles.iconButton}
          activeOpacity={0.6}
        >
          <Feather name="search" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Expandable Search Overlay */}
      {isSearchActive && (
        <Animated.View style={[styles.searchOverlay, searchOverlayStyle]}>
          <Feather name="search" size={20} color={COLORS.inputIcon} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            placeholder="Buscar..."
            placeholderTextColor={COLORS.inputPlaceholder}
            value={searchText}
            onChangeText={handleChangeText}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <TouchableOpacity
            onPress={handleCloseSearch}
            style={styles.closeButton}
            activeOpacity={0.6}
          >
            <Feather name="x" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: '100%',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 22, 32, 0.06)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: COLORS.inputText,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
