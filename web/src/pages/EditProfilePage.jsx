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
      setError(err.response?.data?.message || 'Erro ao atualizar perfil de usuário');
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
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 border-b border-dark-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-vibrant rounded-full filter blur-[100px] animate-pulse"></div>
        </div>

        <div className="relative py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-vibrant via-pink-500 to-purple-600 text-transparent bg-clip-text">
              Editar Perfil
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Foto de Perfil</h2>
            <ImageUpload
              currentImage={user?.foto}
              type="profile"
              onUploadSuccess={setUploadedPhoto}
            />
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                  required
                  minLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {isArtista && (
            <>
              <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Informações do Artista</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nome Artístico
                    </label>
                    <input
                      type="text"
                      name="nomeArtistico"
                      value={formData.nomeArtistico}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                      required
                      minLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Valor Base por Hora (R$)
                    </label>
                    <input
                      type="number"
                      name="valorBaseHora"
                      value={formData.valorBaseHora}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Cidades de Atuação (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      name="cidadesAtuacao"
                      value={formData.cidadesAtuacao}
                      onChange={handleChange}
                      placeholder="São Paulo, Rio de Janeiro, Curitiba"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Bio (mínimo 50 caracteres)
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors resize-none"
                      required
                      minLength={50}
                      placeholder="Conte um pouco sobre você, sua experiência, estilo musical e o que te diferencia..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {formData.bio.length}/50 caracteres
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-4 bg-dark-700 text-white font-bold rounded-xl hover:bg-dark-600 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-red-vibrant/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
