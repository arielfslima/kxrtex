import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 60) / 3;

const PLAN_LIMITS = {
  FREE: 5,
  PLUS: 15,
  PRO: 999,
};

const PortfolioScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);

  const { data: artistData, isLoading } = useQuery({
    queryKey: ['artist-portfolio', user?.artista?.id],
    queryFn: async () => {
      const response = await api.get(`/artists/${user.artista.id}`);
      return response.data;
    },
    enabled: !!user?.artista?.id,
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageUrl) =>
      api.delete('/upload/portfolio', { data: { imageUrl } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['artist-portfolio']);
      queryClient.invalidateQueries(['me']);
      Alert.alert('Sucesso', 'Imagem removida do portfolio');
    },
    onError: (error) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao remover imagem'
      );
    },
  });

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar suas fotos.'
      );
      return false;
    }
    return true;
  };

  const handleAddImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const portfolio = artistData?.portfolio || [];
    const limit = PLAN_LIMITS[user?.artista?.plano] || 5;
    const remaining = limit - portfolio.length;

    if (remaining <= 0) {
      Alert.alert(
        'Limite Atingido',
        `Você atingiu o limite de ${limit} imagens do plano ${user?.artista?.plano}. Faça upgrade para adicionar mais imagens.`
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 0.8,
        selectionLimit: remaining,
      });

      if (!result.canceled && result.assets.length > 0) {
        await uploadImages(result.assets);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagens');
    }
  };

  const uploadImages = async (assets) => {
    try {
      setUploading(true);

      const formData = new FormData();

      assets.forEach((asset, index) => {
        const filename = asset.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('files', {
          uri: asset.uri,
          name: filename || `image_${index}.jpg`,
          type: fileType,
        });
      });

      const response = await api.post('/upload/portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      queryClient.invalidateQueries(['artist-portfolio']);
      queryClient.invalidateQueries(['me']);

      Alert.alert(
        'Sucesso',
        response.data.message || `${assets.length} imagem(ns) adicionada(s)!`
      );
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao enviar imagens'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (imageUrl) => {
    Alert.alert(
      'Remover Imagem',
      'Tem certeza que deseja remover esta imagem do portfolio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteImageMutation.mutate(imageUrl),
        },
      ]
    );
  };

  if (user?.tipo !== 'ARTISTA') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>
          Apenas artistas podem gerenciar portfolio
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Carregando portfolio...</Text>
      </View>
    );
  }

  const portfolio = artistData?.portfolio || [];
  const limit = PLAN_LIMITS[user?.artista?.plano] || 5;
  const remaining = limit - portfolio.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meu Portfolio</Text>
        <Text style={styles.subtitle}>
          {portfolio.length} de {limit === 999 ? '∞' : limit} imagens
        </Text>
      </View>

      {/* Plan Info */}
      <View style={styles.planInfo}>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>{user?.artista?.plano}</Text>
        </View>
        <Text style={styles.planDescription}>
          {remaining > 0
            ? `Você pode adicionar mais ${remaining} ${
                remaining === 1 ? 'imagem' : 'imagens'
              }`
            : 'Limite de imagens atingido'}
        </Text>
      </View>

      {/* Add Button */}
      {remaining > 0 && (
        <TouchableOpacity
          style={[styles.addButton, uploading && styles.addButtonDisabled]}
          onPress={handleAddImages}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <>
              <Text style={styles.addButtonIcon}>📸</Text>
              <Text style={styles.addButtonText}>Adicionar Imagens</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Portfolio Grid */}
      {portfolio.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎨</Text>
          <Text style={styles.emptyTitle}>Portfolio Vazio</Text>
          <Text style={styles.emptyText}>
            Adicione fotos do seu trabalho para atrair mais contratantes
          </Text>
        </View>
      ) : (
        <FlatList
          data={portfolio}
          keyExtractor={(item, index) => `${item}-${index}`}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.imageContainer}
              onLongPress={() => handleDeleteImage(item)}
            >
              <Image source={{ uri: item }} style={styles.image} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteImage(item)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                💡 Pressione e segure uma imagem para removê-la
              </Text>
            </View>
          }
        />
      )}

      {/* Upgrade CTA */}
      {user?.artista?.plano !== 'PRO' && remaining <= 2 && (
        <View style={styles.upgradeBox}>
          <Text style={styles.upgradeIcon}>⭐</Text>
          <Text style={styles.upgradeTitle}>
            Faça upgrade para {user?.artista?.plano === 'FREE' ? 'PLUS' : 'PRO'}
          </Text>
          <Text style={styles.upgradeText}>
            {user?.artista?.plano === 'FREE'
              ? 'Adicione até 15 imagens com o plano PLUS'
              : 'Imagens ilimitadas com o plano PRO'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorIcon: {
    fontSize: 64,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    color: COLORS.accent,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  planBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  planText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  planDescription: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonIcon: {
    fontSize: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    padding: 20,
    paddingTop: 0,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  upgradeBox: {
    margin: 20,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    gap: 8,
  },
  upgradeIcon: {
    fontSize: 32,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  upgradeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default PortfolioScreen;
