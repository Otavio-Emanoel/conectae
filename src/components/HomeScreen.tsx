import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';
import { SPRING_SPECS } from '../constants/motion';

export interface PostItem {
  id: string;
  author: string;
  role: string;
  avatarColor: string;
  time: string;
  content: string;
  image: string | null;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
}

interface HomeScreenProps {
  posts: PostItem[];
  searchQuery: string;
}

// Sub-component for individual post card to manage its own like spring animation state
const PostCard: React.FC<{ post: PostItem; index: number }> = ({ post, index }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const heartScale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
    };
  });

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
      setLiked(false);
      heartScale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withSpring(1, SPRING_SPECS.snappy)
      );
    } else {
      setLikesCount(prev => prev + 1);
      setLiked(true);
      heartScale.value = withSequence(
        withTiming(1.3, { duration: 100 }),
        withSpring(1, SPRING_SPECS.snappy)
      );
    }
  };

  return (
    <AnimateEntrance preset="slideUp" delay={200 + index * 100}>
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
            <Text style={styles.avatarText}>{post.author.substring(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.authorRole}>{post.role} • {post.time}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton} activeOpacity={0.6}>
            <Feather name="more-horizontal" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Card Content */}
        <Text style={styles.cardContent}>{post.content}</Text>

        {/* Optional Image */}
        {post.image && (
          <View style={styles.cardImageContainer}>
            <Image source={{ uri: post.image }} style={styles.cardImage} resizeMode="cover" />
          </View>
        )}

        {/* Hashtags */}
        {post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.map(tag => (
              <Text key={tag} style={styles.tagText}>#{tag}</Text>
            ))}
          </View>
        )}

        {/* Action Stats bar */}
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>{likesCount} curtidas • {post.comments} comentários</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn} activeOpacity={0.7}>
            <Animated.View style={heartStyle}>
              <Feather
                name={liked ? 'heart' : 'heart'}
                size={20}
                color={liked ? COLORS.danger : COLORS.primary}
              />
            </Animated.View>
            <Text style={[styles.actionBtnText, liked && styles.activeLikeText]}>
              {liked ? 'Curtido' : 'Curtir'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Feather name="message-square" size={20} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Comentar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Feather name="share-2" size={20} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimateEntrance>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ posts, searchQuery }) => {
  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Top Banner Accent */}
      <AnimateEntrance preset="slideUp" delay={100}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Feed de Conexões</Text>
          <Text style={styles.bannerSubtitle}>Veja o que está acontecendo na sua rede profissional.</Text>
        </View>
      </AnimateEntrance>

      {/* Social Feed List */}
      <View style={styles.feedContainer}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))
        ) : (
          <AnimateEntrance preset="fade">
            <View style={styles.emptyContainer}>
              <Feather name="info" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Nenhuma publicação encontrada.</Text>
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
  banner: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  feedContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
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
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  headerMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  authorRole: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 21,
    fontWeight: '500',
  },
  cardImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  statsBar: {
    marginTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 22, 32, 0.06)',
  },
  statsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  activeLikeText: {
    color: COLORS.danger,
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
});
