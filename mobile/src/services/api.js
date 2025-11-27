import axios from 'axios';
import { API_CONFIG } from '../constants/api';
import { useAuthStore } from '../store/authStore';

// Configuração de retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Criar instância do axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função auxiliar para delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros com retry automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Não fazer retry em erros específicos
    if (!config || !response) {
      return Promise.reject(error);
    }

    // Não fazer retry para erros de autenticação ou validação
    const noRetryStatuses = [400, 401, 403, 404, 422];
    if (noRetryStatuses.includes(response.status)) {
      // Token inválido ou expirado
      if (response.status === 401) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }

    // Implementar retry para erros de rede (500, 502, 503, etc)
    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= MAX_RETRIES) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    // Exponential backoff: 1s, 2s, 4s
    const backoffDelay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1);

    console.log(
      `Retry ${config.__retryCount}/${MAX_RETRIES} after ${backoffDelay}ms for ${config.url}`
    );

    await delay(backoffDelay);

    return api(config);
  }
);

export default api;
