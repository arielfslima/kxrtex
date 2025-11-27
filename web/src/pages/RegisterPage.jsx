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
      setError('As senhas nao coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres');
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
    <div className="min-h-screen flex items-center justify-center py-12 relative overflow-hidden bg-void noise-overlay">
      {/* Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF003310_1px,transparent_1px),linear-gradient(to_bottom,#FF003310_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Neon Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-red/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-pink/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Scan Lines */}
      <div className="absolute inset-0 scan-lines pointer-events-none opacity-20"></div>

      {/* Register Form */}
      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="relative bg-dark-800 border-2 border-neon-red/50 p-10 shadow-brutal-lg">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-acid"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-acid"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-acid"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-acid"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-6 glitch-hover">
              <h1 className="text-5xl font-logo tracking-[0.1em] text-neon-red">
                KXRTEX
              </h1>
            </Link>
            <h2 className="text-2xl font-display tracking-wider text-chrome mb-2">
              CRIE SUA CONTA
            </h2>
            <p className="text-chrome/50 font-mono text-xs uppercase tracking-widest">
              Junte-se a maior plataforma underground do Brasil
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-8">
            <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-3">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType('CONTRATANTE')}
                className={`p-4 border-2 transition-all ${
                  userType === 'CONTRATANTE'
                    ? 'border-neon-red bg-neon-red/10 text-neon-red shadow-brutal-sm'
                    : 'border-dark-600 bg-dark-900 text-chrome/50 hover:border-dark-500'
                }`}
              >
                <div className="text-3xl font-display mb-2">01</div>
                <div className="font-display tracking-wider">CONTRATANTE</div>
                <div className="text-xs font-mono mt-1 opacity-75">Contratar artistas</div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('ARTISTA')}
                className={`p-4 border-2 transition-all ${
                  userType === 'ARTISTA'
                    ? 'border-neon-acid bg-neon-acid/10 text-neon-acid shadow-brutal-acid'
                    : 'border-dark-600 bg-dark-900 text-chrome/50 hover:border-dark-500'
                }`}
              >
                <div className="text-3xl font-display mb-2">02</div>
                <div className="font-display tracking-wider">ARTISTA</div>
                <div className="text-xs font-mono mt-1 opacity-75">Receber bookings</div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-neon-red/10 border-2 border-neon-red text-neon-red font-mono text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  placeholder="SEU NOME"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                placeholder="SEU@EMAIL.COM"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  name="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                  Tipo de Pessoa
                </label>
                <select
                  name="tipoPessoa"
                  value={formData.tipoPessoa}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors cursor-pointer"
                >
                  <option value="PF">PESSOA FISICA</option>
                  <option value="PJ">PESSOA JURIDICA</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  placeholder="MIN 6 CARACTERES"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  name="confirmSenha"
                  value={formData.confirmSenha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  placeholder="REPITA A SENHA"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed glitch-hover"
            >
              {loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-chrome/50 font-mono text-xs uppercase tracking-wider">
              Ja tem uma conta?{' '}
              <Link
                to="/login"
                className="text-neon-acid hover:text-neon-pink transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
