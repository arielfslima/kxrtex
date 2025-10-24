import { useMutation } from '@tanstack/react-query';
import api from './api';
import { useAuthStore } from '../store/authStore';

// Funções de API
const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  validateToken: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },
};

// Hook para login
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      setAuth(data.usuario, data.token);
    },
  });
};

// Hook para registro
export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      setAuth(data.usuario, data.token);
    },
  });
};

// Hook para validar token
export const useValidateToken = () => {
  return useMutation({
    mutationFn: authAPI.validateToken,
  });
};

export default authAPI;
