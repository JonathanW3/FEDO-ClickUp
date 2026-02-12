import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ activeView, setActiveView, currentPath = '/dashboard' }) {
  const dashboardItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14H8V5z"></path>
        </svg>
      ),
      description: 'Vista general'
    },
    // { 
    //   id: 'tareas', 
    //   label: 'Mis Tareas', 
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
    //     </svg>
    //   ),
    //   description: 'Tareas asignadas'
    // },
    { 
      id: 'crear', 
      label: 'Crear Tareas', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      ),
      description: 'Nueva tarea'
    }
  ];

  const systemModules = [
    // {
    //   path: '/tablas',
    //   label: 'Tablas',
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    //     </svg>
    //   ),
    //   description: 'Gestión de datos'
    // },
    {
      path: '/reportes',
      label: 'Reportes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      description: 'Análisis y estadísticas'
    },
    {
      path: '/personal',
      label: 'Personal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
      ),
      description: 'Técnicos y vendedores'
    }
    // {
    //   path: '/alertas',
    //   label: 'Alertas',
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"></path>
    //     </svg>
    //   ),
    //   description: 'Notificaciones del sistema'
    // }
  ];

  return (
    <aside className="w-full h-full flex-shrink-0" aria-label="Navegación principal">
      <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4 lg:p-6 overflow-y-auto">
        <div className="mb-4 lg:mb-6">
          <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-1">Navegación</h2>
          <p className="text-xs lg:text-sm text-gray-600">Acceso completo a módulos</p>
        </div>
        
        <div className="mb-4 lg:mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dashboard</h3>
          <nav className="space-y-2">
            {dashboardItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full group relative overflow-hidden rounded-xl p-3 lg:p-4 text-left transition-all duration-300 ${
                  activeView === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]' 
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 transform transition-transform duration-300 ${
                  activeView === item.id ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'
                }`}></div>
                
                <div className="relative flex items-center gap-3">
                  <div className={`flex-shrink-0 ${
                    activeView === item.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${
                      activeView === item.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </p>
                    <p className={`text-sm ${
                      activeView === item.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  
                  {activeView === item.id && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="mb-4 lg:mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Módulos del Sistema</h3>
          <nav className="space-y-2">
            {systemModules.map(module => {
              const isActive = currentPath === module.path;
              return (
                <Link
                  key={module.path}
                  to={module.path}
                  className={`w-full group relative overflow-hidden rounded-xl p-3 lg:p-4 text-left transition-all duration-300 block ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-[1.02]' 
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 transform transition-transform duration-300 ${
                    isActive ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'
                  }`}></div>
                  
                  <div className="relative flex items-center gap-3">
                    <div className={`flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'
                    }`}>
                      {module.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${
                        isActive ? 'text-white' : 'text-gray-900'
                      }`}>
                        {module.label}
                      </p>
                      <p className={`text-sm ${
                        isActive ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {module.description}
                      </p>
                    </div>
                    
                    {/* Indicador activo */}
                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        
      </div>
    </aside>
  );
}
