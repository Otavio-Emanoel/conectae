import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AnimateEntrance } from './ui/AnimateEntrance';

interface CreatePostScreenProps {
  onSubmitPost: (text: string, tags: string[]) => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onSubmitPost }) => {
  const [postText, setPostText] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handlePublish = () => {
    if (!postText.trim()) return;

    // Process tags (split by comma or spaces, strip spaces and '#' prefix)
    const processedTags = tagsInput
      .split(/[\s,]+/)
      .map(tag => tag.replace('#', '').trim())
      .filter(tag => tag.length > 0);

    onSubmitPost(postText, processedTags);
    setPostText('');
    setTagsInput('');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <AnimateEntrance preset="slideUp" delay={100}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nova Publicação</Text>
          <Text style={styles.formSubtitle}>Escreva algo interessante para compartilhar com seus conexões.</Text>

          <View style={styles.formFieldSpacer}>
            <Input
              label="O que você está pensando?"
              placeholder="Estou trabalhando em um novo projeto..."
              iconName="edit-3"
              value={postText}
              onChangeText={setPostText}
              style={styles.textArea}
              multiline={true}
              numberOfLines={6}
            />
          </View>

          <View style={styles.formFieldSpacer}>
            <Input
              label="Hashtags (separadas por vírgula ou espaço)"
              placeholder="Ex: reactnative, design, dev"
              iconName="hash"
              value={tagsInput}
              onChangeText={setTagsInput}
            />
          </View>

          <Button
            title="Publicar"
            onPress={handlePublish}
            icon={<Feather name="send" size={18} color={COLORS.white} />}
            style={styles.publishBtn}
          />
        </View>
      </AnimateEntrance>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.05)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 18,
  },
  formFieldSpacer: {
    marginBottom: 16,
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  publishBtn: {
    marginTop: 8,
  },
});
