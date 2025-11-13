import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingsPage from './pages/BookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import CreateBookingPage from './pages/CreateBookingPage';
import ReviewBookingPage from './pages/ReviewBookingPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import DemoPage from './pages/DemoPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminBookings from './pages/admin/AdminBookings';
import AdminInfracoes from './pages/admin/AdminInfracoes';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import { SocketProvider } from './contexts/SocketContext';
import NotificationToast from './components/NotificationToast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-dark-900">
          {/* Header */}
          <header className="bg-dark-800 border-b border-dark-700 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-dark-800/90">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-red-vibrant to-pink-500 text-transparent bg-clip-text hover:scale-105 transition-transform">
                KXRTEX
              </Link>
              <nav className="flex gap-6 items-center">
                <Link to="/" className="text-gray-300 hover:text-white font-medium transition">
                  Início
                </Link>
                <Link to="/artists" className="text-gray-300 hover:text-white font-medium transition">
                  Artistas
                </Link>
                <Link to="/demo" className="text-gray-300 hover:text-white font-medium transition">
                  Demo
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/bookings" className="text-gray-300 hover:text-white font-medium transition">
                      Bookings
                    </Link>
                    <Link to="/profile" className="text-gray-300 hover:text-white font-medium transition">
                      Perfil
                    </Link>
                    {user?.tipo === 'ADMIN' && (
                      <Link to="/admin/dashboard" className="px-3 py-1 bg-red-vibrant/20 text-red-vibrant border border-red-vibrant/50 rounded-lg hover:bg-red-vibrant/30 font-medium transition text-sm">
                        Admin
                      </Link>
                    )}
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">
                        Olá, <span className="text-white font-medium">{user?.nome}</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-300 hover:text-white font-medium transition">
                      Entrar
                    </Link>
                    <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-red-vibrant/50 font-medium transition">
                      Cadastrar
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          {/* Routes */}
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/artists/:id" element={<ArtistDetailPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navigate to="/bookings" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/create"
                element={
                  <ProtectedRoute>
                    <CreateBookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:id/review"
                element={
                  <ProtectedRoute>
                    <ReviewBookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute>
                    <AdminUsuarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute>
                    <AdminBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/infracoes"
                element={
                  <ProtectedRoute>
                    <AdminInfracoes />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <NotificationToast />
        </div>
      </BrowserRouter>
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;
