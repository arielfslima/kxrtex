import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    tipo: '',
    status: '',
    busca: '',
    page: 1,
    limit: 20,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'ban', 'suspend', 'activate', 'verify'
  const [motivo, setMotivo] = useState('');

  // Verificar se é admin
  useEffect(() => {
    if (user && user.tipo !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Buscar usuários
  useEffect(() => {
    fetchUsuarios();
  }, [filters.tipo, filters.status, filters.page]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.busca) params.append('busca', filters.busca);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await api.get(`/admin/usuarios?${params}`);
      setUsuarios(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchUsuarios();
  };

  const handleAction = async () => {
    if (!selectedUser || !actionModal) return;

    try {
      let newStatus = selectedUser.status;

      if (actionModal === 'ban') {
        newStatus = 'BANIDO';
      } else if (actionModal === 'suspend') {
        newStatus = 'SUSPENSO';
      } else if (actionModal === 'activate') {
        newStatus = 'ATIVO';
      }

      if (actionModal === 'verify') {
        await api.put(`/admin/artistas/${selectedUser.artista.id}/verificar`);
        alert('Artista verificado com sucesso!');
      } else {
        await api.put(`/admin/usuarios/${selectedUser.id}/status`, {
          status: newStatus,
          motivo,
        });
        alert(`Usuário ${newStatus.toLowerCase()} com sucesso!`);
      }

      setActionModal(null);
      setSelectedUser(null);
      setMotivo('');
      fetchUsuarios();
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      alert('Erro ao executar ação');
    }
  };

  const openActionModal = (action, usuario) => {
    setActionModal(action);
    setSelectedUser(usuario);
    setMotivo('');
  };

  const getStatusBadge = (status) => {
    const colors = {
      ATIVO: 'bg-green-500/20 text-green-500 border-green-500/50',
      SUSPENSO: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      BANIDO: 'bg-red-500/20 text-red-500 border-red-500/50',
    };
    return colors[status] || colors.ATIVO;
  };

  const getTipoBadge = (tipo) => {
    const colors = {
      ARTISTA: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
      CONTRATANTE: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
      ADMIN: 'bg-red-500/20 text-red-500 border-red-500/50',
    };
    return colors[tipo] || colors.ARTISTA;
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
          <h1 className="text-3xl font-bold mb-2">Gestão de Usuários</h1>
          <p className="text-white/80">Gerenciar, banir, suspender e verificar usuários</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nome ou email..."
                value={filters.busca}
                onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8B0000]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
              <select
                value={filters.tipo}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value, page: 1 })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8B0000]"
              >
                <option value="">Todos</option>
                <option value="ARTISTA">Artistas</option>
                <option value="CONTRATANTE">Contratantes</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8B0000]"
              >
                <option value="">Todos</option>
                <option value="ATIVO">Ativos</option>
                <option value="SUSPENSO">Suspensos</option>
                <option value="BANIDO">Banidos</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-[#8B0000] hover:bg-[#FF4444] text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Usuários */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
          </div>
        ) : (
          <>
            <div className="bg-white/5 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Infrações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={usuario.foto || '/default-avatar.png'}
                            alt={usuario.nome}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{usuario.nome}</p>
                            <p className="text-sm text-gray-400">{usuario.email}</p>
                            {usuario.artista && (
                              <p className="text-xs text-purple-400">
                                {usuario.artista.nomeArtistico} • {usuario.artista.categoria}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getTipoBadge(usuario.tipo)}`}
                        >
                          {usuario.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(usuario.status)}`}
                        >
                          {usuario.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400">{usuario._count.infracoes}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {usuario.status !== 'BANIDO' && (
                            <button
                              onClick={() => openActionModal('ban', usuario)}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded text-xs transition"
                            >
                              Banir
                            </button>
                          )}
                          {usuario.status !== 'SUSPENSO' && usuario.status !== 'BANIDO' && (
                            <button
                              onClick={() => openActionModal('suspend', usuario)}
                              className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded text-xs transition"
                            >
                              Suspender
                            </button>
                          )}
                          {usuario.status !== 'ATIVO' && (
                            <button
                              onClick={() => openActionModal('activate', usuario)}
                              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded text-xs transition"
                            >
                              Ativar
                            </button>
                          )}
                          {usuario.artista && usuario.artista.statusVerificacao !== 'VERIFICADO' && (
                            <button
                              onClick={() => openActionModal('verify', usuario)}
                              className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded text-xs transition"
                            >
                              Verificar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          </>
        )}
      </div>

      {/* Modal de Ação */}
      {actionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold mb-4">
              {actionModal === 'ban' && 'Banir Usuário'}
              {actionModal === 'suspend' && 'Suspender Usuário'}
              {actionModal === 'activate' && 'Ativar Usuário'}
              {actionModal === 'verify' && 'Verificar Artista'}
            </h3>
            <p className="text-gray-400 mb-4">
              Usuário: <span className="text-white font-medium">{selectedUser.nome}</span>
            </p>
            {actionModal !== 'verify' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Motivo {actionModal !== 'activate' && '(obrigatório)'}
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Digite o motivo..."
                  rows="3"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8B0000]"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedUser(null);
                  setMotivo('');
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAction}
                disabled={actionModal !== 'verify' && actionModal !== 'activate' && !motivo}
                className="flex-1 px-4 py-2 bg-[#8B0000] hover:bg-[#FF4444] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
