import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { useRegister } from '../../src/services/authService';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: tipo, 2: dados
  const [tipo, setTipo] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    confirmarSenha: '',
    nome: '',
    telefone: '',
    cpfCnpj: '',
    // Campos específicos de artista
    nomeArtistico: '',
    categoria: '',
  });

  const registerMutation = useRegister();

  const handleSelectTipo = (selectedTipo) => {
    setTipo(selectedTipo);
    setStep(2);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatTelefone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const formatCpfCnpj = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  };

  const validateForm = () => {
    const { email, senha, confirmarSenha, nome, telefone, cpfCnpj, nomeArtistico, categoria } =
      formData;

    if (!email || !senha || !confirmarSenha || !nome || !telefone || !cpfCnpj) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return false;
    }

    if (tipo === 'ARTISTA' && (!nomeArtistico || !categoria)) {
      Alert.alert('Erro', 'Preencha o nome artístico e categoria');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }

    if (senha.length < 8) {
      Alert.alert('Erro', 'Senha deve ter no mínimo 8 caracteres');
      return false;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    const telefoneClean = telefone.replace(/\D/g, '');
    if (telefoneClean.length < 10) {
      Alert.alert('Erro', 'Telefone inválido');
      return false;
    }

    const cpfCnpjClean = cpfCnpj.replace(/\D/g, '');
    if (cpfCnpjClean.length !== 11 && cpfCnpjClean.length !== 14) {
      Alert.alert('Erro', 'CPF/CNPJ inválido');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const userData = {
      email: formData.email,
      senha: formData.senha,
      tipo,
      nome: tipo === 'ARTISTA' ? formData.nomeArtistico : formData.nome,
      telefone: formData.telefone.replace(/\D/g, ''),
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
      tipoPessoa: formData.cpfCnpj.replace(/\D/g, '').length === 11 ? 'PF' : 'PJ',
    };

    // Se artista, adicionar campos específicos
    if (tipo === 'ARTISTA') {
      userData.nomeArtistico = formData.nomeArtistico;
      userData.categoria = formData.categoria;
    }

    try {
      await registerMutation.mutateAsync(userData);
      router.replace('/(tabs)/home');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      Alert.alert('Erro', message);
    }
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>KXRTEX</Text>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Selecione o tipo de conta</Text>
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={styles.typeCard}
            onPress={() => handleSelectTipo('CONTRATANTE')}
          >
            <Text style={styles.typeIcon}>🎭</Text>
            <Text style={styles.typeTitle}>Contratante</Text>
            <Text style={styles.typeDescription}>
              Encontre e contrate artistas para seus eventos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeCard}
            onPress={() => handleSelectTipo('ARTISTA')}
          >
            <Text style={styles.typeIcon}>🎵</Text>
            <Text style={styles.typeTitle}>Artista</Text>
            <Text style={styles.typeDescription}>
              Receba propostas e gerencie seus shows
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.backButtonText}>Já tem conta? Fazer login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dados da Conta</Text>
          <Text style={styles.subtitle}>
            {tipo === 'ARTISTA' ? 'Perfil de Artista' : 'Perfil de Contratante'}
          </Text>
        </View>

        <View style={styles.form}>
          {tipo === 'ARTISTA' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome Artístico *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DJ Example"
                  placeholderTextColor={COLORS.textTertiary}
                  value={formData.nomeArtistico}
                  onChangeText={(value) => handleChange('nomeArtistico', value)}
                  editable={!registerMutation.isPending}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria *</Text>
                <View style={styles.categoryButtons}>
                  {['DJ', 'MC', 'PERFORMER'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        formData.categoria === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => handleChange('categoria', cat)}
                      disabled={registerMutation.isPending}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          formData.categoria === cat && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {tipo === 'CONTRATANTE' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor={COLORS.textTertiary}
                value={formData.nome}
                onChangeText={(value) => handleChange('nome', value)}
                editable={!registerMutation.isPending}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={COLORS.textTertiary}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!registerMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone *</Text>
            <TextInput
              style={styles.input}
              placeholder="(11) 98765-4321"
              placeholderTextColor={COLORS.textTertiary}
              value={formData.telefone}
              onChangeText={(value) => handleChange('telefone', formatTelefone(value))}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!registerMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF/CNPJ *</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor={COLORS.textTertiary}
              value={formData.cpfCnpj}
              onChangeText={(value) => handleChange('cpfCnpj', formatCpfCnpj(value))}
              keyboardType="number-pad"
              maxLength={18}
              editable={!registerMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={COLORS.textTertiary}
              value={formData.senha}
              onChangeText={(value) => handleChange('senha', value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!registerMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a senha"
              placeholderTextColor={COLORS.textTertiary}
              value={formData.confirmarSenha}
              onChangeText={(value) => handleChange('confirmarSenha', value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!registerMutation.isPending}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, registerMutation.isPending && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.buttonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(1)}
            disabled={registerMutation.isPending}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  typeSelector: {
    gap: 16,
    marginBottom: 32,
  },
  typeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  typeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  typeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 20,
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
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryButtonTextActive: {
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
