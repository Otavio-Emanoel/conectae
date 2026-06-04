import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';
import { PostCard, PostItem } from './HomeScreen';

interface ProfileScreenProps {
  profileData: { name: string; role: string; bio: string };
  userPosts: PostItem[];
  onPostPress: (postId: string) => void;
  scrollTrigger?: { direction: 'up' | 'down'; timestamp: number } | null;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  profileData,
  userPosts,
  onPostPress,
  scrollTrigger
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    if (scrollTrigger) {
      const delta = scrollTrigger.direction === 'down' ? 250 : -250;
      const targetY = Math.max(0, scrollOffsetRef.current + delta);
      scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    }
  }, [scrollTrigger]);
  return (
    <ScrollView 
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
      onScroll={(event) => {
        scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
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
              <Text style={styles.statNumber}>{userPosts.length}</Text>
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

      {/* User Posts Section */}
      <AnimateEntrance preset="slideUp" delay={200}>
        <Text style={styles.sectionTitle}>Minhas Publicações</Text>
      </AnimateEntrance>

      <View style={styles.postsContainer}>
        {userPosts.length > 0 ? (
          userPosts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              index={index} 
              onPress={() => onPostPress(post.id)}
            />
          ))
        ) : (
          <AnimateEntrance preset="fade" delay={300}>
            <View style={styles.emptyContainer}>
              <Feather name="edit-3" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Você ainda não fez nenhuma publicação.</Text>
            </View>
          </AnimateEntrance>
        )}
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
    marginBottom: 12,
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
    backgroundColor: COLORS.background,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
    marginTop: 8,
  },
  postsContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
