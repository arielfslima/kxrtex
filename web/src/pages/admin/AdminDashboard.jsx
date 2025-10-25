import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  // Verificar se é admin
  useEffect(() => {
    if (user && user.tipo !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Buscar métricas
  useEffect(() => {
    fetchMetrics();
  }, [periodo]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/dashboard?periodo=${periodo}`);
      setMetrics(response.data);
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
      setError('Erro ao carregar métricas. Verifique se você tem permissão de admin.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-red-500 text-xl font-bold mb-2">Erro</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#FF4444] transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B0000] to-[#FF4444] py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Painel Admin</h1>
          <p className="text-white/80">Dashboard de métricas e gestão</p>
        </div>
      </div>

      {/* Filtro de Período */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6">
          {['hoje', 'semana', 'mes', 'ano'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                periodo === p
                  ? 'bg-[#8B0000] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {metrics && (
          <div className="space-y-6">
            {/* Métricas Financeiras */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#FF4444]">💰 Financeiro</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Receita de Bookings"
                  value={formatCurrency(metrics.financeiro.receitaBookings)}
                  icon="💳"
                  color="green"
                />
                <MetricCard
                  title="Receita de Assinaturas"
                  value={formatCurrency(metrics.financeiro.receitaAssinaturas)}
                  icon="📊"
                  color="blue"
                />
                <MetricCard
                  title="Receita Total"
                  value={formatCurrency(metrics.financeiro.receitaTotal)}
                  icon="💵"
                  color="red"
                />
              </div>
            </div>

            {/* Métricas de Usuários */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#FF4444]">👥 Usuários</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Total de Usuários"
                  value={formatNumber(metrics.usuarios.total)}
                  icon="👤"
                  color="purple"
                />
                <MetricCard
                  title="Novos Usuários"
                  value={formatNumber(metrics.usuarios.novos)}
                  icon="✨"
                  color="green"
                />
                <MetricCard
                  title="Artistas"
                  value={formatNumber(metrics.usuarios.artistas)}
                  icon="🎵"
                  color="blue"
                />
                <MetricCard
                  title="Contratantes"
                  value={formatNumber(metrics.usuarios.contratantes)}
                  icon="🏢"
                  color="orange"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <MetricCard
                  title="Usuários Ativos"
                  value={formatNumber(metrics.usuarios.ativos)}
                  icon="🟢"
                  color="green"
                />
                <MetricCard
                  title="Artistas Verificados"
                  value={formatNumber(metrics.usuarios.artistasVerificados)}
                  icon="✅"
                  color="blue"
                />
              </div>
            </div>

            {/* Métricas de Bookings */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#FF4444]">📅 Bookings</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Total de Bookings"
                  value={formatNumber(metrics.bookings.total)}
                  icon="📋"
                  color="purple"
                />
                <MetricCard
                  title="Pendentes"
                  value={formatNumber(metrics.bookings.pendentes)}
                  icon="⏳"
                  color="yellow"
                />
                <MetricCard
                  title="Confirmados"
                  value={formatNumber(metrics.bookings.confirmados)}
                  icon="✔️"
                  color="green"
                />
                <MetricCard
                  title="Concluídos"
                  value={formatNumber(metrics.bookings.concluidos)}
                  icon="🎉"
                  color="blue"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <MetricCard
                  title="Ticket Médio"
                  value={formatCurrency(metrics.bookings.ticketMedio)}
                  icon="💰"
                  color="green"
                />
                <MetricCard
                  title="GMV Total"
                  value={formatCurrency(metrics.bookings.gmv)}
                  icon="📈"
                  color="red"
                />
                <MetricCard
                  title="Cancelados"
                  value={formatNumber(metrics.bookings.cancelados)}
                  icon="❌"
                  color="red"
                />
              </div>
            </div>

            {/* Distribuição de Planos */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#FF4444]">💎 Planos de Assinatura</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="FREE"
                  value={formatNumber(metrics.planos.free)}
                  icon="🆓"
                  color="gray"
                />
                <MetricCard
                  title="PLUS (R$ 49/mês)"
                  value={formatNumber(metrics.planos.plus)}
                  icon="⭐"
                  color="yellow"
                />
                <MetricCard
                  title="PRO (R$ 99/mês)"
                  value={formatNumber(metrics.planos.pro)}
                  icon="💎"
                  color="purple"
                />
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#FF4444]">🔗 Ações Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickLink
                  title="Gerenciar Usuários"
                  description="Ver, banir ou verificar usuários"
                  icon="👥"
                  onClick={() => navigate('/admin/usuarios')}
                />
                <QuickLink
                  title="Gerenciar Bookings"
                  description="Ver e gerenciar todos os bookings"
                  icon="📅"
                  onClick={() => navigate('/admin/bookings')}
                />
                <QuickLink
                  title="Ver Infrações"
                  description="Histórico de infrações e moderação"
                  icon="⚠️"
                  onClick={() => navigate('/admin/infracoes')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Card de Métrica
const MetricCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: 'from-green-900/20 to-green-800/10 border-green-500/30',
    blue: 'from-blue-900/20 to-blue-800/10 border-blue-500/30',
    red: 'from-red-900/20 to-red-800/10 border-red-500/30',
    purple: 'from-purple-900/20 to-purple-800/10 border-purple-500/30',
    yellow: 'from-yellow-900/20 to-yellow-800/10 border-yellow-500/30',
    orange: 'from-orange-900/20 to-orange-800/10 border-orange-500/30',
    gray: 'from-gray-900/20 to-gray-800/10 border-gray-500/30',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-4 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

// Componente de Link Rápido
const QuickLink = ({ title, description, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-6 text-left transition group"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF4444] transition">
        {title}
      </h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </button>
  );
};

export default AdminDashboard;
