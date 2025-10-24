import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Listar artistas com filtros
export const useArtists = (filters = {}) => {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.subcategoria) params.append('subcategoria', filters.subcategoria);
      if (filters.cidade) params.append('cidade', filters.cidade);
      if (filters.precoMin) params.append('precoMin', filters.precoMin);
      if (filters.precoMax) params.append('precoMax', filters.precoMax);
      if (filters.avaliacaoMin) params.append('avaliacaoMin', filters.avaliacaoMin);
      if (filters.plano) params.append('plano', filters.plano);
      if (filters.verificado !== undefined) params.append('verificado', filters.verificado);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.orderBy) params.append('orderBy', filters.orderBy);

      const response = await api.get(`/artists?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Detalhes do artista
export const useArtist = (artistId) => {
  return useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const response = await api.get(`/artists/${artistId}`);
      return response.data.data;
    },
    enabled: !!artistId,
  });
};

// Atualizar perfil do artista (apenas para artistas logados)
export const useUpdateArtistProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/artists/me', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// Buscar artistas (para autocomplete de busca)
export const searchArtists = async (query) => {
  if (!query || query.length < 2) return [];

  const response = await api.get(`/artists?search=${encodeURIComponent(query)}&limit=10`);
  return response.data.data;
};
