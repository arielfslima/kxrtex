import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function PaymentError() {
  const router = useRouter();
  const { bookingId, message } = useLocalSearchParams();

  const errorMessage =
    message || 'Houve um erro ao processar seu pagamento. Por favor, tente novamente.';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>❌</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Pagamento Não Realizado</Text>

        {/* Message */}
        <Text style={styles.message}>{errorMessage}</Text>

        {/* Reasons Box */}
        <View style={styles.reasonsBox}>
          <Text style={styles.reasonsTitle}>Possíveis causas:</Text>
          <View style={styles.reasonsList}>
            <Text style={styles.reason}>• Saldo insuficiente</Text>
            <Text style={styles.reason}>• Dados do cartão incorretos</Text>
            <Text style={styles.reason}>• Cartão bloqueado ou vencido</Text>
            <Text style={styles.reason}>• Problemas de conexão</Text>
          </View>
        </View>

        {/* Help Box */}
        <View style={styles.helpBox}>
          <Text style={styles.helpIcon}>💡</Text>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
            <Text style={styles.helpText}>
              Entre em contato com seu banco ou tente novamente com outro método de
              pagamento.
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push(`/payment/${bookingId}`)}
        >
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.replace('/(tabs)/bookings')}
        >
          <Text style={styles.buttonSecondaryText}>Voltar para Bookings</Text>
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
    color: COLORS.error,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  reasonsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  reasonsList: {
    gap: 8,
  },
  reason: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  helpBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  helpIcon: {
    fontSize: 20,
  },
  helpContent: {
    flex: 1,
    gap: 4,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  helpText: {
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
    borderColor: COLORS.textSecondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
