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
    `relative px-3 py-2 font-mono text-sm uppercase tracking-wider transition-all duration-200 ${
      isActive(path)
        ? 'text-neon-red'
        : 'text-chrome/70 hover:text-neon-acid'
    }`;

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-void/95 border-b-2 border-neon-red/30 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - Maiden Crimes Font */}
        <Link
          to="/"
          className="group relative"
        >
          <span className="text-3xl font-logo tracking-[0.1em] text-neon-red transition-all duration-300 group-hover:text-neon-acid glitch-hover">
            KXRTEX
          </span>
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-red group-hover:bg-neon-acid transition-colors"></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1 items-center">
          <Link to="/" className={navLinkClass('/')}>
            <span className="relative">
              Inicio
              {isActive('/') && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon-red" />
              )}
            </span>
          </Link>
          <Link to="/artists" className={navLinkClass('/artists')}>
            <span className="relative">
              Artistas
              {isActive('/artists') && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon-red" />
              )}
            </span>
          </Link>
          <Link to="/demo" className={navLinkClass('/demo')}>
            <span className="relative">
              Demo
              {isActive('/demo') && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon-red" />
              )}
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/bookings" className={navLinkClass('/bookings')}>
                <span className="relative">
                  Bookings
                  {isActive('/bookings') && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon-red" />
                  )}
                </span>
              </Link>

              {/* User Dropdown */}
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 border border-dark-600 hover:border-neon-red/50 transition-all"
                >
                  {user?.foto ? (
                    <img
                      src={user.foto}
                      alt={user.nome}
                      className="w-8 h-8 object-cover border-2 border-neon-red/50"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-neon-red flex items-center justify-center text-void text-sm font-bold font-mono">
                      {user?.nome?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-chrome/80 font-mono text-sm max-w-[100px] truncate uppercase">
                    {user?.nome?.split(' ')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 text-neon-red transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border-2 border-neon-red/30 shadow-brutal overflow-hidden animate-fade-in">
                    <div className="px-4 py-3 border-b-2 border-dark-700 bg-dark-800">
                      <p className="text-chrome font-mono text-sm truncate">{user?.nome}</p>
                      <p className="text-chrome/50 text-xs font-mono truncate">{user?.email}</p>
                      {user?.tipo && (
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-bold font-mono uppercase ${
                          user.tipo === 'ARTISTA'
                            ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30'
                            : user.tipo === 'ADMIN'
                            ? 'bg-neon-red/20 text-neon-red border border-neon-red/30'
                            : 'bg-neon-acid/20 text-neon-acid border border-neon-acid/30'
                        }`}>
                          {user.tipo}
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-chrome/70 hover:bg-neon-red/10 hover:text-neon-red font-mono text-sm transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        MEU PERFIL
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-chrome/70 hover:bg-neon-red/10 hover:text-neon-red font-mono text-sm transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        MEUS BOOKINGS
                      </Link>
                      {user?.tipo === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neon-acid hover:bg-neon-acid/10 font-mono text-sm transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          PAINEL ADMIN
                        </Link>
                      )}
                    </div>

                    <div className="border-t-2 border-dark-700 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-chrome/50 hover:bg-neon-red/10 hover:text-neon-red font-mono text-sm transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        SAIR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 ml-4">
              <Link
                to="/login"
                className="text-chrome/70 hover:text-neon-acid font-mono text-sm uppercase tracking-wider transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider hover:bg-neon-acid hover:shadow-brutal-acid transition-all shadow-brutal-sm"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 border border-dark-600 hover:border-neon-red transition-colors"
        >
          <svg className="w-6 h-6 text-neon-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden mt-4 pb-4 border-t-2 border-neon-red/30 pt-4 animate-fade-in">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              className={`px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors ${isActive('/') ? 'bg-neon-red/10 text-neon-red border-l-2 border-neon-red' : 'text-chrome/70 hover:text-neon-acid hover:bg-dark-800'}`}
            >
              Inicio
            </Link>
            <Link
              to="/artists"
              className={`px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors ${isActive('/artists') ? 'bg-neon-red/10 text-neon-red border-l-2 border-neon-red' : 'text-chrome/70 hover:text-neon-acid hover:bg-dark-800'}`}
            >
              Artistas
            </Link>
            <Link
              to="/demo"
              className={`px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors ${isActive('/demo') ? 'bg-neon-red/10 text-neon-red border-l-2 border-neon-red' : 'text-chrome/70 hover:text-neon-acid hover:bg-dark-800'}`}
            >
              Demo
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/bookings"
                  className={`px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors ${isActive('/bookings') ? 'bg-neon-red/10 text-neon-red border-l-2 border-neon-red' : 'text-chrome/70 hover:text-neon-acid hover:bg-dark-800'}`}
                >
                  Meus Bookings
                </Link>
                <Link
                  to="/profile"
                  className={`px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors ${isActive('/profile') ? 'bg-neon-red/10 text-neon-red border-l-2 border-neon-red' : 'text-chrome/70 hover:text-neon-acid hover:bg-dark-800'}`}
                >
                  Meu Perfil
                </Link>
                {user?.tipo === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-3 font-mono text-sm uppercase tracking-wider text-neon-acid hover:bg-neon-acid/10 transition-colors"
                  >
                    Painel Admin
                  </Link>
                )}
                <div className="border-t-2 border-dark-700 mt-2 pt-2">
                  <div className="px-4 py-2 text-chrome/50 text-xs font-mono">
                    LOGADO COMO {user?.nome?.toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left font-mono text-sm uppercase tracking-wider text-chrome/50 hover:bg-neon-red/10 hover:text-neon-red transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2 border-t-2 border-dark-700 pt-4">
                <Link
                  to="/login"
                  className="px-4 py-3 font-mono text-sm uppercase tracking-wider text-chrome/70 hover:text-neon-acid transition-colors text-center"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="mx-4 px-4 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider text-center shadow-brutal-sm"
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
