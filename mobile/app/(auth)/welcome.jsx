import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>KXRTEX</Text>
        <Text style={styles.tagline}>
          Conecte-se com os melhores{'\n'}artistas underground
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>🎵 DJs, MCs e Performers</Text>
          <Text style={styles.feature}>💰 Pagamento seguro</Text>
          <Text style={styles.feature}>⭐ Sistema de avaliações</Text>
          <Text style={styles.feature}>💬 Chat em tempo real</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.buttonText}>Criar Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            Já tenho conta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 6,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  features: {
    gap: 16,
  },
  feature: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  buttons: {
    gap: 12,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonTextSecondary: {
    color: COLORS.accent,
  },
});
