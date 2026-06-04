import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text,
  SafeAreaView, 
  Platform, 
  KeyboardAvoidingView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeInUp,
  FadeOutUp
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { TopBar } from './ui/TopBar';
import { NavBar } from './ui/NavBar';
import { COLORS } from '../constants/colors';
import { GestureOverlay, GestureNavEvent } from './GestureOverlay';
import { AnimateEntrance } from './ui/AnimateEntrance';
import { HomeScreen, PostItem, CommentItem } from './HomeScreen';
import { CreatePostScreen } from './CreatePostScreen';
import { ProfileScreen } from './ProfileScreen';
import { SettingsScreen } from './SettingsScreen';
import { PostDetailScreen } from './PostDetailScreen';
import { CameraScreen } from './CameraScreen';
import { SPRING_SPECS } from '../constants/motion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    comments: 2,
    shares: 3,
    tags: ['ReactNative', 'UXDesign', 'Reanimated', 'LiquidGlass'],
    commentsList: [
      {
        id: 'c1',
        author: 'Bruno Rocha',
        avatarColor: '#2563EB',
        time: 'Há 5 min',
        content: 'Ficou muito bom, parabéns pela fluidez!',
      },
      {
        id: 'c2',
        author: 'Marina Silva',
        avatarColor: '#E11D48',
        time: 'Há 10 min',
        content: 'Sensacional! As animações estão lisas e super responsivas.',
      }
    ]
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
    comments: 1,
    shares: 12,
    tags: ['UXUI', 'MobileDesign', 'ProductDesign', 'Dicas'],
    commentsList: [
      {
        id: 'c3',
        author: 'Otávio Emanoel',
        avatarColor: '#121620',
        time: 'Há 1 hora',
        content: 'Totalmente de acordo! A experiência do usuário muda completamente.',
      }
    ]
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
    comments: 1,
    shares: 15,
    tags: ['Vagas', 'ReactNative', 'TypeScript', 'RemoteJobs'],
    commentsList: [
      {
        id: 'c4',
        author: 'Marina Silva',
        avatarColor: '#E11D48',
        time: 'Há 4 horas',
        content: 'Enviei DM com o currículo de uma indicação excelente!',
      }
    ]
  },
];

