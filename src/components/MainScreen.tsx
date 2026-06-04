import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { TopBar } from './ui/TopBar';
import { NavBar } from './ui/NavBar';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';
import { HomeScreen } from './HomeScreen';
import { CreatePostScreen } from './CreatePostScreen';
import { ProfileScreen } from './ProfileScreen';

interface MainScreenProps {
  onLogout: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Home, 1 = Post, 2 = Profile
  const [searchQuery, setSearchQuery] = useState('');

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0:
        return <HomeScreen searchQuery={searchQuery} />;
      case 1:
        return (
          <CreatePostScreen
            onSubmitPost={(text, tags) => {
              console.log('Post submitted:', text, tags);
              setActiveTab(0); // Redirect back to Home feed on publish
            }}
          />
        );
      case 2:
        return <ProfileScreen onLogout={onLogout} />;
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
        <AnimateEntrance 
          key={`tab-view-${activeTab}`} 
          preset="fade" 
          duration={350} 
          style={styles.tabContentWrapper}
        >
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
});
