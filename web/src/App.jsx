import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ArtistsPage from './pages/ArtistsPage';
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
          <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-red-vibrant">
                KXRTEX
              </Link>
              <nav className="flex gap-6">
                <Link to="/" className="text-gray-300 hover:text-white transition">
                  Início
                </Link>
                <Link to="/artists" className="text-gray-300 hover:text-white transition">
                  Artistas
                </Link>
              </nav>
            </div>
          </header>

          {/* Routes */}
          <main className="max-w-7xl mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/artists" element={<ArtistsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
