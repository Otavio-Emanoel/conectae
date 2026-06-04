import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AnimateEntrance } from './ui/AnimateEntrance';

interface CreatePostScreenProps {
  onSubmitPost: (text: string, tags: string[], image: string | null) => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onSubmitPost }) => {
  const [postText, setPostText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Premium stock photo simulator list
  const imagesList = [
    { id: '1', name: 'Trabalho', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60' },
    { id: '2', name: 'Código', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60' },
    { id: '3', name: 'Design', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60' },
    { id: '4', name: 'Reunião', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60' }
  ];

  const handlePublish = () => {
    if (!postText.trim()) return;

    // Process tags (split by comma or spaces, strip spaces and '#' prefix)
    const processedTags = tagsInput
      .split(/[\s,]+/)
      .map(tag => tag.replace('#', '').trim())
      .filter(tag => tag.length > 0);

    onSubmitPost(postText, processedTags, selectedImage);
    setPostText('');
    setTagsInput('');
    setSelectedImage(null);
    setShowImageSelector(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <AnimateEntrance preset="slideUp" delay={100}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nova Publicação</Text>
          <Text style={styles.formSubtitle}>Escreva algo interessante para compartilhar com seus conexões.</Text>

          {/* Text Area */}
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

          {/* Image Selector Simulator */}
          <View style={styles.imageSelectorContainer}>
            {selectedImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setSelectedImage(null)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addImageBtn}
                onPress={() => setShowImageSelector(!showImageSelector)}
                activeOpacity={0.7}
              >
                <Feather name="image" size={20} color={COLORS.primary} />
                <Text style={styles.addImageText}>Adicionar Foto à Publicação</Text>
              </TouchableOpacity>
            )}

            {/* Gallery list */}
            {showImageSelector && !selectedImage && (
              <View style={styles.galleryContainer}>
                <Text style={styles.galleryTitle}>Escolha uma foto da galeria:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                  {imagesList.map(img => (
                    <TouchableOpacity
                      key={img.id}
                      style={styles.galleryItem}
                      onPress={() => {
                        setSelectedImage(img.url);
                        setShowImageSelector(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: img.url }} style={styles.galleryImage} />
                      <View style={styles.galleryImageLabelContainer}>
                        <Text style={styles.galleryImageLabel}>{img.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Tags */}
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
  imageSelectorContainer: {
    marginBottom: 16,
    width: '100%',
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 56,
    backgroundColor: COLORS.inputBackground,
  },
  addImageText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(18, 22, 32, 0.1)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(18, 22, 32, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(18, 22, 32, 0.03)',
    borderRadius: 16,
    padding: 12,
  },
  galleryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  galleryScroll: {
    gap: 10,
  },
  galleryItem: {
    position: 'relative',
    width: 100,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryImageLabelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 22, 32, 0.6)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  galleryImageLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  publishBtn: {
    marginTop: 8,
  },
});
