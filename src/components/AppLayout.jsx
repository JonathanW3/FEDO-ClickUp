import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import WebPOSLogo from './WebPOSLogo.jsx';
import { logout, getCurrentUser } from '../utils/authUtils';

function AppHeader({ currentUser }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-3 lg:px-6 py-3 lg:py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo y Título */}
        <div className="flex items-center gap-2 lg:gap-4">
          <WebPOSLogo className="h-8 lg:h-10 w-auto" />
          <div>
            <h1 className="text-base lg:text-xl font-bold text-gray-900">Portal de Gestión</h1>
            <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Sistema de Tareas y Soporte</p>
          </div>
        </div>
        
        {/* Menú de usuario */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notificaciones */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"></path>
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 lg:gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentUser?.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.nombre || 'Usuario'}
                </div>
                <div className="text-xs text-gray-500">
                  {currentUser?.email || 'email@ejemplo.com'}
                </div>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {/* Dropdown del usuario */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="p-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{currentUser?.nombre}</div>
                  <div className="text-xs text-gray-500">{currentUser?.email}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {currentUser?.miembroID}</div>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      // Aquí podrías navegar a una página de perfil
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Mi Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppLayout({ children, dashboardActiveView, onDashboardViewChange, currentUser }) {
  const [internalActiveView, setInternalActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Use dashboard's activeView if provided, otherwise use internal state
  const activeView = dashboardActiveView || internalActiveView;
  const setActiveView = onDashboardViewChange || setInternalActiveView;

  // Function to handle dashboard navigation
  const handleDashboardNavigation = (view) => {
    setActiveView(view);
    setSidebarOpen(false); // Cerrar sidebar en móvil al navegar
    // If we're not on dashboard page, navigate there first
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{background: 'linear-gradient(135deg, #e0f2ff, #ffeef6, #e5fdf5)'}}>
      <AppHeader currentUser={currentUser} />
      <div className="flex flex-1 overflow-hidden">
        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="flex gap-3 lg:gap-6 p-3 lg:p-5 w-full">
          {/* Botón hamburguesa para móvil */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Sidebar adaptado para todas las páginas */}
          <div className={`
            fixed lg:relative inset-y-0 left-0 z-40
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            w-72 lg:w-72 flex-shrink-0
            pt-16 lg:pt-0 px-3 lg:px-0
          `}>
            <Sidebar 
              activeView={activeView} 
              setActiveView={handleDashboardNavigation}
              currentPath={location.pathname}
              currentUser={currentUser}
            />
          </div>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}