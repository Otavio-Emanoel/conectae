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
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout?: () => void;
  activeSection?: 'edit' | 'notifications' | 'privacy';
  profileData?: { name: string; role: string; bio: string };
  onSaveProfile?: (data: { name: string; role: string; bio: string }) => void;
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
      ['rgba(18, 22, 32, 0.1)', COLORS.background]
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

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  onBack, 
  onLogout,
  activeSection = 'edit',
  profileData = { name: 'Otávio Emanoel', role: 'Desenvolvedor React Native', bio: 'Desenvolvedor React Native | Especialista em UX Fluido' },
  onSaveProfile
}) => {
  // Edit Profile Form States
  const [name, setName] = useState(profileData.name);
  const [role, setRole] = useState(profileData.role);
  const [bio, setBio] = useState(profileData.bio);

  // Notification Toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [activityEnabled, setActivityEnabled] = useState(true);

  // Privacy Toggles
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const [directMessages, setDirectMessages] = useState(true);

  const handleSaveProfile = () => {
    if (onSaveProfile) {
      onSaveProfile({ name, role, bio });
    }
    onBack();
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'edit':
        return (
          <AnimateEntrance preset="slideUp" delay={100}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionFormTitle}>Editar Detalhes do Perfil</Text>
              
              <View style={styles.fieldSpacer}>
                <Input
                  label="Nome Completo"
                  placeholder="Seu nome"
                  iconName="user"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.fieldSpacer}>
                <Input
                  label="Ocupação / Cargo"
                  placeholder="Ex: Desenvolvedor Front-end"
                  iconName="briefcase"
                  value={role}
                  onChangeText={setRole}
                />
              </View>

              <View style={styles.fieldSpacer}>
                <Input
                  label="Biografia Curta"
                  placeholder="Escreva algo sobre você..."
                  iconName="info"
                  value={bio}
                  onChangeText={setBio}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <Button
                title="Salvar Alterações"
                onPress={handleSaveProfile}
                icon={<Feather name="check" size={18} color={COLORS.white} />}
                style={styles.actionBtn}
              />
            </View>
          </AnimateEntrance>
        );

      case 'notifications':
        return (
          <AnimateEntrance preset="slideUp" delay={100}>
            <Text style={styles.groupHeader}>PREFERÊNCIAS DE ALERTAS</Text>
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
                  <Feather name="mail" size={20} color={COLORS.primary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Resumos por E-mail</Text>
                </View>
                <CustomSwitch value={emailEnabled} onValueChange={() => setEmailEnabled(!emailEnabled)} />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Feather name="volume-2" size={20} color={COLORS.primary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Efeitos Sonoros</Text>
                </View>
                <CustomSwitch value={soundsEnabled} onValueChange={() => setSoundsEnabled(!soundsEnabled)} />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Feather name="activity" size={20} color={COLORS.primary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Alertas de Atividade</Text>
                </View>
                <CustomSwitch value={activityEnabled} onValueChange={() => setActivityEnabled(!activityEnabled)} />
              </View>
            </View>
          </AnimateEntrance>
        );

      case 'privacy':
        return (
          <AnimateEntrance preset="slideUp" delay={100}>
            <Text style={styles.groupHeader}>VISIBILIDADE DA CONTA</Text>
            <View style={styles.sectionCard}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Feather name="lock" size={20} color={COLORS.primary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Perfil Privado</Text>
                </View>
                <CustomSwitch value={privateProfile} onValueChange={() => setPrivateProfile(!privateProfile)} />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Feather name="eye" size={20} color={COLORS.primary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Mostrar Status Online</Text>
                </View>
                <CustomSwitch value={showStatus} onValueChange={() => setShowStatus(!showStatus)} />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Feather name="message-square" size={20} color={COLORS.primary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Permitir DMs de Conexões</Text>
                </View>
                <CustomSwitch value={directMessages} onValueChange={() => setDirectMessages(!directMessages)} />
              </View>
            </View>

            <Text style={styles.groupHeader}>SEGURANÇA</Text>
            <View style={styles.sectionCard}>
              <TouchableOpacity style={styles.rowButton} activeOpacity={0.6}>
                <View style={styles.rowLeft}>
                  <Feather name="shield" size={20} color={COLORS.primary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Autenticação em Duas Etapas</Text>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
              
              <View style={styles.divider} />

              <TouchableOpacity style={styles.rowButton} activeOpacity={0.6}>
                <View style={styles.rowLeft}>
                  <Feather name="slash" size={20} color={COLORS.primary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Usuários Bloqueados</Text>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </AnimateEntrance>
        );
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'edit':
        return 'Editar Perfil';
      case 'notifications':
        return 'Notificações';
      case 'privacy':
        return 'Privacidade & Segurança';
      default:
        return 'Configurações';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.6}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getSectionTitle()}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderSectionContent()}

        {/* Log Out option listed at bottom of settings */}
        {onLogout && (
          <AnimateEntrance preset="slideUp" delay={250}>
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
  groupHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  sectionFormTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    paddingVertical: 16,
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
  fieldSpacer: {
    marginBottom: 4,
  },
  actionBtn: {
    marginTop: 10,
    marginBottom: 10,
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
