import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { useChat } from '../../src/hooks/useChat';
import { useAuthStore } from '../../src/store/authStore';
import { useBooking } from '../../src/services/bookingService';
import ChatMessage from '../../src/components/ChatMessage';
import ChatInput from '../../src/components/ChatInput';

export default function ChatScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const flatListRef = useRef(null);

  const { data: booking, isLoading: loadingBooking } = useBooking(bookingId);
  const {
    messages,
    typingUsers,
    isLoading: loadingMessages,
    sendMessage,
    startTyping,
    stopTyping,
    isConnected,
  } = useChat(bookingId);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  if (loadingBooking || loadingMessages) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Carregando chat...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking não encontrado</Text>
      </View>
    );
  }

  // Verificar se usuário pode acessar o chat
  const canAccessChat =
    booking.status === 'CONFIRMADO' ||
    booking.status === 'EM_ANDAMENTO' ||
    booking.status === 'CONCLUIDO';

  if (!canAccessChat) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Chat Não Disponível</Text>
        <Text style={styles.errorText}>
          O chat estará disponível após o pagamento ser confirmado.
        </Text>
      </View>
    );
  }

  const otherUser =
    user?.tipo === 'ARTISTA' ? booking.contratante : booking.artista;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {otherUser?.nomeArtistico || otherUser?.nome}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? COLORS.success : COLORS.textTertiary },
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            message={item}
            isOwn={item.remetenteId === user?.id}
            user={user}
          />
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Nenhuma mensagem ainda</Text>
            <Text style={styles.emptyText}>
              Envie uma mensagem para iniciar a conversa
            </Text>
          </View>
        }
      />

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <View style={styles.typingContainer}>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
          <Text style={styles.typingText}>
            {typingUsers[0].nome} está digitando...
          </Text>
        </View>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onTyping={startTyping}
        onStopTyping={stopTyping}
        disabled={!isConnected}
      />

      {/* Connection Warning */}
      {!isConnected && (
        <View style={styles.warningBar}>
          <Text style={styles.warningText}>
            ⚠️ Você está offline. Reconectando...
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 0, 0, 0.2)',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  messagesList: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  typingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  warningBar: {
    backgroundColor: COLORS.warning,
    padding: 8,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    color: COLORS.background,
    fontWeight: '600',
  },
});
