import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBooking } from '../services/bookingService';
import { useArtist } from '../services/artistService';
import { COLORS } from '../constants/colors';

// Schema de validação
const bookingSchema = z.object({
  dataEvento: z.string().min(1, 'Data do evento é obrigatória'),
  horarioInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (HH:mm)'),
  duracao: z.number().int().positive('Duração deve ser positiva').max(24, 'Máximo 24 horas'),
  local: z.string().min(5, 'Local deve ter no mínimo 5 caracteres'),
  descricaoEvento: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  valorProposto: z.number().positive('Valor deve ser positivo').optional(),
});

const CreateBookingScreen = () => {
  const router = useRouter();
  const { artistId } = useLocalSearchParams();
  const { data: artist } = useArtist(artistId);
  const createBooking = useCreateBooking();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dataEvento: '',
      horarioInicio: '',
      duracao: 4,
      local: '',
      descricaoEvento: '',
      valorProposto: artist?.valorBaseHora || 0,
    },
  });

  const duracao = watch('duracao');
  const valorProposto = watch('valorProposto');

  const calcularValorTotal = () => {
    if (!valorProposto || !duracao) return 0;

    const valorArtista = valorProposto * duracao;
    const taxas = { FREE: 0.15, PLUS: 0.10, PRO: 0.07 };
    const taxa = taxas[artist?.plano || 'FREE'];
    const taxaPlataforma = valorArtista * taxa;

    return valorArtista + taxaPlataforma;
  };

  const onSubmit = async (data) => {
    try {
      await createBooking.mutateAsync({
        artistaId: artistId,
        ...data,
      });

      Alert.alert(
        'Sucesso!',
        'Booking solicitado com sucesso! O artista será notificado.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/bookings'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error.response?.data?.error || 'Erro ao criar booking. Tente novamente.'
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Solicitar Booking</Text>
          {artist && (
            <View style={styles.artistInfo}>
              <Text style={styles.artistName}>{artist.nomeArtistico}</Text>
              <Text style={styles.artistCategory}>{artist.categoria}</Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Data do Evento */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Data do Evento *</Text>
            <Controller
              control={control}
              name="dataEvento"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.dataEvento && styles.inputError]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.textTertiary}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.dataEvento && (
              <Text style={styles.errorText}>{errors.dataEvento.message}</Text>
            )}
          </View>

          {/* Horário de Início */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Horário de Início *</Text>
            <Controller
              control={control}
              name="horarioInicio"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.horarioInicio && styles.inputError]}
                  placeholder="HH:mm (ex: 22:00)"
                  placeholderTextColor={COLORS.textTertiary}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.horarioInicio && (
              <Text style={styles.errorText}>{errors.horarioInicio.message}</Text>
            )}
          </View>

          {/* Duração */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Duração (horas) *</Text>
            <Controller
              control={control}
              name="duracao"
              render={({ field: { onChange, value } }) => (
                <View style={styles.durationContainer}>
                  <TouchableOpacity
                    style={styles.durationButton}
                    onPress={() => onChange(Math.max(1, value - 1))}
                  >
                    <Text style={styles.durationButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.durationValue}>{value}h</Text>
                  <TouchableOpacity
                    style={styles.durationButton}
                    onPress={() => onChange(Math.min(24, value + 1))}
                  >
                    <Text style={styles.durationButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.duracao && (
              <Text style={styles.errorText}>{errors.duracao.message}</Text>
            )}
          </View>

          {/* Local */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Local do Evento *</Text>
            <Controller
              control={control}
              name="local"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea, errors.local && styles.inputError]}
                  placeholder="Endereço completo do evento"
                  placeholderTextColor={COLORS.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
            {errors.local && (
              <Text style={styles.errorText}>{errors.local.message}</Text>
            )}
          </View>

          {/* Descrição */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Descrição do Evento *</Text>
            <Controller
              control={control}
              name="descricaoEvento"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea, errors.descricaoEvento && styles.inputError]}
                  placeholder="Descreva o tipo de evento, expectativas, público, etc."
                  placeholderTextColor={COLORS.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={5}
                />
              )}
            />
            {errors.descricaoEvento && (
              <Text style={styles.errorText}>{errors.descricaoEvento.message}</Text>
            )}
          </View>

          {/* Valor Proposto */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Valor Proposto (por hora)</Text>
            <Controller
              control={control}
              name="valorProposto"
              render={({ field: { onChange, value } }) => (
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={[styles.input, styles.priceInput]}
                    placeholder={artist?.valorBaseHora?.toString() || '0'}
                    placeholderTextColor={COLORS.textTertiary}
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
            {artist?.valorBaseHora && (
              <Text style={styles.hint}>
                Valor base do artista: R$ {artist.valorBaseHora.toFixed(0)}/h
              </Text>
            )}
          </View>

          {/* Price Breakdown */}
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Resumo de Valores</Text>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Valor do artista ({duracao}h):</Text>
              <Text style={styles.breakdownValue}>
                R$ {(valorProposto * duracao).toFixed(2)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Taxa da plataforma ({artist?.plano === 'PRO' ? '7%' : artist?.plano === 'PLUS' ? '10%' : '15%'}):
              </Text>
              <Text style={styles.breakdownValue}>
                R$ {(valorProposto * duracao * (artist?.plano === 'PRO' ? 0.07 : artist?.plano === 'PLUS' ? 0.10 : 0.15)).toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelTotal}>Valor total:</Text>
              <Text style={styles.breakdownValueTotal}>
                R$ {calcularValorTotal().toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              O artista pode aceitar, recusar ou fazer uma contra-proposta.
              Você será notificado da resposta.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, createBooking.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={createBooking.isPending}
          >
            <Text style={styles.submitButtonText}>
              {createBooking.isPending ? 'Enviando...' : 'Solicitar Booking'}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  artistInfo: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  artistCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: 32,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 4,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 8,
  },
  durationButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  durationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 32,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
  },
  breakdownContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  breakdownLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  breakdownValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateBookingScreen;
