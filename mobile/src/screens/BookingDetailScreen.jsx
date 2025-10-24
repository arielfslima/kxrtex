import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useBooking,
  useAcceptBooking,
  useRejectBooking,
  useCounterOffer,
} from '../services/bookingService';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants/colors';
import CheckInModal from '../components/CheckInModal';

const BookingDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { data: booking, isLoading, error } = useBooking(id);

  const acceptBooking = useAcceptBooking();
  const rejectBooking = useRejectBooking();
  const counterOffer = useCounterOffer();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [counterValue, setCounterValue] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  const isArtist = user?.tipo === 'ARTISTA';
  const isContratante = user?.tipo === 'CONTRATANTE';

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDENTE': return COLORS.warning;
      case 'ACEITO': return COLORS.info;
      case 'CONFIRMADO': return COLORS.success;
      case 'EM_ANDAMENTO': return COLORS.accent;
      case 'CONCLUIDO': return COLORS.success;
      case 'CANCELADO': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleAccept = () => {
    Alert.alert(
      'Aceitar Booking',
      'Confirma que deseja aceitar este booking?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              await acceptBooking.mutateAsync(id);
              Alert.alert('Sucesso!', 'Booking aceito! O contratante será notificado.');
            } catch (error) {
              Alert.alert('Erro', error.response?.data?.error || 'Erro ao aceitar booking');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (rejectReason.length < 10) {
      Alert.alert('Atenção', 'O motivo deve ter no mínimo 10 caracteres');
      return;
    }

    try {
      await rejectBooking.mutateAsync({ bookingId: id, motivo: rejectReason });
      setShowRejectModal(false);
      Alert.alert('Sucesso!', 'Booking recusado. O contratante será notificado.');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao recusar booking');
    }
  };

  const handleCounterOffer = async () => {
    const value = parseFloat(counterValue);
    if (!value || value <= 0) {
      Alert.alert('Atenção', 'Informe um valor válido');
      return;
    }

    try {
      await counterOffer.mutateAsync({
        bookingId: id,
        valorProposto: value,
        mensagem: counterMessage,
      });
      setShowCounterOfferModal(false);
      Alert.alert('Sucesso!', 'Contra-proposta enviada! O contratante será notificado.');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao enviar contra-proposta');
    }
  };

  const renderActions = () => {
    if (!booking) return null;

    // Artista - Booking Pendente
    if (isArtist && booking.status === 'PENDENTE') {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
            disabled={acceptBooking.isPending}
          >
            <Text style={styles.actionButtonText}>
              {acceptBooking.isPending ? 'Aceitando...' : 'Aceitar Booking'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => {
              setCounterValue(booking.valorArtista.toString());
              setShowCounterOfferModal(true);
            }}
          >
            <Text style={styles.actionButtonText}>Contra-Proposta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => setShowRejectModal(true)}
          >
            <Text style={styles.rejectButtonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Contratante - Booking Aceito
    if (isContratante && booking.status === 'ACEITO') {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => router.push(`/payment/${id}`)}
          >
            <Text style={styles.actionButtonText}>Realizar Pagamento</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Booking Confirmado
    if (booking.status === 'CONFIRMADO') {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.push(`/chat/${id}`)}
          >
            <Text style={styles.actionButtonText}>💬 Abrir Chat</Text>
          </TouchableOpacity>
          {isArtist && !booking.checkInArtista && (
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={() => setShowCheckInModal(true)}
            >
              <Text style={styles.actionButtonText}>📍 Fazer Check-in</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Booking Em Andamento
    if (booking.status === 'EM_ANDAMENTO' && isArtist && !booking.checkOutArtista) {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.push(`/chat/${id}`)}
          >
            <Text style={styles.actionButtonText}>💬 Abrir Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkOutButton}
            onPress={() => setShowCheckOutModal(true)}
          >
            <Text style={styles.actionButtonText}>✅ Fazer Check-out</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Booking Concluído - Avaliar
    if (booking.status === 'CONCLUIDO' && !booking.avaliado) {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => router.push(`/booking/${id}/review`)}
          >
            <Text style={styles.actionButtonText}>⭐ Avaliar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Carregando booking...</Text>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Erro ao carregar booking</Text>
        <Text style={styles.errorText}>{error?.message || 'Booking não encontrado'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>

          {/* Artist/Client Info */}
          <Text style={styles.name}>
            {isArtist ? booking.contratante?.usuario?.nome : booking.artista?.nomeArtistico}
          </Text>
          {!isArtist && (
            <Text style={styles.category}>{booking.artista?.categoria}</Text>
          )}

          {/* Event Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes do Evento</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data:</Text>
              <Text style={styles.detailValue}>{formatDate(booking.dataEvento)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Horário:</Text>
              <Text style={styles.detailValue}>{booking.horarioInicio}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duração:</Text>
              <Text style={styles.detailValue}>{booking.duracao}h</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Local:</Text>
              <Text style={styles.detailValue}>{booking.local}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.descriptionText}>{booking.descricaoEvento}</Text>
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Valores</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Valor do artista:</Text>
              <Text style={styles.priceValue}>R$ {booking.valorArtista.toFixed(2)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxa da plataforma:</Text>
              <Text style={styles.priceValue}>R$ {booking.taxaPlataforma.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabelTotal}>Valor total:</Text>
              <Text style={styles.priceValueTotal}>R$ {booking.valorTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Timeline */}
          {booking.criadoEm && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Histórico</Text>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Booking Criado</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(booking.criadoEm).toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>

              {booking.checkInArtista && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Check-in Realizado</Text>
                    <Text style={styles.timelineDate}>
                      {new Date(booking.checkInArtista).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>
              )}

              {booking.checkOutArtista && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Check-out Realizado</Text>
                    <Text style={styles.timelineDate}>
                      {new Date(booking.checkOutArtista).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          {renderActions()}
        </View>
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recusar Booking</Text>

            <Text style={styles.modalLabel}>Motivo (opcional):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Explique o motivo da recusa..."
              placeholderTextColor={COLORS.textTertiary}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleReject}
              disabled={rejectBooking.isPending}
            >
              <Text style={styles.modalButtonText}>
                {rejectBooking.isPending ? 'Recusando...' : 'Confirmar Recusa'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowRejectModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Counter Offer Modal */}
      <Modal
        visible={showCounterOfferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCounterOfferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contra-Proposta</Text>

            <Text style={styles.modalLabel}>Novo valor (por hora):</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.modalPriceInput}
                placeholder="0"
                placeholderTextColor={COLORS.textTertiary}
                value={counterValue}
                onChangeText={setCounterValue}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.modalLabel}>Mensagem (opcional):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Explique sua proposta..."
              placeholderTextColor={COLORS.textTertiary}
              value={counterMessage}
              onChangeText={setCounterMessage}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCounterOffer}
              disabled={counterOffer.isPending}
            >
              <Text style={styles.modalButtonText}>
                {counterOffer.isPending ? 'Enviando...' : 'Enviar Proposta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCounterOfferModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Check-in Modal */}
      <CheckInModal
        visible={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        bookingId={id}
        type="checkin"
      />

      {/* Check-out Modal */}
      <CheckInModal
        visible={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        bookingId={id}
        type="checkout"
      />
    </>
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  priceLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  priceValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  counterButton: {
    backgroundColor: COLORS.info,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkoutButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectButtonText: {
    color: COLORS.error,
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingLeft: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
  },
  modalPriceInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    fontSize: 16,
    color: COLORS.text,
  },
  modalButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  checkInButton: {
    backgroundColor: COLORS.info,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  checkOutButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
});

export default BookingDetailScreen;
