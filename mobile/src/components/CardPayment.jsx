import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';

export default function CardPayment({ booking, onSubmit, onBack, isLoading }) {
  const [cardData, setCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // 16 dígitos + 3 espaços
  };

  const formatExpiry = (value, field) => {
    const cleaned = value.replace(/\D/g, '');
    if (field === 'expiryMonth') {
      return cleaned.substring(0, 2);
    }
    return cleaned.substring(0, 4);
  };

  const validateForm = () => {
    const newErrors = {};

    // Nome do titular
    if (!cardData.holderName || cardData.holderName.length < 3) {
      newErrors.holderName = 'Nome inválido';
    }

    // Número do cartão
    const cardNumber = cardData.number.replace(/\D/g, '');
    if (cardNumber.length !== 16) {
      newErrors.number = 'Número do cartão inválido';
    }

    // Validade
    const month = parseInt(cardData.expiryMonth);
    const year = parseInt(cardData.expiryYear);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (!month || month < 1 || month > 12) {
      newErrors.expiryMonth = 'Mês inválido';
    }

    if (!year || year < currentYear) {
      newErrors.expiryYear = 'Ano inválido';
    }

    if (year === currentYear && month < currentMonth) {
      newErrors.expiryMonth = 'Cartão expirado';
    }

    // CVV
    if (!cardData.ccv || cardData.ccv.length < 3) {
      newErrors.ccv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formattedData = {
      holderName: cardData.holderName.toUpperCase(),
      number: cardData.number.replace(/\D/g, ''),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      ccv: cardData.ccv,
    };

    onSubmit(formattedData);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={isLoading}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Pagamento com Cartão</Text>
          <Text style={styles.subtitle}>Preencha os dados do cartão de crédito</Text>
        </View>

        {/* Visualização do Cartão */}
        <View style={styles.cardPreview}>
          <View style={styles.cardChip}>
            <Text style={styles.cardChipText}>💳</Text>
          </View>
          <Text style={styles.cardNumber}>
            {cardData.number || '•••• •••• •••• ••••'}
          </Text>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardLabel}>TITULAR</Text>
              <Text style={styles.cardValue}>
                {cardData.holderName.toUpperCase() || 'SEU NOME'}
              </Text>
            </View>
            <View style={styles.cardExpiry}>
              <Text style={styles.cardLabel}>VALIDADE</Text>
              <Text style={styles.cardValue}>
                {cardData.expiryMonth || 'MM'}/{cardData.expiryYear || 'AAAA'}
              </Text>
            </View>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Titular *</Text>
            <TextInput
              style={[styles.input, errors.holderName && styles.inputError]}
              placeholder="Nome como está no cartão"
              placeholderTextColor={COLORS.textTertiary}
              value={cardData.holderName}
              onChangeText={(value) => handleChange('holderName', value)}
              autoCapitalize="characters"
              editable={!isLoading}
            />
            {errors.holderName && (
              <Text style={styles.errorText}>{errors.holderName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número do Cartão *</Text>
            <TextInput
              style={[styles.input, errors.number && styles.inputError]}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={COLORS.textTertiary}
              value={cardData.number}
              onChangeText={(value) => handleChange('number', formatCardNumber(value))}
              keyboardType="number-pad"
              maxLength={19}
              editable={!isLoading}
            />
            {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Mês *</Text>
              <TextInput
                style={[styles.input, errors.expiryMonth && styles.inputError]}
                placeholder="MM"
                placeholderTextColor={COLORS.textTertiary}
                value={cardData.expiryMonth}
                onChangeText={(value) =>
                  handleChange('expiryMonth', formatExpiry(value, 'expiryMonth'))
                }
                keyboardType="number-pad"
                maxLength={2}
                editable={!isLoading}
              />
              {errors.expiryMonth && (
                <Text style={styles.errorText}>{errors.expiryMonth}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Ano *</Text>
              <TextInput
                style={[styles.input, errors.expiryYear && styles.inputError]}
                placeholder="AAAA"
                placeholderTextColor={COLORS.textTertiary}
                value={cardData.expiryYear}
                onChangeText={(value) =>
                  handleChange('expiryYear', formatExpiry(value, 'expiryYear'))
                }
                keyboardType="number-pad"
                maxLength={4}
                editable={!isLoading}
              />
              {errors.expiryYear && (
                <Text style={styles.errorText}>{errors.expiryYear}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV *</Text>
              <TextInput
                style={[styles.input, errors.ccv && styles.inputError]}
                placeholder="000"
                placeholderTextColor={COLORS.textTertiary}
                value={cardData.ccv}
                onChangeText={(value) =>
                  handleChange('ccv', value.replace(/\D/g, '').substring(0, 4))
                }
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                editable={!isLoading}
              />
              {errors.ccv && <Text style={styles.errorText}>{errors.ccv}</Text>}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoText}>
              Seus dados estão protegidos. Utilizamos criptografia de ponta a ponta.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.buttonText}>
                Pagar R$ {booking.valorTotal.toFixed(2).replace('.', ',')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  },
  cardPreview: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 50,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardChipText: {
    fontSize: 24,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 2,
    marginTop: 20,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardExpiry: {
    alignItems: 'flex-end',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.3)',
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
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
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
