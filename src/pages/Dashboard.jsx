import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import DashboardContent from '../components/DashboardContent.jsx'
import MisTareas from '../components/MisTareas.jsx'
import CrearTareas from '../components/CrearTareas.jsx'
import { requireAuth, getCurrentUser } from '../utils/authUtils'

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState(null)
  const nav = useNavigate()

  // Verificar autenticación y cargar datos del usuario
  useEffect(() => {
    // Proteger la ruta
    if (!requireAuth(nav)) {
      return
    }

    // Cargar datos del usuario
    const userData = getCurrentUser()
    if (userData) {
      setCurrentUser(userData)
      console.log('👤 Usuario cargado en Dashboard:', userData.nombre)
    } else {
      console.error('❌ No se pudieron cargar los datos del usuario')
      nav('/login')
    }
  }, [nav])

  // Mostrar loading mientras se cargan los datos
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardContent currentUser={currentUser} />
      case 'tareas':
        return <MisTareas currentUser={currentUser} />
      case 'crear':
        return <CrearTareas currentUser={currentUser} />
      default:
        return <DashboardContent currentUser={currentUser} />
    }
  }

  return (
    <AppLayout 
      dashboardActiveView={activeView} 
      onDashboardViewChange={setActiveView}
      currentUser={currentUser}
    >
      <div className="h-full">
        {renderContent()}
      </div>
    </AppLayout>
  )
}
