import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/constants/colors';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const getPlanBadge = (plano) => {
    const badges = {
      FREE: { text: 'FREE', color: COLORS.planFree },
      PLUS: { text: 'PLUS', color: COLORS.planPlus },
      PRO: { text: 'PRO', color: COLORS.planPro },
    };
    return badges[plano] || badges.FREE;
  };

  const isArtist = user?.tipo === 'ARTISTA';
  const planBadge = isArtist && user?.artista
    ? getPlanBadge(user.artista.plano)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {user?.foto ? (
          <Image source={{ uri: user.foto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {(user?.nome || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.name}>
          {isArtist && user?.artista?.nomeArtistico
            ? user.artista.nomeArtistico
            : user?.nome}
        </Text>

        {planBadge && (
          <View style={[styles.badge, { backgroundColor: planBadge.color }]}>
            <Text style={styles.badgeText}>{planBadge.text}</Text>
          </View>
        )}

        <Text style={styles.email}>{user?.email}</Text>

        {isArtist && user?.artista && (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {user.artista.notaMedia?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.artista.totalBookings || 0}</Text>
              <Text style={styles.statLabel}>Shows</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/edit')}
        >
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Editar Perfil</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {isArtist && (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/portfolio')}
            >
              <Text style={styles.menuIcon}>🎨</Text>
              <Text style={styles.menuText}>Gerenciar Portfolio</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            >
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>Estatísticas</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Configurações</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, styles.menuTextDanger]}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>KXRTEX v1.0.0</Text>
        <Text style={styles.footerText}>Underground Booking Platform</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.textTertiary,
  },
  menu: {
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuItemDanger: {
    marginTop: 16,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  menuTextDanger: {
    color: COLORS.error,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.textTertiary,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});
