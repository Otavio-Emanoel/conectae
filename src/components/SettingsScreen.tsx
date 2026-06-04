import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout?: () => void;
}

// Custom Reanimated Switch component for a premium native feel
const CustomSwitch: React.FC<{ value: boolean; onValueChange: () => void }> = ({ value, onValueChange }) => {
  const switchTranslate = useSharedValue(value ? 20 : 2);

  useEffect(() => {
    switchTranslate.value = withTiming(value ? 20 : 2, { duration: 180 });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      switchTranslate.value,
      [2, 20],
      ['rgba(18, 22, 32, 0.1)', COLORS.background] // slides to active yellow
    );
    return { backgroundColor };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: switchTranslate.value }],
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onValueChange}>
      <Animated.View style={[styles.switchTrack, trackStyle]}>
        <Animated.View style={[styles.switchThumb, thumbStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLogout }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkModeSim, setDarkModeSim] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header with Back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.6}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Account preferences */}
        <AnimateEntrance preset="slideUp" delay={100}>
          <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
          <View style={styles.sectionCard}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="bell" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Notificações Push</Text>
              </View>
              <CustomSwitch value={pushEnabled} onValueChange={() => setPushEnabled(!pushEnabled)} />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="moon" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Modo Escuro (Simulado)</Text>
              </View>
              <CustomSwitch value={darkModeSim} onValueChange={() => setDarkModeSim(!darkModeSim)} />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="volume-2" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Efeitos Sonoros</Text>
              </View>
              <CustomSwitch value={soundsEnabled} onValueChange={() => setSoundsEnabled(!soundsEnabled)} />
            </View>
          </View>
        </AnimateEntrance>

        {/* Account settings */}
        <AnimateEntrance preset="slideUp" delay={200}>
          <Text style={styles.sectionTitle}>CONTA & SEGURANÇA</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.rowButton} activeOpacity={0.6}>
              <View style={styles.rowLeft}>
                <Feather name="lock" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Alterar Senha</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.rowButton} activeOpacity={0.6}>
              <View style={styles.rowLeft}>
                <Feather name="eye-off" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Contas Bloqueadas</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.rowButton} activeOpacity={0.6}>
              <View style={styles.rowLeft}>
                <Feather name="info" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Termos de Serviço</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </AnimateEntrance>

        {/* Logout Action */}
        {onLogout && (
          <AnimateEntrance preset="slideUp" delay={300}>
            <TouchableOpacity 
              onPress={onLogout} 
              style={[styles.sectionCard, styles.logoutCard]} 
              activeOpacity={0.6}
            >
              <View style={styles.rowLeft}>
                <Feather name="log-out" size={20} color={COLORS.danger} style={styles.rowIcon} />
                <Text style={[styles.rowText, styles.logoutText]}>Sair da Conta</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </AnimateEntrance>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 22, 32, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  logoutCard: {
    paddingVertical: 16,
    borderColor: 'rgba(239, 68, 68, 0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 12,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  logoutText: {
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(18, 22, 32, 0.06)',
    width: '100%',
  },
  switchTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});
