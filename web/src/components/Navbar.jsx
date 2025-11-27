import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) =>
    `relative px-1 py-2 font-medium transition-colors ${
      isActive(path)
        ? 'text-red-vibrant'
        : 'text-gray-300 hover:text-white'
    }`;

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-dark-800/95 border-b border-dark-700 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black bg-gradient-to-r from-red-vibrant to-pink-500 text-transparent bg-clip-text hover:scale-105 transition-transform"
        >
          KXRTEX
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/" className={navLinkClass('/')}>
            Inicio
            {isActive('/') && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-vibrant to-pink-500 rounded-full" />
            )}
          </Link>
          <Link to="/artists" className={navLinkClass('/artists')}>
            Artistas
            {isActive('/artists') && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-vibrant to-pink-500 rounded-full" />
            )}
          </Link>
          <Link to="/demo" className={navLinkClass('/demo')}>
            Demo
            {isActive('/demo') && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-vibrant to-pink-500 rounded-full" />
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/bookings" className={navLinkClass('/bookings')}>
                Bookings
                {isActive('/bookings') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-vibrant to-pink-500 rounded-full" />
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-dark-700/50 transition-colors"
                >
                  {user?.foto ? (
                    <img
                      src={user.foto}
                      alt={user.nome}
                      className="w-8 h-8 rounded-full object-cover border-2 border-dark-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-vibrant to-pink-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.nome?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-300 font-medium max-w-[100px] truncate">
                    {user?.nome?.split(' ')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
                    <div className="px-4 py-3 border-b border-dark-700">
                      <p className="text-white font-medium truncate">{user?.nome}</p>
                      <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                      {user?.tipo && (
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                          user.tipo === 'ARTISTA'
                            ? 'bg-purple-500/20 text-purple-400'
                            : user.tipo === 'ADMIN'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.tipo}
                        </span>
                      )}
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Meu Perfil
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Meus Bookings
                      </Link>
                      {user?.tipo === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-dark-700 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Painel Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-dark-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-400 hover:bg-dark-700 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-red-vibrant/40 font-medium transition-all"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-dark-700 pt-4 animate-fade-in">
          <nav className="flex flex-col gap-2">
            <Link
              to="/"
              className={`px-4 py-3 rounded-lg transition-colors ${isActive('/') ? 'bg-red-vibrant/10 text-red-vibrant' : 'text-gray-300 hover:bg-dark-700'}`}
            >
              Inicio
            </Link>
            <Link
              to="/artists"
              className={`px-4 py-3 rounded-lg transition-colors ${isActive('/artists') ? 'bg-red-vibrant/10 text-red-vibrant' : 'text-gray-300 hover:bg-dark-700'}`}
            >
              Artistas
            </Link>
            <Link
              to="/demo"
              className={`px-4 py-3 rounded-lg transition-colors ${isActive('/demo') ? 'bg-red-vibrant/10 text-red-vibrant' : 'text-gray-300 hover:bg-dark-700'}`}
            >
              Demo
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/bookings"
                  className={`px-4 py-3 rounded-lg transition-colors ${isActive('/bookings') ? 'bg-red-vibrant/10 text-red-vibrant' : 'text-gray-300 hover:bg-dark-700'}`}
                >
                  Meus Bookings
                </Link>
                <Link
                  to="/profile"
                  className={`px-4 py-3 rounded-lg transition-colors ${isActive('/profile') ? 'bg-red-vibrant/10 text-red-vibrant' : 'text-gray-300 hover:bg-dark-700'}`}
                >
                  Meu Perfil
                </Link>
                {user?.tipo === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-3 rounded-lg text-red-400 hover:bg-dark-700 transition-colors"
                  >
                    Painel Admin
                  </Link>
                )}
                <div className="border-t border-dark-700 mt-2 pt-2">
                  <div className="px-4 py-2 text-gray-400 text-sm">
                    Logado como {user?.nome}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg text-left text-gray-400 hover:bg-dark-700 hover:text-red-400 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2 border-t border-dark-700 pt-4">
                <Link
                  to="/login"
                  className="px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-700 transition-colors text-center"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-3 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-lg font-medium text-center"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
