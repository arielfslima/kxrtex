import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { COLORS } from '../constants/colors';

// Critérios comuns a todos
const COMMON_CRITERIA = {
  profissionalismo: 'Profissionalismo',
  pontualidade: 'Pontualidade',
  comunicacao: 'Comunicação',
};

// Critérios específicos para avaliar artistas (contratante avalia)
const ARTIST_CRITERIA = {
  performance: 'Performance/Qualidade',
};

// Critérios específicos para avaliar contratantes (artista avalia)
const CONTRACTOR_CRITERIA = {
  condicoes: 'Condições do Local',
  respeito: 'Respeito',
};

const StarRating = ({ value, onPress }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress(star)}
          style={styles.starButton}
        >
          <Text
            style={[
              styles.star,
              star <= value ? styles.starFilled : styles.starEmpty,
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReviewScreen = ({ bookingId, booking }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const isArtist = user?.tipo === 'ARTISTA';

  // Determinar critérios baseado no tipo de usuário
  const criteriaToRate = isArtist
    ? { ...COMMON_CRITERIA, ...CONTRACTOR_CRITERIA } // Artista avalia contratante
    : { ...COMMON_CRITERIA, ...ARTIST_CRITERIA };     // Contratante avalia artista

  const [ratings, setRatings] = useState(() => {
    const initialRatings = {};
    Object.keys(criteriaToRate).forEach(key => {
      initialRatings[key] = 0;
    });
    return initialRatings;
  });
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');

  const reviewMutation = useMutation({
    mutationFn: (data) => api.post(`/reviews/${bookingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', bookingId]);
      queryClient.invalidateQueries(['bookings']);
      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erro ao enviar avaliação. Tente novamente.';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    },
  });

  const handleRatingChange = (criterion, value) => {
    setRatings((prev) => ({
      ...prev,
      [criterion]: value,
    }));
  };

  const handleSubmit = () => {
    setError('');

    const allRatingsSet = Object.values(ratings).every((r) => r > 0);
    if (!allRatingsSet) {
      setError('Por favor, avalie todos os critérios');
      Alert.alert('Aviso', 'Por favor, avalie todos os critérios');
      return;
    }

    reviewMutation.mutate({
      ...ratings,
      comentario: comentario.trim() || null,
    });
  };

  const calculateAverage = () => {
    const values = Object.values(ratings);
    const total = values.reduce((a, b) => a + b, 0);
    return (total / values.length).toFixed(1);
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Booking não encontrado</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const otherUser = isArtist
    ? booking.contratante?.usuario
    : booking.artista?.usuario;

  const hasRatings = Object.values(ratings).some((r) => r > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Avaliar {isArtist ? 'Contratante' : 'Artista'}
        </Text>
        <Text style={styles.subtitle}>
          Como foi sua experiência com {otherUser?.nome}?
        </Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        {otherUser?.foto ? (
          <Image
            source={{ uri: otherUser.foto }}
            style={styles.userAvatar}
          />
        ) : (
          <View style={styles.userAvatarPlaceholder}>
            <Text style={styles.userAvatarText}>
              {isArtist ? '📅' : '🎵'}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {isArtist
              ? otherUser?.nome
              : booking.artista?.nomeArtistico || otherUser?.nome}
          </Text>
          <Text style={styles.userDetails}>
            {new Date(booking.dataEvento).toLocaleDateString('pt-BR')} •{' '}
            {booking.local}
          </Text>
        </View>
      </View>

      {/* Review Form */}
      <View style={styles.form}>
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* Rating Criteria */}
        <Text style={styles.sectionTitle}>Avalie os critérios</Text>

        {Object.entries(criteriaToRate).map(([key, label]) => (
          <View key={key} style={styles.criterionContainer}>
            <Text style={styles.criterionLabel}>{label}</Text>
            <StarRating
              value={ratings[key]}
              onPress={(value) => handleRatingChange(key, value)}
            />
            {ratings[key] > 0 && (
              <Text style={styles.ratingText}>
                {ratings[key]} {ratings[key] === 1 ? 'estrela' : 'estrelas'}
              </Text>
            )}
          </View>
        ))}

        {/* Comment */}
        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Comentário (opcional)</Text>
          <TextInput
            style={styles.commentInput}
            value={comentario}
            onChangeText={setComentario}
            placeholder="Conte mais sobre sua experiência..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Average Rating Display */}
        {hasRatings && (
          <View style={styles.averageContainer}>
            <Text style={styles.averageLabel}>Média Geral</Text>
            <View style={styles.averageValue}>
              <Text style={styles.averageStar}>★</Text>
              <Text style={styles.averageNumber}>{calculateAverage()}</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (reviewMutation.isPending || !hasRatings) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={reviewMutation.isPending || !hasRatings}
        >
          {reviewMutation.isPending ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    gap: 16,
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  userAvatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  form: {
    gap: 24,
  },
  errorBanner: {
    backgroundColor: `${COLORS.error}20`,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    padding: 16,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: -8,
  },
  criterionContainer: {
    gap: 8,
  },
  criterionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 32,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: COLORS.textTertiary,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  commentContainer: {
    gap: 8,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  commentInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
  },
  averageContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  averageValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  averageStar: {
    fontSize: 28,
    color: '#FFD700',
  },
  averageNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
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
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
});

export default ReviewScreen;