export const MainScreen: React.FC<MainScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Home, 1 = Post, 2 = Profile
  const [profileSubScreen, setProfileSubScreen] = useState<'profile' | 'settings'>('profile');
  const [settingsSection, setSettingsSection] = useState<'edit' | 'notifications' | 'privacy'>('edit');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  
  // Navigation states for details and sidebar drawer
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarProgress = useSharedValue(0);

  // Camera state & shared values
  // isCameraActive tracks if the camera was intentionally opened, but the
  // WebView always stays mounted so FaceMesh doesn't reload between opens.
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraEverOpened, setCameraEverOpened] = useState(false);
  const cameraProgress = useSharedValue(0);
  const cameraStartX = useSharedValue(0);

  // Toast state for gesture confirmation feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [scrollTrigger, setScrollTrigger] = useState<{ direction: 'up' | 'down'; timestamp: number } | null>(null);

  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 1500);
  };

  const handleGestureNavigation = (gesture: GestureNavEvent) => {
    if (isCameraActive) return;

    // Handle scroll gestures
    if (gesture === 'scroll_up' || gesture === 'scroll_down') {
      const direction = gesture === 'scroll_up' ? 'up' : 'down';
      setScrollTrigger({ direction, timestamp: Date.now() });
      showToast(gesture === 'scroll_up' ? '✊ Rolando para Cima' : '🖐️ Rolando para Baixo');
      return;
    }

    let targetTab = activeTab;
    let desc = '';

    switch (gesture) {
      case 'tab0':
        targetTab = 0;
        desc = '☝️ Home';
        break;
      case 'tab1':
        targetTab = 1;
        desc = '✌️ Novo Post';
        break;
      case 'tab2':
        targetTab = 2;
        desc = '🤟 Perfil';
        break;
      case 'next':
        targetTab = (activeTab + 1) % 3;
        desc = '👈 Próxima Aba';
        break;
      case 'prev':
        targetTab = (activeTab - 1 + 3) % 3;
        desc = '👉 Aba Anterior';
        break;
    }

    // Always close details to show tab content
    setSelectedPostId(null);

    if (targetTab !== activeTab) {
      handleTabChange(targetTab);
    } else {
      if (targetTab === 2 && profileSubScreen === 'settings') {
        setProfileSubScreen('profile');
      }
    }

    showToast(`Gesto: ${desc}`);
  };

  // Dynamic user profile fields
  const [profileName, setProfileName] = useState('Otávio Emanoel');
  const [profileRole, setProfileRole] = useState('Desenvolvedor React Native');
  const [profileBio, setProfileBio] = useState('Desenvolvedor React Native | Especialista em UX Fluido');

  const openSidebar = () => {
    setSidebarVisible(true);
    sidebarProgress.value = withSpring(1, SPRING_SPECS.snappy);
  };

  const closeSidebar = (callback?: () => void) => {
    sidebarProgress.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(setSidebarVisible)(false);
        if (callback) {
          runOnJS(callback)();
        }
      }
    });
  };

  const handleSidebarOptionPress = (section: 'edit' | 'notifications' | 'privacy') => {
    closeSidebar(() => {
      handleNavigateToSettings(section);
    });
  };

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
      commentsList: [],
    };
    setPosts(prev => [newPost, ...prev]);
    setActiveTab(0); // Redirect to Home feed
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const newComment: CommentItem = {
      id: String(Date.now()),
      author: profileName,
      avatarColor: '#121620',
      time: 'Agora mesmo',
      content: commentText,
    };
    
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const list = post.commentsList || [];
        return {
          ...post,
          comments: list.length + 1,
          commentsList: [...list, newComment],
        };
      }
      return post;
    }));
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

  const handleCloseCamera = () => {
    cameraProgress.value = withTiming(0, { duration: 240 }, (finished) => {
      if (finished) {
        runOnJS(setIsCameraActive)(false);
      }
    });
  };

  // Pan gesture to swipe horizontal: swipe left to open camera, swipe right to close
  const cameraPanGesture = Gesture.Pan()
    .enabled(activeTab === 0 && selectedPostId === null && !sidebarVisible)
    .activeOffsetX([-10, 10])
    .onStart(() => {
      cameraStartX.value = cameraProgress.value;
      if (cameraStartX.value === 0) {
        runOnJS(setIsCameraActive)(true);
        runOnJS(setCameraEverOpened)(true);
      }
    })
    .onUpdate((event) => {
      if (cameraStartX.value === 0) {
        // Closed, dragging left (negative translationX) to slide camera in
        const progress = -event.translationX / SCREEN_WIDTH;
        cameraProgress.value = Math.max(0, Math.min(1, progress));
      } else {
        // Open, dragging right (positive translationX) to slide camera out
        const progress = 1 - event.translationX / SCREEN_WIDTH;
        cameraProgress.value = Math.max(0, Math.min(1, progress));
      }
    })
    .onEnd((event) => {
      const progress = cameraProgress.value;
      const velocityX = event.velocityX;

      if (cameraStartX.value === 0) {
        // Try opening camera
        if (progress > 0.35 || velocityX < -500) {
          cameraProgress.value = withSpring(1, SPRING_SPECS.snappy);
          runOnJS(setIsCameraActive)(true);
          runOnJS(setCameraEverOpened)(true);
        } else {
          cameraProgress.value = withTiming(0, { duration: 200 }, (finished) => {
            if (finished) {
              runOnJS(setIsCameraActive)(false);
            }
          });
        }
      } else {
        // Try closing camera
        if (progress < 0.65 || velocityX > 500) {
          cameraProgress.value = withSpring(0, SPRING_SPECS.snappy);
          runOnJS(setIsCameraActive)(false);
        } else {
          cameraProgress.value = withTiming(1, { duration: 200 }, (finished) => {
            if (finished) {
              runOnJS(setIsCameraActive)(true);
            }
          });
        }
      }
    });

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <HomeScreen 
            posts={posts} 
            searchQuery={searchQuery} 
            onPostPress={(id) => setSelectedPostId(id)} 
            scrollTrigger={scrollTrigger}
          />
        );
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
              scrollTrigger={scrollTrigger}
            />
          );
        }
        return (
          <ProfileScreen
            profileData={{ name: profileName, role: profileRole, bio: profileBio }}
            userPosts={posts.filter(p => p.author === profileName)}
            onPostPress={(id) => setSelectedPostId(id)}
            scrollTrigger={scrollTrigger}
          />
        );
      default:
        return null;
    }
  };

  const isSettingsActive = activeTab === 2 && profileSubScreen === 'settings';
  const showTopBar = !isSettingsActive && selectedPostId === null;
  const showNavBar = selectedPostId === null;

  // Sidebar Animated Styles
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: sidebarProgress.value,
    };
  });

  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: (1 - sidebarProgress.value) * 280 }
      ],
    };
  });

  // Camera Slide Style
  const cameraStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: (1 - cameraProgress.value) * SCREEN_WIDTH }
      ],
    };
  });

  // TopBar Slide Up Out of View
  const topBarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -cameraProgress.value * 80 }
      ],
    };
  });

  // NavBar Slide Down Out of View
  const navBarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: cameraProgress.value * 120 }
      ],
    };
  });

  // Find selected post details
  const selectedPost = posts.find(p => p.id === selectedPostId);

  return (
    <GestureDetector gesture={cameraPanGesture}>
      <SafeAreaView style={styles.container}>
        {/* Render TopBar only if header should be visible */}
        {showTopBar && (
          <Animated.View style={topBarStyle}>
            <TopBar 
              onSearch={(text) => setSearchQuery(text)} 
              rightIconType={activeTab === 2 ? 'menu' : 'search'}
              onMenuPress={openSidebar}
            />
          </Animated.View>
        )}

        {/* Main Content Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[
            styles.contentContainer,
            !showNavBar && { paddingBottom: 0 } // Remove spacer if nav bar is hidden
          ]}
        >
          {selectedPost ? (
            <AnimateEntrance 
              key={`post-detail-${selectedPostId}`} 
              preset="fade" 
              duration={300} 
              style={styles.tabContentWrapper}
            >
              <PostDetailScreen 
                post={selectedPost}
                onBack={() => setSelectedPostId(null)}
                onAddComment={handleAddComment}
                scrollTrigger={scrollTrigger}
              />
            </AnimateEntrance>
          ) : (
            <AnimateEntrance 
              key={`tab-view-${activeTab}-${profileSubScreen}`} 
              preset="fade" 
              duration={350} 
              style={styles.tabContentWrapper}
            >
              {renderActiveTabContent()}
            </AnimateEntrance>
          )}
        </KeyboardAvoidingView>

        {/* Bottom Bar */}
        {showNavBar && (
          <Animated.View style={navBarStyle}>
            <NavBar activeIndex={activeTab} onChangeTab={handleTabChange} />
          </Animated.View>
        )}

        {/* Sidebar Configurations Drawer */}
        {sidebarVisible && (
          <View style={StyleSheet.absoluteFill}>
            {/* Backdrop overlay */}
            <Animated.View style={[styles.sidebarBackdrop, backdropStyle]}>
              <TouchableOpacity 
                style={StyleSheet.absoluteFillObject} 
                activeOpacity={1} 
                onPress={() => closeSidebar()} 
              />
            </Animated.View>

            {/* Drawer sheet */}
            <Animated.View style={[styles.sidebarDrawer, drawerStyle]}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Ajustes</Text>
                <TouchableOpacity onPress={() => closeSidebar()} style={styles.closeButton} activeOpacity={0.6}>
                  <Feather name="x" size={24} color={COLORS.background} />
                </TouchableOpacity>
              </View>

              {/* Profile Mini Header */}
              <View style={styles.sidebarProfileHeader}>
                <View style={styles.sidebarAvatar}>
                  <Feather name="user" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.sidebarProfileInfo}>
                  <Text style={styles.sidebarProfileName} numberOfLines={1}>{profileName}</Text>
                  <Text style={styles.sidebarProfileRole} numberOfLines={1}>{profileRole}</Text>
                </View>
              </View>

              {/* Options List */}
              <View style={styles.sidebarOptions}>
                <TouchableOpacity 
                  onPress={() => handleSidebarOptionPress('edit')}
                  style={styles.sidebarOptionItem} 
                  activeOpacity={0.6}
                >
                  <Feather name="edit-3" size={18} color={COLORS.background} style={styles.sidebarOptionIcon} />
                  <Text style={styles.sidebarOptionText}>Editar Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleSidebarOptionPress('notifications')}
                  style={styles.sidebarOptionItem} 
                  activeOpacity={0.6}
                >
                  <Feather name="bell" size={18} color={COLORS.background} style={styles.sidebarOptionIcon} />
                  <Text style={styles.sidebarOptionText}>Configurações de Notificações</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleSidebarOptionPress('privacy')}
                  style={styles.sidebarOptionItem} 
                  activeOpacity={0.6}
                >
                  <Feather name="shield" size={18} color={COLORS.background} style={styles.sidebarOptionIcon} />
                  <Text style={styles.sidebarOptionText}>Privacidade e Segurança</Text>
                </TouchableOpacity>

                <View style={styles.sidebarDivider} />

                <TouchableOpacity 
                  onPress={() => {
                    closeSidebar(() => {
                      onLogout();
                    });
                  }}
                  style={[styles.sidebarOptionItem, styles.sidebarLogoutItem]} 
                  activeOpacity={0.6}
                >
                  <Feather name="log-out" size={18} color={COLORS.danger} style={styles.sidebarOptionIcon} />
                  <Text style={[styles.sidebarOptionText, styles.sidebarLogoutText]}>Sair da Conta</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Camera Screen — always mounted so WebView/FaceMesh stay in memory.
            Hidden when not active via translateX (off-screen to the right).
            pointer-events blocked when not active to prevent touch-through. */}
        {cameraEverOpened && (
          <Animated.View
            style={[StyleSheet.absoluteFillObject, cameraStyle, { zIndex: 100 }]}
            pointerEvents={isCameraActive ? 'auto' : 'none'}
          >
            <CameraScreen onClose={handleCloseCamera} />
          </Animated.View>
        )}

        {/* Gesture Recognition Layer (runs front camera in background) */}
        <GestureOverlay 
          onGesture={handleGestureNavigation} 
          paused={isCameraActive} 
        />

        {/* Floating gesture feedback toast */}
        {toastMessage && (
          <Animated.View 
            entering={FadeInUp.duration(200)} 
            exiting={FadeOutUp.duration(200)} 
            style={styles.toastContainer}
          >
            <View style={styles.toastInner}>
              <Feather name="activity" size={16} color={COLORS.background} style={{ marginRight: 8 }} />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </GestureDetector>
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
  // Sidebar Styles
  sidebarBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 22, 32, 0.4)',
    zIndex: 99,
  },
  sidebarDrawer: {
    width: 280,
    height: '100%',
    backgroundColor: COLORS.primary, // Dark Slate Navy theme
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  sidebarAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background, // Yellow highlight avatar
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sidebarProfileInfo: {
    flex: 1,
  },
  sidebarProfileName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  sidebarProfileRole: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '600',
    marginTop: 2,
  },
  sidebarOptions: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
    gap: 6,
  },
  sidebarOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sidebarOptionIcon: {
    marginRight: 14,
  },
  sidebarOptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '700',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  sidebarLogoutItem: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  sidebarLogoutText: {
    color: COLORS.danger,
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    alignSelf: 'center',
    zIndex: 9999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 22, 32, 0.9)', // Slate Navy translucent
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toastText: {
    color: '#F7FF00', // Electric yellow
    fontSize: 14,
    fontWeight: '800',
  },
});
