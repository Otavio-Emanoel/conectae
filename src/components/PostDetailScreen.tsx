import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';
import { PostCard, PostItem, CommentItem } from './HomeScreen';

interface PostDetailScreenProps {
  post: PostItem;
  onBack: () => void;
  onAddComment: (postId: string, commentText: string) => void;
  scrollTrigger?: { direction: 'up' | 'down'; timestamp: number } | null;
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  post,
  onBack,
  onAddComment,
  scrollTrigger
}) => {
  const [commentText, setCommentText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    if (scrollTrigger) {
      const delta = scrollTrigger.direction === 'down' ? 250 : -250;
      const targetY = Math.max(0, scrollOffsetRef.current + delta);
      scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    }
  }, [scrollTrigger]);

  const handleSend = () => {
    if (commentText.trim() === '') return;
    onAddComment(post.id, commentText);
    setCommentText('');
    Keyboard.dismiss();
    
    // Scroll to the bottom of the comments list
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const comments = post.commentsList || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Detail Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.6}>
          <Feather name="chevron-left" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicação</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {/* Full Post Card (non-pressable) */}
        <PostCard post={post} index={0} />

        {/* Comments Section Header */}
        <View style={styles.sectionHeader}>
          <Feather name="message-square" size={18} color={COLORS.primary} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>
            Comentários ({comments.length})
          </Text>
        </View>

        {/* Comments List */}
        <View style={styles.commentsContainer}>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <AnimateEntrance 
                key={comment.id} 
                preset="slideUp" 
                delay={100 + index * 50}
              >
                <View style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={[styles.avatar, { backgroundColor: comment.avatarColor }]}>
                      <Text style={styles.avatarText}>
                        {comment.author.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentTime}>{comment.time}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              </AnimateEntrance>
            ))
          ) : (
            <AnimateEntrance preset="fade" delay={150}>
              <View style={styles.emptyComments}>
                <Feather name="message-circle" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Sem comentários ainda. Seja o primeiro a comentar!</Text>
              </View>
            </AnimateEntrance>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Comment Composer */}
      <View style={styles.inputDock}>
        <TextInput
          placeholder="Adicione um comentário..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={300}
        />
        <TouchableOpacity 
          onPress={handleSend} 
          style={[
            styles.sendBtn,
            commentText.trim() === '' && styles.sendBtnDisabled
          ]}
          activeOpacity={0.7}
          disabled={commentText.trim() === ''}
        >
          <Feather name="send" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  commentsContainer: {
    gap: 12,
  },
  commentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.04)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  commentTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
    fontWeight: '600',
  },
  commentContent: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    fontWeight: '500',
    paddingLeft: 42,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputDock: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background, // neon yellow send button
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
});
