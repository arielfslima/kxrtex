import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useArtist } from '../services/artistService';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

const ArtistDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: artist, isLoading, error } = useArtist(id);
  const [selectedImage, setSelectedImage] = useState(0);

  const getPlanColor = (plano) => {
    switch (plano) {
      case 'PRO': return COLORS.planPro;
      case 'PLUS': return COLORS.planPlus;
      default: return COLORS.planFree;
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Sob consulta';
    return `R$ ${price.toFixed(0)}/h`;
  };

  const openSocialMedia = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const renderSocialMedia = () => {
    if (!artist?.redesSociais) return null;

    const socials = [
      { key: 'instagram', icon: '📷', name: 'Instagram' },
      { key: 'soundcloud', icon: '🎧', name: 'SoundCloud' },
      { key: 'spotify', icon: '🎵', name: 'Spotify' },
      { key: 'youtube', icon: '▶️', name: 'YouTube' },
      { key: 'twitter', icon: '🐦', name: 'Twitter' },
    ];

    const availableSocials = socials.filter((s) => artist.redesSociais[s.key]);

    if (availableSocials.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redes Sociais</Text>
        <View style={styles.socialsContainer}>
          {availableSocials.map((social) => (
            <TouchableOpacity
              key={social.key}
              style={styles.socialButton}
              onPress={() => openSocialMedia(artist.redesSociais[social.key])}
            >
              <Text style={styles.socialIcon}>{social.icon}</Text>
              <Text style={styles.socialText}>{social.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (error || !artist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Erro ao carregar perfil</Text>
        <Text style={styles.errorText}>{error?.message || 'Artista não encontrado'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: artist.usuario?.foto || 'https://via.placeholder.com/400' }}
          style={styles.headerImage}
          resizeMode="cover"
        />

        {/* Badges */}
        <View style={styles.badgesContainer}>
          <View style={[styles.planBadge, { backgroundColor: getPlanColor(artist.plano) }]}>
            <Text style={styles.planText}>{artist.plano}</Text>
          </View>
          {artist.verificado && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verificado</Text>
            </View>
          )}
        </View>
      </View>

      {/* Artist Info */}
      <View style={styles.content}>
        {/* Name and Category */}
        <View style={styles.nameContainer}>
          <Text style={styles.artistName}>{artist.nomeArtistico}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{artist.categoria}</Text>
          </View>
        </View>

        {/* Subcategories */}
        {artist.subcategorias && artist.subcategorias.length > 0 && (
          <View style={styles.subcategoriesContainer}>
            {artist.subcategorias.map((sub, index) => (
              <View key={index} style={styles.subcategoryChip}>
                <Text style={styles.subcategoryText}>{sub}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {artist.notaMedia?.toFixed(1) || 'N/A'}</Text>
            <Text style={styles.statLabel}>{artist.totalAvaliacoes || 0} avaliações</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🎵 {artist.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>shows realizados</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Valor base</Text>
          <Text style={styles.priceValue}>{formatPrice(artist.valorBaseHora)}</Text>
        </View>

        {/* Bio */}
        {artist.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.bioText}>{artist.bio}</Text>
          </View>
        )}

        {/* Cities */}
        {artist.cidadesAtuacao && artist.cidadesAtuacao.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cidades de Atuação</Text>
            <View style={styles.citiesContainer}>
              {artist.cidadesAtuacao.map((cidade, index) => (
                <View key={index} style={styles.cityChip}>
                  <Text style={styles.cityText}>📍 {cidade}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Portfolio */}
        {artist.portfolio && artist.portfolio.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.portfolioScroll}
            >
              {artist.portfolio.map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={[
                      styles.portfolioImage,
                      selectedImage === index && styles.portfolioImageSelected,
                    ]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Selected Image Preview */}
            <Image
              source={{ uri: artist.portfolio[selectedImage] }}
              style={styles.portfolioPreview}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Social Media */}
        {renderSocialMedia()}

        {/* Book Button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push(`/booking/create?artistId=${artist.id}`)}
        >
          <Text style={styles.bookButtonText}>Solicitar Booking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  planText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    backgroundColor: COLORS.verified,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  verifiedText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  subcategoryChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subcategoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 16,
  },
  priceContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cityText: {
    color: COLORS.text,
    fontSize: 13,
  },
  portfolioScroll: {
    marginBottom: 12,
  },
  portfolioImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  portfolioImageSelected: {
    borderColor: COLORS.accent,
  },
  portfolioPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  socialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  socialText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  bookButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 14,
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

export default ArtistDetailScreen;
