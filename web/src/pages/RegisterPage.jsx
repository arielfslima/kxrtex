import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [userType, setUserType] = useState('CONTRATANTE');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    telefone: '',
    cpfCnpj: '',
    tipoPessoa: 'PF',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.senha !== formData.confirmSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        tipo: userType,
      };
      delete dataToSend.confirmSenha;

      const response = await api.post('/auth/register', dataToSend);
      const { token, user } = response.data;

      setAuth(user, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erro ao criar conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-dark-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-vibrant/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Register Form */}
      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-dark-800/80 backdrop-blur-sm border-2 border-dark-700 rounded-3xl p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <h1 className="text-4xl font-black bg-gradient-to-r from-red-vibrant to-pink-500 text-transparent bg-clip-text">
                  KXRTEX
                </h1>
              </Link>
              <h2 className="text-2xl font-bold text-white mb-2">
                Crie sua conta
              </h2>
              <p className="text-gray-400">
                Junte-se à maior plataforma underground do Brasil
              </p>
            </div>

            {/* User Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('CONTRATANTE')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'CONTRATANTE'
                      ? 'border-red-vibrant bg-red-vibrant/10 text-red-vibrant'
                      : 'border-dark-700 bg-dark-900 text-gray-400 hover:border-dark-600'
                  }`}
                >
                  <div className="text-3xl mb-2">📅</div>
                  <div className="font-bold">Contratante</div>
                  <div className="text-xs mt-1 opacity-75">Contratar artistas</div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('ARTISTA')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'ARTISTA'
                      ? 'border-red-vibrant bg-red-vibrant/10 text-red-vibrant'
                      : 'border-dark-700 bg-dark-900 text-gray-400 hover:border-dark-600'
                  }`}
                >
                  <div className="text-3xl mb-2">🎵</div>
                  <div className="font-bold">Artista</div>
                  <div className="text-xs mt-1 opacity-75">Receber bookings</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-vibrant/10 border border-red-vibrant/50 rounded-xl text-red-vibrant text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Pessoa
                  </label>
                  <select
                    name="tipoPessoa"
                    value={formData.tipoPessoa}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                  >
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    name="confirmSenha"
                    value={formData.confirmSenha}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                    placeholder="Digite a senha novamente"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold text-lg rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-red-vibrant/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="text-red-vibrant hover:text-pink-500 font-medium transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
