import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function ChatMessage({ message, isOwn, user }) {
  const isSystemMessage = message.tipo === 'SISTEMA';

  if (isSystemMessage) {
    // Detectar aviso de anti-circunvenção
    const isWarning = message.conteudo.toLowerCase().includes('detectamos') ||
      message.conteudo.toLowerCase().includes('compartilhamento') ||
      message.conteudo.toLowerCase().includes('aviso');

    return (
      <View style={styles.systemContainer}>
        <View style={[styles.systemBubble, isWarning && styles.warningBubble]}>
          <Text style={isWarning ? styles.warningIcon : styles.systemIcon}>
            {isWarning ? '⚠️' : 'ℹ️'}
          </Text>
          <Text style={styles.systemText}>{message.conteudo}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isOwn && styles.ownContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        {!isOwn && (
          <Text style={styles.senderName}>{message.remetente?.nome || 'Usuário'}</Text>
        )}
        <Text style={[styles.message, isOwn && styles.ownMessage]}>
          {message.conteudo}
        </Text>
        <Text style={[styles.timestamp, isOwn && styles.ownTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  ownBubble: {
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  ownMessage: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  systemBubble: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  warningBubble: {
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    borderColor: 'rgba(255, 179, 0, 0.5)',
  },
  systemIcon: {
    fontSize: 16,
  },
  warningIcon: {
    fontSize: 18,
  },
  systemText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
