import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function PaymentSuccess() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✅</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Pagamento Confirmado!</Text>

        {/* Message */}
        <Text style={styles.message}>
          Seu pagamento foi processado com sucesso. O booking foi confirmado e você já pode
          conversar com o artista.
        </Text>

        {/* Details Box */}
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Próximos passos:</Text>
              <Text style={styles.detailValue}>
                1. Converse com o artista no chat{'\n'}
                2. Acompanhe os detalhes do evento{'\n'}
                3. No dia do evento, o artista fará check-in
              </Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            O pagamento ficará retido pela plataforma e será liberado para o artista após
            a conclusão do evento (48h após o check-out).
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push(`/booking/${bookingId}`)}
        >
          <Text style={styles.buttonText}>Ver Detalhes do Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.replace('/(tabs)/bookings')}
        >
          <Text style={styles.buttonSecondaryText}>Ir para Meus Bookings</Text>
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
    gap: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailIcon: {
    fontSize: 24,
  },
  detailContent: {
    flex: 1,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  buttons: {
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
