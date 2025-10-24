import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import { COLORS } from '../constants/colors';

export default function PixPayment({ pixData, onBack }) {
  const handleCopyCode = () => {
    Clipboard.setString(pixData.payload || pixData.qrCode || '');
    Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência');
  };

  const pixCode = pixData.payload || pixData.qrCode || '';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Pagamento via PIX</Text>
        <Text style={styles.subtitle}>Escaneie o QR Code ou copie o código</Text>
      </View>

      {/* QR Code */}
      <View style={styles.qrCodeContainer}>
        <View style={styles.qrCodeWrapper}>
          <QRCode value={pixCode} size={240} backgroundColor="white" color="black" />
        </View>
      </View>

      {/* Instruções */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Como pagar:</Text>
        <View style={styles.instructionsList}>
          <Text style={styles.instruction}>1. Abra o app do seu banco</Text>
          <Text style={styles.instruction}>2. Escolha pagar via PIX</Text>
          <Text style={styles.instruction}>3. Escaneie o QR Code ou cole o código</Text>
          <Text style={styles.instruction}>4. Confirme o pagamento</Text>
        </View>
      </View>

      {/* Código Copia e Cola */}
      <View style={styles.codeContainer}>
        <Text style={styles.codeTitle}>Código Copia e Cola:</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText} numberOfLines={3}>
            {pixCode}
          </Text>
        </View>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Text style={styles.copyButtonText}>📋 Copiar Código</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Aguardando confirmação do pagamento...</Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Assim que o pagamento for confirmado, você receberá uma notificação e o booking
          será automaticamente confirmado.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  backButton: {
    padding: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.accent,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  instructions: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instruction: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  codeContainer: {
    gap: 12,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  codeBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  codeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.warning,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
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
});
