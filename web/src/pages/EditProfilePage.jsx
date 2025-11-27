import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();
  const isArtista = user?.tipo === 'ARTISTA';

  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || '',
    nomeArtistico: user?.artista?.nomeArtistico || '',
    bio: user?.artista?.bio || '',
    valorBaseHora: user?.artista?.valorBaseHora || '',
    cidadesAtuacao: user?.artista?.cidadesAtuacao?.join(', ') || ''
  });

  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [error, setError] = useState('');

  const updateUserMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      const updatedUser = {
        ...user,
        ...data.data
      };
      setAuth(updatedUser, useAuthStore.getState().token);
      queryClient.invalidateQueries(['user', user.id]);
      navigate('/profile');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil de usuario');
    }
  });

  const updateArtistMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch(`/artists/${user.artista.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      const updatedUser = {
        ...user,
        artista: {
          ...user.artista,
          ...data.data
        }
      };
      setAuth(updatedUser, useAuthStore.getState().token);
      queryClient.invalidateQueries(['artist', user.artista.id]);
      navigate('/profile');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil de artista');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = {
        nome: formData.nome,
        telefone: formData.telefone
      };

      if (uploadedPhoto) {
        userData.foto = uploadedPhoto;
      }

      await updateUserMutation.mutateAsync(userData);

      if (isArtista) {
        const artistData = {
          nomeArtistico: formData.nomeArtistico,
          bio: formData.bio,
          valorBaseHora: parseFloat(formData.valorBaseHora),
          cidadesAtuacao: formData.cidadesAtuacao
            .split(',')
            .map(c => c.trim())
            .filter(c => c)
        };

        await updateArtistMutation.mutateAsync(artistData);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const isLoading = updateUserMutation.isPending || updateArtistMutation.isPending;

  return (
    <div className="min-h-screen bg-void">
      <div className="relative overflow-hidden bg-surface border-b-2 border-neon-red/30">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-red/10 rounded-full filter blur-[150px]"></div>
        </div>

        <div className="relative py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate('/profile')}
              className="text-chrome/50 hover:text-neon-red mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-wider transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <h1 className="text-5xl md:text-6xl font-display tracking-wider text-chrome">
              EDITAR <span className="text-neon-red">PERFIL</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-neon-red/10 border-2 border-neon-red text-neon-red font-mono text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-dark-800 border-2 border-dark-600 p-8">
            <h2 className="text-2xl font-display tracking-wider text-chrome mb-6 uppercase">Foto de Perfil</h2>
            <ImageUpload
              currentImage={user?.foto}
              type="profile"
              onUploadSuccess={setUploadedPhoto}
            />
          </div>

          <div className="bg-dark-800 border-2 border-dark-600 p-8">
            <h2 className="text-2xl font-display tracking-wider text-chrome mb-6 uppercase">Informacoes Basicas</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  required
                  minLength={3}
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
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {isArtista && (
            <div className="bg-dark-800 border-2 border-dark-600 p-8">
              <h2 className="text-2xl font-display tracking-wider text-chrome mb-6 uppercase">Informacoes do Artista</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                    Nome Artistico
                  </label>
                  <input
                    type="text"
                    name="nomeArtistico"
                    value={formData.nomeArtistico}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                    Valor Base por Hora (R$)
                  </label>
                  <input
                    type="number"
                    name="valorBaseHora"
                    value={formData.valorBaseHora}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                    Cidades de Atuacao (separadas por virgula)
                  </label>
                  <input
                    type="text"
                    name="cidadesAtuacao"
                    value={formData.cidadesAtuacao}
                    onChange={handleChange}
                    placeholder="Sao Paulo, Rio de Janeiro, Curitiba"
                    className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                    Bio (minimo 50 caracteres)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors resize-none"
                    required
                    minLength={50}
                    placeholder="Conte um pouco sobre voce, sua experiencia, estilo musical e o que te diferencia..."
                  />
                  <p className="text-chrome/30 font-mono text-xs mt-2 uppercase">
                    {formData.bio.length}/50 caracteres
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-4 bg-dark-800 text-chrome font-bold font-mono text-sm uppercase tracking-wider border-2 border-dark-600 hover:border-neon-red hover:text-neon-red transition-all"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alteracoes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
