import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { TopBar } from './ui/TopBar';
import { NavBar } from './ui/NavBar';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';
import { HomeScreen, PostItem } from './HomeScreen';
import { CreatePostScreen } from './CreatePostScreen';
import { ProfileScreen } from './ProfileScreen';
import { SettingsScreen } from './SettingsScreen';

interface MainScreenProps {
  onLogout: () => void;
}

const INITIAL_POSTS: PostItem[] = [
  {
    id: '1',
    author: 'Otávio Emanoel',
    role: 'Desenvolvedor React Native',
    avatarColor: '#121620',
    time: 'Há 15 min',
    content: 'Acabei de finalizar o protótipo da nova interface do CONECTAE! O efeito de LiquidGlass na NavBar ficou extremamente fluido e as transições de tela rodam a 60 FPS cravados. O que acharam da paleta de cores? 🚀📱',
    image: null,
    likes: 24,
    comments: 8,
    shares: 3,
    tags: ['ReactNative', 'UXDesign', 'Reanimated', 'LiquidGlass'],
  },
  {
    id: '2',
    author: 'Marina Silva',
    role: 'Product Designer @ DesignLab',
    avatarColor: '#E11D48',
    time: 'Há 2 horas',
    content: 'Dica rápida de UX: Em interfaces mobile, dê prioridade a feedbacks táteis e micro-animações nas áreas onde o polegar alcança mais facilmente. Uma navbar com efeito de mola suave aumenta o engajamento em até 30%!',
    image: null,
    likes: 85,
    comments: 18,
    shares: 12,
    tags: ['UXUI', 'MobileDesign', 'ProductDesign', 'Dicas'],
  },
  {
    id: '3',
    author: 'Bruno Rocha',
    role: 'Tech Lead @ TechCorp',
    avatarColor: '#2563EB',
    time: 'Há 5 horas',
    content: 'Estamos contratando Desenvolvedores React Native (Pleno/Sênior) para atuar em projetos globais de impacto. Requisitos principais: domínio de TypeScript, Reanimated e boas práticas de acessibilidade. Vaga 100% remota. Interessados, enviem DM!',
    image: null,
    likes: 42,
    comments: 7,
    shares: 15,
    tags: ['Vagas', 'ReactNative', 'TypeScript', 'RemoteJobs'],
  },
];

export const MainScreen: React.FC<MainScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Home, 1 = Post, 2 = Profile
  const [profileSubScreen, setProfileSubScreen] = useState<'profile' | 'settings'>('profile');
  const [settingsSection, setSettingsSection] = useState<'edit' | 'notifications' | 'privacy'>('edit');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);

  // Dynamic user profile fields
  const [profileName, setProfileName] = useState('Otávio Emanoel');
  const [profileRole, setProfileRole] = useState('Desenvolvedor React Native');
  const [profileBio, setProfileBio] = useState('Desenvolvedor React Native | Especialista em UX Fluido');

  const handleCreatePost = (text: string, tags: string[], image: string | null) => {
    const newPost: PostItem = {
      id: String(Date.now()),
      author: profileName,
      role: profileRole,
      avatarColor: '#121620',
      time: 'Agora mesmo',
      content: text,
      image: image,
      likes: 0,
      comments: 0,
      shares: 0,
      tags: tags,
    };
    setPosts(prev => [newPost, ...prev]);
    setActiveTab(0); // Redirect to Home feed
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    if (index !== 2) {
      setProfileSubScreen('profile'); // Reset settings view if leaving tab
    }
  };

  const handleNavigateToSettings = (section: 'edit' | 'notifications' | 'privacy') => {
    setSettingsSection(section);
    setProfileSubScreen('settings');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0:
        return <HomeScreen posts={posts} searchQuery={searchQuery} />;
      case 1:
        return <CreatePostScreen onSubmitPost={handleCreatePost} />;
      case 2:
        if (profileSubScreen === 'settings') {
          return (
            <SettingsScreen
              activeSection={settingsSection}
              profileData={{ name: profileName, role: profileRole, bio: profileBio }}
              onSaveProfile={({ name, role, bio }) => {
                setProfileName(name);
                setProfileRole(role);
                setProfileBio(bio);
              }}
              onBack={() => setProfileSubScreen('profile')}
              onLogout={onLogout}
            />
          );
        }
        return (
          <ProfileScreen
            profileData={{ name: profileName, role: profileRole, bio: profileBio }}
            onNavigateToSettings={handleNavigateToSettings}
            onLogout={onLogout}
          />
        );
      default:
        return null;
    }
  };

  const isSettingsActive = activeTab === 2 && profileSubScreen === 'settings';

  return (
    <SafeAreaView style={styles.container}>
      {/* Render TopBar only if not on Settings sub-screen */}
      {!isSettingsActive && (
        <TopBar 
          onSearch={(text) => setSearchQuery(text)} 
          rightIconType={activeTab === 2 ? 'menu' : 'search'}
          onMenuPress={() => handleNavigateToSettings('edit')}
        />
      )}

      {/* Main Content Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <AnimateEntrance 
          key={`tab-view-${activeTab}-${profileSubScreen}`} 
          preset="fade" 
          duration={350} 
          style={styles.tabContentWrapper}
        >
          {renderActiveTabContent()}
        </AnimateEntrance>
      </KeyboardAvoidingView>

      {/* Bottom Bar */}
      <NavBar activeIndex={activeTab} onChangeTab={handleTabChange} />
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
});
