/**
 * Utilidades de Autenticación y Gestión de Sesiones
 * Maneja el almacenamiento de datos de usuario y navegación segura
 */

// Claves para localStorage
const STORAGE_KEYS = {
  IS_LOGGED_IN: 'isLoggedIn',
  USER_DATA: 'userData',
  SESSION_TIMESTAMP: 'sessionTimestamp',
  USER_EMAIL: 'userEmail'
}

// Tiempo de expiración de sesión (8 horas en milisegundos)
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

/**
 * Guarda los datos de sesión del usuario
 * @param {Object} userData - Datos del usuario desde la API
 */
export function saveUserSession(userData) {
  try {
    const sessionData = {
      isLoggedIn: true,
      timestamp: new Date().getTime(),
      user: {
        miembroID: userData.miembroID,
        nombre: userData.nombre,
        email: userData.email,
        celular: userData.celular,
        id_clickup: userData.id_clickup,
        cedula: userData.cedula,
        fecha_creacion: userData.fecha_creacion,
        fecha_modificacion: userData.fecha_modificacion
      }
    }

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true')
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(sessionData.user))
    localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, sessionData.timestamp.toString())
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, userData.email)

    console.log('✅ Sesión guardada exitosamente:', sessionData.user.nombre)
    return sessionData
  } catch (error) {
    console.error('❌ Error al guardar sesión:', error)
    throw new Error('No se pudo guardar la sesión del usuario')
  }
}

/**
 * Obtiene los datos de sesión del usuario
 * @returns {Object|null} - Datos del usuario o null si no está logueado
 */
export function getUserSession() {
  try {
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN)
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
    const timestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP)

    if (!isLoggedIn || !userData || !timestamp) {
      console.log('⚠️ No hay sesión activa')
      return null
    }

    // Verificar si la sesión ha expirado
    const now = new Date().getTime()
    const sessionAge = now - parseInt(timestamp)
    
    if (sessionAge > SESSION_TIMEOUT) {
      console.log('⚠️ Sesión expirada')
      clearUserSession()
      return null
    }

    const parsedUserData = JSON.parse(userData)
    console.log('✅ Sesión activa para:', parsedUserData.nombre)
    
    return {
      isLoggedIn: true,
      user: parsedUserData,
      sessionAge: sessionAge
    }
  } catch (error) {
    console.error('❌ Error al obtener sesión:', error)
    clearUserSession()
    return null
  }
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si está logueado y la sesión es válida
 */
export function isAuthenticated() {
  const session = getUserSession()
  return session !== null && session.isLoggedIn === true
}

/**
 * Obtiene solo los datos del usuario actual
 * @returns {Object|null} - Datos del usuario o null
 */
export function getCurrentUser() {
  const session = getUserSession()
  return session ? session.user : null
}

/**
 * Limpia todos los datos de sesión
 */
export function clearUserSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP)
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL)
    
    // También limpiar datos legacy si existen
    localStorage.removeItem('loginData')
    
    console.log('✅ Sesión cerrada exitosamente')
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error)
  }
}

/**
 * Actualiza el timestamp de la sesión (para mantenerla activa)
 */
export function refreshSession() {
  const session = getUserSession()
  if (session) {
    localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, new Date().getTime().toString())
    console.log('🔄 Sesión actualizada')
    return true
  }
  return false
}

/**
 * Verifica si la sesión necesita ser renovada (falta menos de 1 hora para expirar)
 * @returns {boolean}
 */
export function needsSessionRefresh() {
  const session = getUserSession()
  if (!session) return false
  
  const oneHour = 60 * 60 * 1000
  return session.sessionAge > (SESSION_TIMEOUT - oneHour)
}

/**
 * Middleware para proteger rutas
 * @param {Function} navigate - función de navegación de React Router
 * @returns {boolean} - true si puede continuar, false si debe redirigir
 */
export function requireAuth(navigate) {
  if (!isAuthenticated()) {
    console.log('🚫 Acceso no autorizado, redirigiendo a login')
    navigate('/login')
    return false
  }
  
  // Refrescar sesión automáticamente si está cerca de expirar
  if (needsSessionRefresh()) {
    refreshSession()
  }
  
  return true
}

/**
 * Función para logout completo
 * @param {Function} navigate - función de navegación de React Router
 */
export function logout(navigate) {
  clearUserSession()
  console.log('👋 Usuario desconectado')
  navigate('/login')
}

/**
 * Obtiene información resumida de la sesión para debugging
 * @returns {Object}
 */
export function getSessionInfo() {
  const session = getUserSession()
  if (!session) return { active: false }
  
  return {
    active: true,
    user: session.user.nombre,
    email: session.user.email,
    sessionAge: Math.round(session.sessionAge / 1000 / 60), // en minutos
    expiresIn: Math.round((SESSION_TIMEOUT - session.sessionAge) / 1000 / 60) // en minutos
  }
}