import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { COLORS } from '../constants/colors';
import ImageUploader from '../components/ImageUploader';

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const isArtist = user?.tipo === 'ARTISTA';

  const [loading, setLoading] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || '',
    nomeArtistico: user?.artista?.nomeArtistico || '',
    bio: user?.artista?.bio || '',
    valorBaseHora: user?.artista?.valorBaseHora?.toString() || '',
    cidadesAtuacao: user?.artista?.cidadesAtuacao?.join(', ') || '',
  });

  const handleImageUpload = (url) => {
    setUploadedPhotoUrl(url);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      if (isArtist) {
        const updateData = {
          nomeArtistico: formData.nomeArtistico,
          bio: formData.bio,
          valorBaseHora: parseFloat(formData.valorBaseHora),
          cidadesAtuacao: formData.cidadesAtuacao
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c),
        };

        const response = await api.patch(`/artists/${user.artista.id}`, updateData);

        const updatedUser = {
          ...user,
          foto: uploadedPhotoUrl || user.foto,
          artista: {
            ...user.artista,
            ...response.data.data,
          },
        };

        setAuth(updatedUser, useAuthStore.getState().token);

        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert(
          'Aviso',
          'Edição de perfil de contratante ainda não implementada'
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao atualizar perfil'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isArtist) {
    return (
      <View style={styles.container}>
        <View style={styles.notAvailableContainer}>
          <Text style={styles.notAvailableIcon}>🚧</Text>
          <Text style={styles.notAvailableTitle}>Em Desenvolvimento</Text>
          <Text style={styles.notAvailableText}>
            Edição de perfil de contratante ainda não está disponível.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Perfil</Text>
      </View>

      <ImageUploader
        currentImageUrl={user?.foto}
        onUploadSuccess={handleImageUpload}
        type="profile"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nome Artístico</Text>
        <TextInput
          style={styles.input}
          value={formData.nomeArtistico}
          onChangeText={(value) => handleChange('nomeArtistico', value)}
          placeholder="Seu nome artístico"
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.bio}
          onChangeText={(value) => handleChange('bio', value)}
          placeholder="Conte um pouco sobre você e seu trabalho..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.helperText}>
          Uma boa bio ajuda os contratantes a conhecerem seu trabalho
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valor Base por Hora (R$)</Text>
        <TextInput
          style={styles.input}
          value={formData.valorBaseHora}
          onChangeText={(value) => handleChange('valorBaseHora', value)}
          placeholder="300"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="numeric"
        />
        <Text style={styles.helperText}>
          Este é o valor base. Você pode negociar em cada booking.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cidades de Atuação</Text>
        <TextInput
          style={styles.input}
          value={formData.cidadesAtuacao}
          onChangeText={(value) => handleChange('cidadesAtuacao', value)}
          placeholder="São Paulo, Rio de Janeiro, Curitiba"
          placeholderTextColor={COLORS.textTertiary}
        />
        <Text style={styles.helperText}>
          Separe as cidades com vírgula
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Para alterar categoria, subcategorias ou outras informações avançadas,
          entre em contato com o suporte.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  notAvailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notAvailableIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  notAvailableTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  notAvailableText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
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
});

export default EditProfileScreen;
