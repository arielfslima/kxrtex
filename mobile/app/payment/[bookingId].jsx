import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { useCreatePayment, usePaymentStatus } from '../../src/services/paymentService';
import { useBooking } from '../../src/services/bookingService';
import PixPayment from '../../src/components/PixPayment';
import CardPayment from '../../src/components/CardPayment';

export default function PaymentScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [pixData, setPixData] = useState(null);

  const { data: booking, isLoading: loadingBooking } = useBooking(bookingId);
  const createPaymentMutation = useCreatePayment();

  // Polling do status do pagamento após criar PIX
  const { data: paymentStatus } = usePaymentStatus(bookingId, {
    enabled: paymentCreated && selectedMethod === 'PIX',
    refetchInterval: paymentCreated && selectedMethod === 'PIX' ? 5000 : false,
  });

  // Verificar se pagamento foi confirmado
  useEffect(() => {
    if (paymentStatus?.status === 'CONFIRMED') {
      router.replace({
        pathname: '/payment/success',
        params: { bookingId },
      });
    }
  }, [paymentStatus]);

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handleCreatePixPayment = async () => {
    try {
      const result = await createPaymentMutation.mutateAsync({
        bookingId,
        billingType: 'PIX',
      });

      setPixData(result);
      setPaymentCreated(true);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Erro ao gerar pagamento PIX. Tente novamente.';
      Alert.alert('Erro', message);
    }
  };

  const handleCardPayment = async (cardData) => {
    try {
      await createPaymentMutation.mutateAsync({
        bookingId,
        billingType: 'CREDIT_CARD',
        ...cardData,
      });

      router.replace({
        pathname: '/payment/success',
        params: { bookingId },
      });
    } catch (error) {
      const message =
        error.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.';
      Alert.alert('Erro', message);
    }
  };

  if (loadingBooking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Carregando dados do booking...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking não encontrado</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Verificar se booking está no status correto
  if (booking.status !== 'ACEITO') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Pagamento não disponível</Text>
        <Text style={styles.errorText}>
          Este booking não está pronto para pagamento.
          {'\n'}Status atual: {booking.status}
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pagamento</Text>
        <Text style={styles.subtitle}>Finalize sua reserva</Text>
      </View>

      {/* Resumo do Pagamento */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumo do Pagamento</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Artista</Text>
          <Text style={styles.summaryValue}>{booking.artista.nomeArtistico}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Data do Evento</Text>
          <Text style={styles.summaryValue}>
            {new Date(booking.dataEvento).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duração</Text>
          <Text style={styles.summaryValue}>{booking.duracao}h</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Valor do Artista</Text>
          <Text style={styles.summaryValue}>
            R$ {booking.valorArtista.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Taxa da Plataforma</Text>
          <Text style={styles.summaryValue}>
            R$ {booking.taxaPlataforma.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.totalLabel}>Total a Pagar</Text>
          <Text style={styles.totalValue}>
            R$ {booking.valorTotal.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>

      {/* Seleção de Método */}
      {!selectedMethod && (
        <View style={styles.methods}>
          <Text style={styles.methodsTitle}>Escolha a forma de pagamento</Text>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleSelectMethod('PIX')}
          >
            <Text style={styles.methodIcon}>📱</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>PIX</Text>
              <Text style={styles.methodDescription}>
                Pagamento instantâneo via QR Code
              </Text>
            </View>
            <Text style={styles.methodArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleSelectMethod('CARD')}
          >
            <Text style={styles.methodIcon}>💳</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Cartão de Crédito</Text>
              <Text style={styles.methodDescription}>
                Pagamento seguro em até 1x
              </Text>
            </View>
            <Text style={styles.methodArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Componente de Pagamento PIX */}
      {selectedMethod === 'PIX' && !paymentCreated && (
        <View style={styles.paymentContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedMethod(null)}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.paymentTitle}>Pagamento via PIX</Text>
          <Text style={styles.paymentDescription}>
            Clique no botão abaixo para gerar o QR Code
          </Text>

          <TouchableOpacity
            style={[styles.button, createPaymentMutation.isPending && styles.buttonDisabled]}
            onPress={handleCreatePixPayment}
            disabled={createPaymentMutation.isPending}
          >
            {createPaymentMutation.isPending ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.buttonText}>Gerar QR Code PIX</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* QR Code PIX */}
      {selectedMethod === 'PIX' && paymentCreated && pixData && (
        <PixPayment
          pixData={pixData}
          onBack={() => {
            setSelectedMethod(null);
            setPaymentCreated(false);
            setPixData(null);
          }}
        />
      )}

      {/* Formulário de Cartão */}
      {selectedMethod === 'CARD' && (
        <CardPayment
          booking={booking}
          onSubmit={handleCardPayment}
          onBack={() => setSelectedMethod(null)}
          isLoading={createPaymentMutation.isPending}
        />
      )}
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
    padding: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  summary: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.textTertiary,
    marginVertical: 12,
  },
  summaryTotal: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  methods: {
    gap: 12,
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(139, 0, 0, 0.2)',
    gap: 16,
  },
  methodIcon: {
    fontSize: 32,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  methodArrow: {
    fontSize: 32,
    color: COLORS.textSecondary,
  },
  paymentContainer: {
    gap: 16,
  },
  backButton: {
    padding: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.accent,
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
