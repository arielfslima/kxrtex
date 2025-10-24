// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:3000/api',
  SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
};

export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',

  // Users
  USER_PROFILE: '/users/profile',

  // Artists
  ARTISTS_LIST: '/artists',
  ARTIST_DETAILS: (id) => `/artists/${id}`,
  ARTIST_UPDATE: (id) => `/artists/${id}`,

  // Bookings
  BOOKINGS_LIST: '/bookings',
  BOOKINGS_CREATE: '/bookings',
  BOOKING_DETAILS: (id) => `/bookings/${id}`,
  BOOKING_ACCEPT: (id) => `/bookings/${id}/accept`,
  BOOKING_REJECT: (id) => `/bookings/${id}/reject`,
};
