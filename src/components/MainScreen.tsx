import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TopBar } from './ui/TopBar';
import { NavBar } from './ui/NavBar';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const MainScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Home, 1 = Post, 2 = Profile
  const [searchQuery, setSearchQuery] = useState('');
  const [postText, setPostText] = useState('');
  const [postTitle, setPostTitle] = useState('');

  // Sample data for Home Feed
  const feedItems = [
    {
      id: '1',
      title: 'Vaga: Desenvolvedor React Native',
      company: 'TechCorp Solutions',
      location: 'Remoto (São Paulo, Brasil)',
      salary: 'R$ 8.000 - R$ 11.000',
      time: 'Há 2 horas',
      tags: ['React Native', 'TypeScript', 'Reanimated'],
      author: 'Bruno Rocha',
      avatarColor: '#3B82F6',
    },
    {
      id: '2',
      title: 'Parceria de Negócios / Co-Founder',
      company: 'AppInc Hub',
      location: 'Híbrido (Curitiba, Brasil)',
      salary: 'Equity / Sociedade',
      time: 'Há 5 horas',
      tags: ['Startup', 'Negócios', 'UX Design'],
      author: 'Marina Silva',
      avatarColor: '#10B981',
    },
    {
      id: '3',
      title: 'Vaga: Product Designer Sênior',
      company: 'Designers & Co',
      location: 'Remoto',
      salary: 'R$ 12.000 - R$ 15.000',
      time: 'Há 1 dia',
      tags: ['Figma', 'UI/UX', 'Product Strategy'],
      author: 'Arthur Costa',
      avatarColor: '#F59E0B',
    },
  ];

  // Filtering feed items based on search query
  const filteredFeed = feedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderHomeFeed = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <AnimateEntrance preset="slideUp" delay={100}>
          <View style={styles.welcomeBanner}>
            <Text style={styles.bannerTitle}>Olá, Profissional!</Text>
            <Text style={styles.bannerSubtitle}>Encontre a sua próxima grande oportunidade hoje.</Text>
          </View>
        </AnimateEntrance>

        {/* Feed Cards list */}
        <View style={styles.feedList}>
          {filteredFeed.length > 0 ? (
            filteredFeed.map((item, idx) => (
              <AnimateEntrance key={item.id} preset="slideUp" delay={200 + idx * 100}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                      <Text style={styles.avatarText}>{item.author.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.cardHeaderMeta}>
                      <Text style={styles.cardAuthor}>{item.author}</Text>
                      <Text style={styles.cardTime}>{item.time}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardCompany}>{item.company}</Text>

                  <View style={styles.cardMetaRow}>
                    <View style={styles.metaIconText}>
                      <Feather name="map-pin" size={14} color={COLORS.textMuted} />
                      <Text style={styles.cardMetaText}>{item.location}</Text>
                    </View>
                    <View style={styles.metaIconText}>
                      <Feather name="dollar-sign" size={14} color={COLORS.textMuted} />
                      <Text style={styles.cardMetaText}>{item.salary}</Text>
                    </View>
                  </View>

                  <View style={styles.tagsContainer}>
                    {item.tags.map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <Button
                    title="Candidatar-se"
                    onPress={() => console.log('Apply to job', item.id)}
                    style={styles.cardBtn}
                    textStyle={styles.cardBtnText}
                  />
                </View>
              </AnimateEntrance>
            ))
          ) : (
            <AnimateEntrance preset="fade">
              <View style={styles.emptyContainer}>
                <Feather name="alert-circle" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Nenhuma oportunidade encontrada.</Text>
              </View>
            </AnimateEntrance>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderCreatePost = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AnimateEntrance preset="slideUp" delay={100}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Compartilhar Oportunidade</Text>
            <Text style={styles.formSubtitle}>Divulgue vagas ou parcerias para sua rede.</Text>

            <View style={styles.formFieldSpacer}>
              <Input
                label="Título do Post / Vaga"
                placeholder="Ex: Contrata-se Front-end Dev"
                iconName="briefcase"
                value={postTitle}
                onChangeText={setPostTitle}
              />
            </View>

            <View style={styles.formFieldSpacer}>
              <Input
                label="Descrição"
                placeholder="Descreva a oportunidade em detalhes..."
                iconName="file-text"
                value={postText}
                onChangeText={setPostText}
                style={styles.textArea}
              />
            </View>

            <Button
              title="Publicar Oportunidade"
              onPress={() => {
                console.log('Post published:', postTitle, postText);
                setPostTitle('');
                setPostText('');
                setActiveTab(0); // Redirect to Feed
              }}
              icon={<Feather name="send" size={18} color={COLORS.white} />}
              style={styles.publishBtn}
            />
          </View>
        </AnimateEntrance>
      </ScrollView>
    );
  };

  const renderProfile = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
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

            <Text style={styles.profileName}>Otávio Emanoel</Text>
            <Text style={styles.profileBio}>Desenvolvedor React Native | Especialista em UX Fluido</Text>

            {/* Profile Statistics */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>142</Text>
                <Text style={styles.statLabel}>Conexões</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>28</Text>
                <Text style={styles.statLabel}>Propostas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1.2K</Text>
                <Text style={styles.statLabel}>Visitas</Text>
              </View>
            </View>
          </View>
        </AnimateEntrance>

        {/* Profile Settings/Details Lists */}
        <View style={styles.settingsSection}>
          <AnimateEntrance preset="slideUp" delay={200}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="edit-3" size={20} color={COLORS.primary} />
                <Text style={styles.settingText}>Editar Informações do Perfil</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </View>
          </AnimateEntrance>

          <AnimateEntrance preset="slideUp" delay={275}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="briefcase" size={20} color={COLORS.primary} />
                <Text style={styles.settingText}>Minhas Vagas Cadastradas</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </View>
          </AnimateEntrance>

          <AnimateEntrance preset="slideUp" delay={350}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="bell" size={20} color={COLORS.primary} />
                <Text style={styles.settingText}>Notificações</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </View>
          </AnimateEntrance>
        </View>
      </ScrollView>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderHomeFeed();
      case 1:
        return renderCreatePost();
      case 2:
        return renderProfile();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <TopBar onSearch={(text) => setSearchQuery(text)} />

      {/* Main Content Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <AnimateEntrance key={`tab-view-${activeTab}`} preset="fade" duration={350} style={styles.tabContentWrapper}>
          {renderActiveTabContent()}
        </AnimateEntrance>
      </KeyboardAvoidingView>

      {/* Bottom Bar */}
      <NavBar activeIndex={activeTab} onChangeTab={(idx) => setActiveTab(idx)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFC',
    paddingBottom: 86, // Nav bar spacer
  },
  tabContentWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  welcomeBanner: {
    backgroundColor: COLORS.background, // Yellow accent banner
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  feedList: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  cardHeaderMeta: {
    flex: 1,
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardCompany: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  cardMetaRow: {
    flexDirection: 'column',
    gap: 6,
    marginTop: 12,
    marginBottom: 14,
  },
  metaIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  cardBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  cardBtnText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 24,
  },
  formFieldSpacer: {
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  publishBtn: {
    marginTop: 8,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
    elevation: 3,
    marginBottom: 20,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileVerifyBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.background, // neon yellow verification badge
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
  profileBio: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(18, 22, 32, 0.06)',
    paddingTop: 20,
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
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(18, 22, 32, 0.08)',
  },
  settingsSection: {
    gap: 12,
  },
  settingItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.04)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
