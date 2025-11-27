import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;

      setAuth(user, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erro ao fazer login. Verifique suas credenciais.'
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-void noise-overlay">
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

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md px-6">
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
              BEM-VINDO DE VOLTA
            </h2>
            <p className="text-chrome/50 font-mono text-xs uppercase tracking-widest">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-neon-red/10 border-2 border-neon-red text-neon-red font-mono text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed glitch-hover"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-chrome/50 font-mono text-xs uppercase tracking-wider">
              Nao tem uma conta?{' '}
              <Link
                to="/register"
                className="text-neon-acid hover:text-neon-pink transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
