import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import WebPOSLogo from '../components/WebPOSLogo'
import { iniciarSesion } from '../utils/apiUtils'
import { saveUserSession, isAuthenticated } from '../utils/authUtils'

const RECAPTCHA_SITE_KEY = '6LcjaaskAAAAABWJYC0TKyTaxHtNyWBB3YQ5hOHE'

export default function Login(){
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const recaptchaRef = useRef(null)
  
  // Estados para 2FA
  const [fase2FA, setFase2FA] = useState('credenciales') // 'credenciales' | 'verificacion'
  const [codigo2FA, setCodigo2FA] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [tiempoRestante, setTiempoRestante] = useState(300) // 5 minutos
  const [intentosRestantes, setIntentosRestantes] = useState(3)

  // Verificar si ya está logueado al cargar el componente
  useEffect(() => {
    if (isAuthenticated()) {
      console.log('👤 Usuario ya autenticado, redirigiendo a dashboard')
      nav('/dashboard')
    }
  }, [nav])

  // Inicializar reCAPTCHA cuando el componente se monta
  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && recaptchaRef.current) {
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token) => {
            setRecaptchaToken(token)
            setError('')
          },
          'expired-callback': () => {
            setRecaptchaToken('')
          }
        })
      }
    }

    // Esperar a que el script de reCAPTCHA esté cargado
    if (window.grecaptcha) {
      loadRecaptcha()
    } else {
      window.addEventListener('load', loadRecaptcha)
      return () => window.removeEventListener('load', loadRecaptcha)
    }
  }, [])

  // Temporizador para el código 2FA
  useEffect(() => {
    if (fase2FA === 'verificacion' && tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            setFase2FA('credenciales')
            setError('El código ha expirado. Por favor, intenta nuevamente.')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [fase2FA, tiempoRestante])

  async function handleSolicitarCodigo2FA(){
    if (!email || !password) {
      setError('Por favor, completa todos los campos')
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido')
      return
    }

    // Validar contraseña (8-15 caracteres)
    if (password.length < 8 || password.length > 15) {
      setError('La contraseña debe tener entre 8 y 15 caracteres')
      return
    }

    // Validar reCAPTCHA
    if (!recaptchaToken) {
      setError('Por favor, completa la verificación reCAPTCHA')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('🔐 Solicitando código 2FA...')
      
      // Llamar a API para solicitar código 2FA
      const response = await fetch('https://n8n-dev.waopos.com/webhook/TablaMiembros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "Table": "Solicitar2FA",
          "Type": "SQL",
          "Data": {
            "email": email,
            "cedula": password,
            "recaptchaToken": recaptchaToken
          }
        })
      })

      // Verificar si la respuesta es válida
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      console.log('📥 Respuesta del servidor:', responseText)

      // Intentar parsear como JSON
      let data
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta:', responseText)
        throw new Error('Respuesta del servidor no es JSON válido')
      }

      console.log('📋 Datos parseados:', data)
      
      // Si es un array, tomar el primer elemento
      if (Array.isArray(data) && data.length > 0) {
        data = data[0]
      }
      
      // Verificar si hay un error explícito del backend
      if (data.success === false) {
        console.error('❌ Error del backend:', data)
        setError(data.message || 'Credenciales incorrectas o error en la validación.')
        return
      }
      
      // Verificar si tiene session_token (nuevo formato del backend)
      if (data.session_token) {
        console.log('✅ Código 2FA enviado al email:', data.email)
        console.log('🔑 Session token recibido:', data.session_token)
        
        setSessionToken(data.session_token)
        setFase2FA('verificacion')
        setTiempoRestante(300) // Reset a 5 minutos
        setIntentosRestantes(3) // Reset a 3 intentos
        setError('')
      }
      // Verificar si la validación de reCAPTCHA fue exitosa (formato anterior)
      else if (data.success === true) {
        console.log('✅ reCAPTCHA validado correctamente')
        
        // Si tiene sessionToken, usarlo; si no, generar uno temporal (para testing)
        const token = data.sessionToken || `temp-session-${Date.now()}`
        
        if (!data.sessionToken) {
          console.warn('⚠️ No se recibió sessionToken del backend, usando temporal para testing')
          console.warn('⚠️ El backend debe generar código 2FA, guardarlo en DB y devolver sessionToken')
        }
        
        setSessionToken(token)
        setFase2FA('verificacion')
        setTiempoRestante(300) // Reset a 5 minutos
        setError('')
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor:', data)
        console.warn('📝 Estructura recibida:', JSON.stringify(data, null, 2))
        setError(data?.message || 'Respuesta inesperada del servidor. Verifica la consola para más detalles.')
      }
    } catch (err) {
      console.error('❌ Error al solicitar código 2FA:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerificarCodigo2FA(){
    if (!codigo2FA || codigo2FA.length !== 6) {
      setError('Por favor, ingresa el código de 6 dígitos')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('🔐 Verificando código 2FA...')
      console.log('📤 Enviando session_token:', sessionToken)
      console.log('📤 Enviando código:', codigo2FA)
      
      // Llamar a API para verificar el código
      const response = await fetch('https://n8n-dev.waopos.com/webhook/TablaMiembros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "Table": "code",
          "Type": "SQL",
          "Data": {
            "session_token": sessionToken,
            "code": codigo2FA
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      console.log('📥 Respuesta de verificación:', responseText)

      let data
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta:', responseText)
        throw new Error('Respuesta del servidor no es JSON válido')
      }

      // Si es un array, tomar el primer elemento
      if (Array.isArray(data) && data.length > 0) {
        data = data[0]
      }

      console.log('📋 Datos de verificación:', data)
      
      // Verificar si el código fue validado exitosamente y hay datos de usuario
      if (data.success === true && data.userInfo) {
        console.log('✅ Código verificado correctamente, login exitoso:', data.userInfo)
        
        // Guardar sesión usando el nuevo sistema
        saveUserSession(data.userInfo)
        
        // Redirigir al dashboard
        nav('/dashboard')
      } 
      // Verificar si el código es incorrecto pero quedan intentos
      else if (data.success === false && data.error === 'CODIGO_INCORRECTO') {
        console.warn('⚠️ Código incorrecto, intentos restantes:', data.intentosRestantes)
        setIntentosRestantes(data.intentosRestantes)
        setCodigo2FA('') // Limpiar el input
        setError(data.message || `Código incorrecto. Te quedan ${data.intentosRestantes} intento(s).`)
      }
      // Verificar si se excedió el número máximo de intentos
      else if (data.success === false && data.error === 'MAX_INTENTOS_EXCEDIDO') {
        console.error('❌ Máximo de intentos excedido')
        setIntentosRestantes(0)
        setError(data.message || 'Has excedido el número máximo de intentos. Solicita un nuevo código.')
      }
      else if (data.success === true) {
        // Código válido pero falta userInfo
        console.warn('⚠️ Código válido pero falta información del usuario')
        setError('Código correcto, pero falta configurar retorno de datos de usuario en el backend.')
      } else {
        console.warn('⚠️ Error en la respuesta:', data)
        setError(data?.message || 'Error al verificar el código. Intenta nuevamente.')
      }
    } catch (err) {
      console.error('❌ Error durante la verificación:', err)
      setError(`Error al verificar el código: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function handleVolverACredenciales() {
    setFase2FA('credenciales')
    setCodigo2FA('')
    setSessionToken('')
    setTiempoRestante(300)
    setIntentosRestantes(3)
    setError('')
  }

  async function handleReenviarCodigo() {
    setCodigo2FA('')
    setIntentosRestantes(3)
    await handleSolicitarCodigo2FA()
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Información de la empresa */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-center relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 text-white">
          <div className="mb-8">
            <div className="mb-6">
              <WebPOSLogo variant="white" className="h-16 w-auto" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Portal de Gestión
              <br />
              <span className="text-blue-200">WebPOS</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Administra tareas, personal y reportes desde una plataforma unificada y moderna.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-blue-100">Gestión de tareas y personal</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-blue-100">Reportes y alertas en tiempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-blue-100">Interfaz intuitiva y responsive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="mb-4">
              <WebPOSLogo className="h-16 sm:h-20 w-auto mx-auto" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Portal WebPOS</h1>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {fase2FA === 'credenciales' ? 'Iniciar Sesión' : 'Verificación 2FA'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {fase2FA === 'credenciales' 
                  ? 'Ingresa tus credenciales para continuar'
                  : `Ingresa el código enviado a ${email}`
                }
              </p>
            </div>

            {/* Fase 1: Credenciales */}
            {fase2FA === 'credenciales' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSolicitarCodigo2FA(); }} className="space-y-5 sm:space-y-6">
                
                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campo Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="ejemplo@webpospanama.com"
                      required
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="8-15 caracteres"
                      minLength="8"
                      maxLength="15"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                      <span className={`text-xs ${
                        password.length >= 8 && password.length <= 15 ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {password.length}/15
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {password.length > 0 && (password.length < 8 || password.length > 15) && (
                    <p className="mt-1 text-xs text-amber-600">
                      La contraseña debe tener entre 8 y 15 caracteres
                    </p>
                  )}
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  <div ref={recaptchaRef}></div>
                </div>

                {/* Botones */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando código...
                      </>
                    ) : (
                      'Continuar'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Fase 2: Verificación de código 2FA */}
            {fase2FA === 'verificacion' && (
              <form onSubmit={(e) => { e.preventDefault(); handleVerificarCodigo2FA(); }} className="space-y-5 sm:space-y-6">
                
                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info del código */}
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">
                        Hemos enviado un código de 6 dígitos a tu correo electrónico.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Temporizador e Intentos */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Código válido por: <span className="font-semibold text-blue-600">
                      {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Intentos restantes: <span className={`font-semibold ${
                      intentosRestantes === 0 ? 'text-red-600' : 
                      intentosRestantes === 1 ? 'text-amber-600' : 
                      'text-green-600'
                    }`}>
                      {intentosRestantes}/3
                    </span>
                  </p>
                </div>

                {/* Campo Código 2FA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Verificación
                  </label>
                  <input
                    type="text"
                    value={codigo2FA}
                    onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="000000"
                    maxLength="6"
                    required
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    Ingresa el código de 6 dígitos
                  </p>
                </div>

                {/* Botones */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || codigo2FA.length !== 6 || intentosRestantes === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </>
                    ) : intentosRestantes === 0 ? (
                      'Sin intentos disponibles'
                    ) : (
                      'Verificar Código'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReenviarCodigo}
                    disabled={loading}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {intentosRestantes === 0 ? 'Solicitar Nuevo Código' : 'Reenviar Código'}
                  </button>

                  <button
                    type="button"
                    onClick={handleVolverACredenciales}
                    className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
                  >
                    ← Volver a inicio de sesión
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>&copy; 2025 WebPOS. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
