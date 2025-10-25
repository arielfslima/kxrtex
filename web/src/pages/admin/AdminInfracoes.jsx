import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const AdminInfracoes = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [infracoes, setInfracoes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    gravidade: '',
    page: 1,
    limit: 20,
  });

  // Verificar se é admin
  useEffect(() => {
    if (user && user.tipo !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Buscar infrações
  useEffect(() => {
    fetchInfracoes();
  }, [filters.gravidade, filters.page]);

  const fetchInfracoes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.gravidade) params.append('gravidade', filters.gravidade);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await api.get(`/admin/infracoes?${params}`);
      setInfracoes(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao buscar infrações:', err);
      alert('Erro ao carregar infrações');
    } finally {
      setLoading(false);
    }
  };

  const getGravidadeBadge = (gravidade) => {
    const colors = {
      LEVE: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      MEDIA: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
      GRAVE: 'bg-red-500/20 text-red-500 border-red-500/50',
    };
    return colors[gravidade] || colors.LEVE;
  };

  const getTipoBadge = (tipo) => {
    const colors = {
      ADVERTENCIA: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      SUSPENSAO: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
      BANIMENTO: 'bg-red-500/20 text-red-500 border-red-500/50',
      ANTI_CONTORNO: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
    };
    return colors[tipo] || colors.ADVERTENCIA;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B0000] to-[#FF4444] py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-white/80 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Voltar ao Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Histórico de Infrações</h1>
          <p className="text-white/80">Ver todas as infrações e moderações da plataforma</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Filtrar por Gravidade
              </label>
              <select
                value={filters.gravidade}
                onChange={(e) => setFilters({ ...filters, gravidade: e.target.value, page: 1 })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8B0000]"
              >
                <option value="">Todas as Gravidades</option>
                <option value="LEVE">Leve</option>
                <option value="MEDIA">Média</option>
                <option value="GRAVE">Grave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Infrações */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {infracoes.map((infracao) => (
                <div
                  key={infracao.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={infracao.usuario.foto || '/default-avatar.png'}
                        alt={infracao.usuario.nome}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{infracao.usuario.nome}</p>
                        <p className="text-sm text-gray-400">{infracao.usuario.email}</p>
                        <p className="text-xs text-gray-500">
                          {infracao.usuario.tipo === 'ARTISTA' ? '🎵 Artista' : '🏢 Contratante'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getGravidadeBadge(infracao.gravidade)}`}
                      >
                        {infracao.gravidade}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getTipoBadge(infracao.tipo)}`}
                      >
                        {infracao.tipo}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300">{infracao.descricao}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(infracao.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 bg-white/5 rounded-lg">
                  Página {filters.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}

            {infracoes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Nenhuma infração encontrada</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminInfracoes;
