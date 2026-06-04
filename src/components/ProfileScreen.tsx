import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';

interface ProfileScreenProps {
  onLogout?: () => void;
  onNavigateToSettings: (section: 'edit' | 'notifications' | 'privacy') => void;
  profileData: { name: string; role: string; bio: string };
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  onLogout, 
  onNavigateToSettings,
  profileData
}) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Profile Info Header Card */}
      <AnimateEntrance preset="scale" delay={100}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileAvatarContainer}>
            <View style={styles.profileAvatar}>
              <Feather name="user" size={48} color={COLORS.white} />
            </View>
            <View style={styles.profileVerifyBadge}>
              <Feather name="check" size={12} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.profileName}>{profileData.name}</Text>
          <Text style={styles.profileRole}>{profileData.role}</Text>
          <Text style={styles.profileBio}>{profileData.bio}</Text>

          {/* Profile Statistics */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>142</Text>
              <Text style={styles.statLabel}>Conexões</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>28</Text>
              <Text style={styles.statLabel}>Publicações</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1.2K</Text>
              <Text style={styles.statLabel}>Visitas</Text>
            </View>
          </View>
        </View>
      </AnimateEntrance>

      {/* Settings / Actions List */}
      <View style={styles.settingsSection}>
        <AnimateEntrance preset="slideUp" delay={200}>
          <TouchableOpacity onPress={() => onNavigateToSettings('edit')} style={styles.settingItem} activeOpacity={0.6}>
            <View style={styles.settingLeft}>
              <Feather name="edit-3" size={20} color={COLORS.primary} />
              <Text style={styles.settingText}>Editar Perfil</Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AnimateEntrance>

        <AnimateEntrance preset="slideUp" delay={275}>
          <TouchableOpacity onPress={() => onNavigateToSettings('notifications')} style={styles.settingItem} activeOpacity={0.6}>
            <View style={styles.settingLeft}>
              <Feather name="bell" size={20} color={COLORS.primary} />
              <Text style={styles.settingText}>Configurações de Notificações</Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AnimateEntrance>

        <AnimateEntrance preset="slideUp" delay={350}>
          <TouchableOpacity onPress={() => onNavigateToSettings('privacy')} style={styles.settingItem} activeOpacity={0.6}>
            <View style={styles.settingLeft}>
              <Feather name="shield" size={20} color={COLORS.primary} />
              <Text style={styles.settingText}>Privacidade e Segurança</Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AnimateEntrance>

        {/* Log Out Action */}
        <AnimateEntrance preset="slideUp" delay={425}>
          <TouchableOpacity 
            onPress={onLogout} 
            style={[styles.settingItem, styles.logoutItem]} 
            activeOpacity={0.6}
          >
            <View style={styles.settingLeft}>
              <Feather name="log-out" size={20} color={COLORS.danger} />
              <Text style={[styles.settingText, styles.logoutText]}>Sair da Conta</Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AnimateEntrance>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileVerifyBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background, // verification accent badge
    borderWidth: 2,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileRole: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  profileBio: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(18, 22, 32, 0.06)',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(18, 22, 32, 0.08)',
  },
  settingsSection: {
    gap: 12,
  },
  settingItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.04)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  logoutItem: {
    borderColor: 'rgba(239, 68, 68, 0.08)',
  },
  logoutText: {
    color: COLORS.danger,
  },
});
