import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const AdminBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20,
  });

  // Verificar se é admin
  useEffect(() => {
    if (user && user.tipo !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Buscar bookings
  useEffect(() => {
    fetchBookings();
  }, [filters.status, filters.page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await api.get(`/admin/bookings?${params}`);
      setBookings(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao buscar bookings:', err);
      alert('Erro ao carregar bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDENTE: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      ACEITO: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
      CONFIRMADO: 'bg-green-500/20 text-green-500 border-green-500/50',
      EM_ANDAMENTO: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
      CONCLUIDO: 'bg-teal-500/20 text-teal-500 border-teal-500/50',
      CANCELADO: 'bg-red-500/20 text-red-500 border-red-500/50',
    };
    return colors[status] || colors.PENDENTE;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
          <h1 className="text-3xl font-bold mb-2">Gestão de Bookings</h1>
          <p className="text-white/80">Ver e gerenciar todos os bookings da plataforma</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Filtrar por Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8B0000]"
              >
                <option value="">Todos os Status</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="ACEITO">Aceitos</option>
                <option value="CONFIRMADO">Confirmados</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDO">Concluídos</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Bookings */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                        {booking.precisaAdiantamento && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-500 border border-orange-500/50">
                            Adiantamento Requerido
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-medium text-white">
                        {booking.descricaoEvento || 'Sem descrição'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(booking.dataEvento)} às {booking.horarioInicio} • {booking.duracao}h
                      </p>
                      <p className="text-sm text-gray-400">{booking.local}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#FF4444]">
                        {formatCurrency(booking.valorTotal)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Taxa: {formatCurrency(booking.taxaPlataforma)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    {/* Artista */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Artista</p>
                      <div className="flex items-center gap-2">
                        <img
                          src={booking.artista.usuario.foto || '/default-avatar.png'}
                          alt={booking.artista.usuario.nome}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">{booking.artista.usuario.nome}</p>
                          <p className="text-xs text-gray-400">{booking.artista.usuario.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contratante */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Contratante</p>
                      <div className="flex items-center gap-2">
                        <img
                          src={booking.contratante.usuario.foto || '/default-avatar.png'}
                          alt={booking.contratante.usuario.nome}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">{booking.contratante.usuario.nome}</p>
                          <p className="text-xs text-gray-400">{booking.contratante.usuario.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                      className="px-4 py-2 bg-[#8B0000] hover:bg-[#FF4444] text-white rounded-lg text-sm transition"
                    >
                      Ver Detalhes
                    </button>
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

            {bookings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Nenhum booking encontrado</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
