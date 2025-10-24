import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';

const ArtistCard = ({ artist }) => {
  const router = useRouter();

  const getPlanColor = (plano) => {
    switch (plano) {
      case 'PRO':
        return COLORS.planPro;
      case 'PLUS':
        return COLORS.planPlus;
      default:
        return COLORS.planFree;
    }
  };

  const getPlanLabel = (plano) => {
    switch (plano) {
      case 'PRO':
        return 'PRO';
      case 'PLUS':
        return 'PLUS';
      default:
        return 'FREE';
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Sob consulta';
    return `R$ ${price.toFixed(0)}/h`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/artist/${artist.id}`)}
      activeOpacity={0.8}
    >
      {/* Imagem do Artista */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: artist.usuario?.foto || 'https://via.placeholder.com/150',
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Badge de Plano */}
        <View style={[styles.planBadge, { backgroundColor: getPlanColor(artist.plano) }]}>
          <Text style={styles.planText}>{getPlanLabel(artist.plano)}</Text>
        </View>

        {/* Badge de Verificado */}
        {artist.verificado && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </View>
        )}
      </View>

      {/* Informações do Artista */}
      <View style={styles.infoContainer}>
        {/* Nome Artístico */}
        <Text style={styles.artistName} numberOfLines={1}>
          {artist.nomeArtistico}
        </Text>

        {/* Categoria */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{artist.categoria}</Text>
          </View>
          {artist.subcategorias && artist.subcategorias.length > 0 && (
            <Text style={styles.subcategoryText} numberOfLines={1}>
              • {artist.subcategorias[0]}
            </Text>
          )}
        </View>

        {/* Avaliação e Bookings */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.statText}>
              {artist.notaMedia?.toFixed(1) || 'N/A'}
            </Text>
            <Text style={styles.statLabel}>
              ({artist.totalAvaliacoes || 0})
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.iconText}>🎵</Text>
            <Text style={styles.statText}>{artist.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>shows</Text>
          </View>
        </View>

        {/* Localização e Preço */}
        <View style={styles.footerContainer}>
          {artist.cidadesAtuacao && artist.cidadesAtuacao.length > 0 && (
            <Text style={styles.locationText} numberOfLines={1}>
              📍 {artist.cidadesAtuacao[0]}
            </Text>
          )}
          <Text style={styles.priceText}>{formatPrice(artist.valorBaseHora)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  planBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  planText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.verified,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 16,
  },
  artistName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  subcategoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  iconText: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.divider,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  priceText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ArtistCard;
