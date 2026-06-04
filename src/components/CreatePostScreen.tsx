import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

  const handleSelectImage = async () => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria de fotos para adicionar imagens às publicações.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image: ', error);
      Alert.alert('Erro', 'Ocorreu um problema ao abrir sua galeria de fotos.');
    }
  };

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

          {/* Gallery Image Selector */}
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
                onPress={handleSelectImage}
                activeOpacity={0.7}
              >
                <Feather name="image" size={20} color={COLORS.primary} />
                <Text style={styles.addImageText}>Selecionar Foto da Galeria</Text>
              </TouchableOpacity>
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
  publishBtn: {
    marginTop: 8,
  },
});
