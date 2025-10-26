import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';

export default function ChatInput({ onSend, onTyping, onStopTyping, disabled }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleChangeText = (text) => {
    setMessage(text);

    if (text.length > 0) {
      onTyping?.();
    } else {
      onStopTyping?.();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    onStopTyping?.();

    try {
      await onSend(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Digite sua mensagem..."
        placeholderTextColor={COLORS.textTertiary}
        value={message}
        onChangeText={handleChangeText}
        multiline
        maxLength={500}
        editable={!disabled && !sending}
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!message.trim() || sending || disabled) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!message.trim() || sending || disabled}
      >
        {sending ? (
          <ActivityIndicator size="small" color={COLORS.text} />
        ) : (
          <Text style={styles.sendIcon}>📤</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 0, 0, 0.2)',
    gap: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 20,
  },
});
