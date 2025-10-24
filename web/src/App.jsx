import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import HomePage from './pages/HomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-dark-900">
          {/* Header */}
          <header className="bg-dark-800 border-b border-dark-700 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-dark-800/90">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-red-vibrant to-pink-500 text-transparent bg-clip-text hover:scale-105 transition-transform">
                KXRTEX
              </Link>
              <nav className="flex gap-6">
                <Link to="/" className="text-gray-300 hover:text-white font-medium transition">
                  Início
                </Link>
                <Link to="/artists" className="text-gray-300 hover:text-white font-medium transition">
                  Artistas
                </Link>
                <Link to="/login" className="px-4 py-2 border border-red-vibrant text-red-vibrant rounded-lg hover:bg-red-vibrant hover:text-white font-medium transition">
                  Entrar
                </Link>
              </nav>
            </div>
          </header>

          {/* Routes */}
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/artists/:id" element={<ArtistDetailPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
