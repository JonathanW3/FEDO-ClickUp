import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearTarea } from '../utils/apiUtils'
import { getUserSession } from '../utils/authUtils'

export default function CrearTareas() {
  // Hook para navegación
  const navigate = useNavigate()
  
  // Obtener fecha actual en formato YYYY-MM-DD
  const fechaActual = new Date().toISOString().split('T')[0]
  
  const [formData, setFormData] = useState({
    asignar: '',
    fechaInicio: fechaActual, // Siempre la fecha actual
    cantidadClientFE: '',
    celular: '',
    emailTecnico: '',
    direccionFisica: '',
    fechaContratacion: '',
    formato: '',
    nombreCliente: '',
    nombreContacto: '',
    montoImplementacion: '',
    procesamientoAnual: '',
    rnc: '', // Cambiado de sistemaIntegrar a rnc
    sistema: '', // Cambiado de version a sistema
    transmision: '',
    abono: '',
    resumenContratado: '',
    vendedor: '',
    vendedorDistribuidor: '',
    esGrupo: 'no',
    nombreGrupo: '',
    cantidadNrcs: '0'
  })

  // Lista de sistemas disponibles para autocompletado
  const sistemasDisponibles = [
    'WebPOSenlaNube v: 1'
  ]

  const [sistemasSugeridos, setSistemasSugeridos] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [buscandoRnc, setBuscandoRnc] = useState(false)
  const [distribuidores, setDistribuidores] = useState([])
  const [cargandoDistribuidores, setCargandoDistribuidores] = useState(false)
  const [distribuidoresFiltrados, setDistribuidoresFiltrados] = useState([])
  const [mostrarDistribuidores, setMostrarDistribuidores] = useState(false)
  const [tecnicos, setTecnicos] = useState([])
  const [cargandoTecnicos, setCargandoTecnicos] = useState(false)
  const [vendedores, setVendedores] = useState([])
  const [cargandoVendedores, setCargandoVendedores] = useState(false)
  const [vendedoresFiltrados, setVendedoresFiltrados] = useState([])
  const [mostrarVendedores, setMostrarVendedores] = useState(false)
  
  // Estado para notificaciones profesionales
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    tipo: 'info', // 'success', 'error', 'warning', 'info'
    titulo: '',
    mensaje: ''
  })

  // Estado para modal de confirmación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

  // Efecto para asignar automáticamente el usuario actual y cargar datos
  useEffect(() => {
    // Asignar vendedor inmediatamente
    const sessionData = getUserSession()
    if (sessionData && sessionData.user && sessionData.user.nombre) {
      setFormData(prevData => ({
        ...prevData,
        vendedor: sessionData.user.nombre
      }))
    }
    
    // Cargar técnicos y distribuidores
    obtenerTecnicos()
    obtenerDistribuidores()
    obtenerVendedores()
  }, [])

  // Efecto para asignar el usuario actual cuando se cargan los técnicos
  useEffect(() => {
    const sessionData = getUserSession()
    if (sessionData && sessionData.user && sessionData.user.nombre && tecnicos.length > 0) {
      // Verificar si el usuario actual está en la lista de técnicos
      const usuarioEnTecnicos = tecnicos.find(tecnico => tecnico.nombre === sessionData.user.nombre)
      if (usuarioEnTecnicos) {
        setFormData(prevData => ({
          ...prevData,
          asignar: sessionData.user.nombre
        }))
      }
    }
  }, [tecnicos]) // Se ejecuta cuando se cargan los técnicos

  // Función para obtener el nombre del usuario actual
  const obtenerNombreUsuario = () => {
    const sessionData = getUserSession()
    console.log('Datos de sesión completos:', sessionData) // Para debug
    return sessionData && sessionData.user && sessionData.user.nombre ? sessionData.user.nombre : 'Usuario no identificado'
  }

  // Función para obtener distribuidores de la API
  const obtenerDistribuidores = async () => {
    setCargandoDistribuidores(true)
    try {
      const response = await fetch('https://n8n-dev.waopos.com/webhook/TablaMiembros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Table": "Distribuidores",
          "Type": "SQl",
          "Data": {}
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Distribuidores obtenidos:', data)
        
        // Eliminar duplicados basados en miembroID
        const distribuidoresUnicos = data?.reduce((acc, distribuidor) => {
          if (!acc.find(d => d.miembroID === distribuidor.miembroID)) {
            acc.push(distribuidor)
          }
          return acc
        }, []) || []
        
        if (distribuidoresUnicos.length < (data?.length || 0)) {
          console.warn(`⚠️ Se encontraron ${(data?.length || 0) - distribuidoresUnicos.length} distribuidores duplicados`)
        }
        
        setDistribuidores(distribuidoresUnicos)
      } else {
        console.error('Error al obtener distribuidores:', response.status)
      }
    } catch (error) {
      console.error('Error en la consulta de distribuidores:', error)
    } finally {
      setCargandoDistribuidores(false)
    }
  }

  // Función para obtener técnicos de la API
  const obtenerTecnicos = async () => {
    setCargandoTecnicos(true)
    try {
      const response = await fetch('https://n8n-dev.waopos.com/webhook/TablaMiembros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Table": "Tecnicos",
          "Type": "SQl",
          "Data": {}
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Técnicos obtenidos:', data)
        
        // Eliminar duplicados basados en miembroID
        const tecnicosUnicos = data?.reduce((acc, tecnico) => {
          if (!acc.find(t => t.miembroID === tecnico.miembroID)) {
            acc.push(tecnico)
          }
          return acc
        }, []) || []
        
        if (tecnicosUnicos.length < (data?.length || 0)) {
          console.warn(`⚠️ Se encontraron ${(data?.length || 0) - tecnicosUnicos.length} técnicos duplicados`)
        }
        
        setTecnicos(tecnicosUnicos)
      } else {
        console.error('Error al obtener técnicos:', response.status)
      }
    } catch (error) {
      console.error('Error en la consulta de técnicos:', error)
    } finally {
      setCargandoTecnicos(false)
    }
  }

  // Función para obtener vendedores de la API
  const obtenerVendedores = async () => {
    setCargandoVendedores(true)
    try {
      const response = await fetch('https://n8n-dev.waopos.com/webhook/TablaMiembros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Table": "Vendedores",
          "Type": "SQL"
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Vendedores obtenidos:', data)
        
        // Eliminar duplicados basados en miembroID
        const vendedoresUnicos = data?.reduce((acc, vendedor) => {
          if (!acc.find(v => v.miembroID === vendedor.miembroID)) {
            acc.push(vendedor)
          }
          return acc
        }, []) || []
        
        if (vendedoresUnicos.length < (data?.length || 0)) {
          console.warn(`⚠️ Se encontraron ${(data?.length || 0) - vendedoresUnicos.length} vendedores duplicados`)
        }
        
        setVendedores(vendedoresUnicos)
      } else {
        console.error('Error al obtener vendedores:', response.status)
      }
    } catch (error) {
      console.error('Error en la consulta de vendedores:', error)
    } finally {
      setCargandoVendedores(false)
    }
  }

  const [confirmaciones, setConfirmaciones] = useState({
    accesoPortal: false,
    firmaElectronica: false,
    noTieneFirma: false,
    noTieneAcceso: false,
    cambioRepresentante: false
  })

  const [requisitos, setRequisitos] = useState({
    firmoPropuestas: false,
    noFirmoPropuestas: false,
    hizoAvance: false,
    noHizoAvance: false,
    firmoCarta: false,
    noFirmoCarta: false,
    firmoAcuerdo: false,
    noFirmoAcuerdo: false
  })

  const [nrcs, setNrcs] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Actualizar emails y direcciones de todos los NRCs cuando cambien los campos principales
    if (name === 'emailTecnico' || name === 'direccionFisica') {
      const nuevosNrcs = [...nrcs]
      nuevosNrcs.forEach(nrc => {
        if (name === 'emailTecnico') {
          nrc.email = value
        }
        if (name === 'direccionFisica') {
          nrc.direccion = value
        }
      })
      setNrcs(nuevosNrcs)
    }

    // Manejar autocompletado para el campo sistema
    if (name === 'sistema') {
      if (value.trim() === '') {
        setSistemasSugeridos([])
        setMostrarSugerencias(false)
      } else {
        const sugerencias = sistemasDisponibles.filter(sistema =>
          sistema.toLowerCase().includes(value.toLowerCase())
        )
        setSistemasSugeridos(sugerencias)
        setMostrarSugerencias(sugerencias.length > 0)
      }
    }

    // Manejar autocompletado para vendedor
    if (name === 'vendedor') {
      if (value.trim() === '') {
        setVendedoresFiltrados([])
        setMostrarVendedores(false)
      } else {
        const filtrados = vendedores.filter(vendedor =>
          vendedor.nombre.toLowerCase().includes(value.toLowerCase())
        )
        setVendedoresFiltrados(filtrados)
        setMostrarVendedores(filtrados.length > 0)
      }
    }

    // Manejar autocompletado para distribuidor
    if (name === 'vendedorDistribuidor') {
      if (value.trim() === '') {
        setDistribuidoresFiltrados([])
        setMostrarDistribuidores(false)
      } else {
        const filtrados = distribuidores.filter(distribuidor =>
          distribuidor.nombre.toLowerCase().includes(value.toLowerCase())
        )
        setDistribuidoresFiltrados(filtrados)
        setMostrarDistribuidores(filtrados.length > 0)
      }
    }

    // Cuando cambia a "Si" en esGrupo, auto-llenar nombreGrupo con nombreCliente
    if (name === 'esGrupo' && value === 'si') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        nombreGrupo: prev.nombreCliente || ''
      }))
      return
    }

    if (name === 'cantidadNrcs') {
      const cantidad = parseInt(value) || 0
      const nuevosNrcs = []
      for (let i = 0; i < cantidad; i++) {
        nuevosNrcs.push({
          nombre: '',
          rnc: '',
          email: formData.emailTecnico || '', // Auto-llenar con email de contacto
          direccion: formData.direccionFisica || '', // Auto-llenar con dirección física
          activo: false,
          buscando: false // Para estado de búsqueda individual
        })
      }
      setNrcs(nuevosNrcs)
    }
  }

  const seleccionarSistema = (sistemaSeleccionado) => {
    setFormData(prev => ({
      ...prev,
      sistema: sistemaSeleccionado
    }))
    setMostrarSugerencias(false)
    setSistemasSugeridos([])
  }

  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    setNotificacion({
      mostrar: true,
      tipo,
      titulo,
      mensaje
    })
    // Auto-cerrar después de 4 segundos para notificaciones de éxito e info
    if (tipo === 'success' || tipo === 'info') {
      setTimeout(() => {
        setNotificacion(prev => ({ ...prev, mostrar: false }))
      }, 4000)
    }
  }

  // Función para mostrar confirmación antes de guardar
  const confirmarGuardarTarea = () => {
    setMostrarConfirmacion(true)
  }

  // Función para cancelar la confirmación
  const cancelarGuardado = () => {
    setMostrarConfirmacion(false)
  }

  // Función para enviar datos al API
  const enviarFormulario = async () => {
    try {
      // Mapeo de confirmaciones a textos descriptivos
      const textoConfirmaciones = {
        accesoPortal: "Acceso al portal de certificación de la DGII",
        firmaElectronica: "Firma electronica, archivo p12 y contraseña",
        noTieneFirma: "No tiene la firma aun",
        noTieneAcceso: "No tiene el acceso al portal de certificación",
        cambioRepresentante: "Cambio de representante"
      }

      // Mapeo de requisitos a textos descriptivos
      const textoRequisitos = {
        firmoPropuestas: "Firmó propuesta",
        noFirmoPropuestas: "No ha Firmado Propuesta",
        hizoAvance: "Hizo el avance",
        noHizoAvance: "No ha hecho el avance",
        firmoCarta: "Firmó carta de autorización de uso firma",
        noFirmoCarta: "No ha firmado carta de autorización de uso de firma",
        firmoAcuerdo: "Firmó Acuerdo de Servicio",
        noFirmoAcuerdo: "No ha firmado Acuerdo de Servicios"
      }

      // Transformar confirmaciones - solo los que están en true
      const confirmacionesTrue = Object.keys(confirmaciones)
        .filter(key => confirmaciones[key] === true)
        .map(key => textoConfirmaciones[key])

      // Transformar requisitos - solo los que están en true
      const requisitosTrue = Object.keys(requisitos)
        .filter(key => requisitos[key] === true)
        .map(key => textoRequisitos[key])

      // Preparar los datos para enviar con el formato solicitado
      const datosParaAPI = {
        formData: formData,
        confirmaciones: {
          "true": confirmacionesTrue
        },
        requisitos: {
          "true": requisitosTrue
        },
        nrcs: nrcs
      }

      console.log('📝 Datos a enviar:', JSON.stringify(datosParaAPI, null, 2))
      console.log('🔍 Verificación de campos críticos:')
      console.log('  - resumenContratado:', formData.resumenContratado || '(VACÍO)')
      console.log('  - vendedor:', formData.vendedor || '(VACÍO)')
      console.log('  - nombreCliente:', formData.nombreCliente || '(VACÍO)')
      console.log('  - rnc:', formData.rnc || '(VACÍO)')
      
      // Validación básica antes de enviar
      if (!formData.nombreCliente || !formData.rnc) {
        mostrarNotificacion('error', 'Datos incompletos', 'Nombre del cliente y RNC son obligatorios')
        setMostrarConfirmacion(false)
        return
      }

      // Usar el sistema centralizado de APIs
      const response = await crearTarea(datosParaAPI)
      
      mostrarNotificacion('success', '✅ Tarea creada exitosamente', 'La tarea se ha registrado correctamente en el sistema')
      
      // Cerrar modal de confirmación
      setMostrarConfirmacion(false)
      
      // Redirigir a Reportes después de 2 segundos para que el usuario vea el mensaje
      setTimeout(() => {
        navigate('/reportes')
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error al crear tarea:', error)
      mostrarNotificacion('error', 'Error al crear tarea', 
        `No se pudo crear la tarea: ${error.message || 'Error de conexión'}`)
    }
  }

  const cerrarNotificacion = () => {
    setNotificacion(prev => ({ ...prev, mostrar: false }))
  }

  const buscarRnc = async () => {
    const rnc = formData.rnc.trim()
    
    if (!rnc) {
      mostrarNotificacion('warning', 'Campo requerido', 'Por favor ingrese un RNC para buscar')
      return
    }

    // Validar formato básico de RNC (números y longitud)
    if (!/^\d{9,11}$/.test(rnc)) {
      mostrarNotificacion('error', 'Formato inválido', 'El RNC debe contener entre 9 y 11 dígitos')
      return
    }

    setBuscandoRnc(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_RNC_API_URL}38d12312-946a-4cc8-8ef1-100731a60bf0/${rnc}`)
      
      if (!response.ok) {
        throw new Error('Error al consultar el RNC')
      }
      
      const data = await response.json()
      
      // Asumir que la API devuelve el nombre en una propiedad como 'razonSocial' o 'nombre'
      if (data && (data.razonSocial || data.nombre || data.nombreComercial)) {
        const nombreEmpresa = data.razonSocial || data.nombre || data.nombreComercial
        setFormData(prev => ({
          ...prev,
          nombreCliente: nombreEmpresa,
          // Si está en modo grupo, también actualizar el nombre del grupo
          nombreGrupo: prev.esGrupo === 'si' ? nombreEmpresa : prev.nombreGrupo
        }))
        mostrarNotificacion('success', 'Empresa encontrada', `Se encontró: ${nombreEmpresa}`)
      } else {
        mostrarNotificacion('info', 'Sin resultados', 'No se encontró información para este RNC')
      }
    } catch (error) {
      console.error('Error al buscar RNC:', error)
      mostrarNotificacion('error', 'Error de conexión', 'Error al consultar el RNC. Verifique su conexión e intente nuevamente.')
    } finally {
      setBuscandoRnc(false)
    }
  }

  const handleConfirmacionChange = (e) => {
    const { name, checked } = e.target
    
    // Lógica para opciones mutuamente excluyentes
    let nuevasConfirmaciones = { ...confirmaciones, [name]: checked }
    
    // Si se marca "Acceso al portal", desmarcar "No tiene acceso"
    if (name === 'accesoPortal' && checked) {
      nuevasConfirmaciones.noTieneAcceso = false
    }
    
    // Si se marca "No tiene acceso", desmarcar "Acceso al portal"
    if (name === 'noTieneAcceso' && checked) {
      nuevasConfirmaciones.accesoPortal = false
    }
    
    // Si se marca "Firma electrónica", desmarcar "No tiene firma"
    if (name === 'firmaElectronica' && checked) {
      nuevasConfirmaciones.noTieneFirma = false
    }
    
    // Si se marca "No tiene firma", desmarcar "Firma electrónica"
    if (name === 'noTieneFirma' && checked) {
      nuevasConfirmaciones.firmaElectronica = false
    }
    
    setConfirmaciones(nuevasConfirmaciones)
  }

  const handleRequisitoChange = (e) => {
    const { name, checked } = e.target
    
    // Lógica para opciones mutuamente excluyentes
    let nuevosRequisitos = { ...requisitos, [name]: checked }
    
    // Si se marca "Firmó Propuestas", desmarcar "No firmó propuestas"
    if (name === 'firmoPropuestas' && checked) {
      nuevosRequisitos.noFirmoPropuestas = false
    }
    
    // Si se marca "No firmó propuestas", desmarcar "Firmó Propuestas"
    if (name === 'noFirmoPropuestas' && checked) {
      nuevosRequisitos.firmoPropuestas = false
    }
    
    // Si se marca "Hizo el avance", desmarcar "No hizo el avance"
    if (name === 'hizoAvance' && checked) {
      nuevosRequisitos.noHizoAvance = false
    }
    
    // Si se marca "No hizo el avance", desmarcar "Hizo el avance"
    if (name === 'noHizoAvance' && checked) {
      nuevosRequisitos.hizoAvance = false
    }
    
    // Si se marca "Firmó carta", desmarcar "No firmó carta"
    if (name === 'firmoCarta' && checked) {
      nuevosRequisitos.noFirmoCarta = false
    }
    
    // Si se marca "No firmó carta", desmarcar "Firmó carta"
    if (name === 'noFirmoCarta' && checked) {
      nuevosRequisitos.firmoCarta = false
    }
    
    // Si se marca "Firmó acuerdo", desmarcar "No firmó acuerdo"
    if (name === 'firmoAcuerdo' && checked) {
      nuevosRequisitos.noFirmoAcuerdo = false
    }
    
    // Si se marca "No firmó acuerdo", desmarcar "Firmó acuerdo"
    if (name === 'noFirmoAcuerdo' && checked) {
      nuevosRequisitos.firmoAcuerdo = false
    }
    
    setRequisitos(nuevosRequisitos)
  }

  const handleNrcChange = (index, field, value) => {
    const nuevosNrcs = [...nrcs]
    nuevosNrcs[index][field] = value
    setNrcs(nuevosNrcs)
  }

  const buscarRncIndividual = async (index) => {
    const rnc = nrcs[index].rnc.trim()
    
    if (!rnc) {
      mostrarNotificacion('warning', 'Campo requerido', `Por favor ingrese un RNC para el NRC #${index + 1}`)
      return
    }

    if (!/^\d{9,11}$/.test(rnc)) {
      mostrarNotificacion('error', 'Formato inválido', 'El RNC debe contener entre 9 y 11 dígitos')
      return
    }

    // Marcar como buscando para este NRC específico
    const nuevosNrcs = [...nrcs]
    nuevosNrcs[index].buscando = true
    setNrcs(nuevosNrcs)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_RNC_API_URL}38d12312-946a-4cc8-8ef1-100731a60bf0/${rnc}`)
      
      if (!response.ok) {
        throw new Error('Error al consultar el RNC')
      }
      
      const data = await response.json()
      
      if (data && (data.razonSocial || data.nombre || data.nombreComercial)) {
        const nombreEmpresa = data.razonSocial || data.nombre || data.nombreComercial
        nuevosNrcs[index].nombre = nombreEmpresa
        setNrcs(nuevosNrcs)
        mostrarNotificacion('success', 'Empresa encontrada', `NRC #${index + 1}: ${nombreEmpresa}`)
      } else {
        mostrarNotificacion('info', 'Sin resultados', `No se encontró información para el RNC del NRC #${index + 1}`)
      }
    } catch (error) {
      console.error('Error al buscar RNC:', error)
      mostrarNotificacion('error', 'Error de conexión', `Error al consultar el RNC del NRC #${index + 1}`)
    } finally {
      nuevosNrcs[index].buscando = false
      setNrcs(nuevosNrcs)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    confirmarGuardarTarea()
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-center text-blue-800 text-3xl font-bold mb-8">Crear Nueva Tarea</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ==================== REGIÓN: DATOS DE LA EMPRESA ==================== */}
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center justify-center">
              🏢 Datos de la Empresa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Nombre Empresa</label>
                <input 
                  type="text" 
                  name="nombreCliente"
                  value={formData.nombreCliente}
                  onChange={handleChange}
                  placeholder="Ej: Multiagros SRL"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Dirección física</label>
                <input 
                  type="text" 
                  name="direccionFisica"
                  value={formData.direccionFisica}
                  onChange={handleChange}
                  placeholder="Ej: C/ Sanchez #1 Bani"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">RNC</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="rnc"
                    value={formData.rnc}
                    onChange={handleChange}
                    placeholder="Ej: 130123456"
                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={buscarRnc}
                    disabled={buscandoRnc || !formData.rnc.trim()}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center min-w-[50px]"
                    title="Buscar empresa por RNC"
                  >
                    {buscandoRnc ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block font-semibold mb-2 text-gray-700">Sistema</label>
                <input 
                  type="text" 
                  name="sistema"
                  value={formData.sistema}
                  onChange={handleChange}
                  onFocus={() => {
                    if (formData.sistema.trim() !== '') {
                      const sugerencias = sistemasDisponibles.filter(sistema =>
                        sistema.toLowerCase().includes(formData.sistema.toLowerCase())
                      )
                      setSistemasSugeridos(sugerencias)
                      setMostrarSugerencias(sugerencias.length > 0)
                    } else {
                      // Mostrar todas las opciones si el campo está vacío
                      setSistemasSugeridos(sistemasDisponibles)
                      setMostrarSugerencias(true)
                    }
                  }}
                  onBlur={() => {
                    // Delay más largo para permitir clic en sugerencias
                    setTimeout(() => setMostrarSugerencias(false), 300)
                  }}
                  placeholder="Escriba o seleccione un sistema..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {/* Lista de sugerencias */}
                {mostrarSugerencias && sistemasSugeridos.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {sistemasSugeridos.map((sistema, index) => (
                      <div
                        key={index}
                        onMouseDown={(e) => {
                          e.preventDefault() // Prevenir que se dispare onBlur
                          seleccionarSistema(sistema)
                        }}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        {sistema}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Procesamiento anual</label>
                <input 
                  type="text" 
                  name="procesamientoAnual"
                  value={formData.procesamientoAnual}
                  onChange={handleChange}
                  placeholder="Ej: 50,000 documentos"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Cantidad de ClientFE</label>
                <input 
                  type="number" 
                  name="cantidadClientFE"
                  value={formData.cantidadClientFE}
                  onChange={handleChange}
                  placeholder="Ej: 5"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ==================== REGIÓN: DATOS DE CONTACTO ==================== */}
          <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center justify-center">
              📞 Datos de Contacto de la Empresa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Nombre Contacto</label>
                <input 
                  type="text" 
                  name="nombreContacto"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  placeholder="Ej: Yenni Bautista"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Email Contacto</label>
                <input 
                  type="email" 
                  name="emailTecnico"
                  value={formData.emailTecnico}
                  onChange={handleChange}
                  placeholder="Ej: yenni.bautista@empresa.com"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Celular</label>
                <input 
                  type="text" 
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="Ej: 809-472-4218"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-2 text-gray-700">🔐 Confirmaciones de Acceso</label>
                <div className="bg-white rounded-lg border border-green-200 p-3 space-y-2">
                  
                  {/* Grupo: Acceso al Portal */}
                  <div className="bg-blue-50 rounded-md p-2 border-l-2 border-blue-400">
                    <h4 className="font-medium text-blue-800 mb-1 text-xs">Portal DGII</h4>
                    <div className="grid grid-cols-1 gap-1">
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        confirmaciones.accesoPortal ? 'bg-green-100 text-green-800 font-medium' : 'hover:bg-blue-100 text-gray-700'
                      }`}>
                        <input 
                          type="checkbox" 
                          name="accesoPortal"
                          checked={confirmaciones.accesoPortal}
                          onChange={handleConfirmacionChange}
                          className="mr-2 w-3 h-3 text-green-600"
                        />
                        ✅ Tiene acceso al portal DGII
                      </label>
                      
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        confirmaciones.noTieneAcceso ? 'bg-red-100 text-red-800 font-medium' : 'hover:bg-blue-100 text-gray-700'
                      } ${confirmaciones.accesoPortal ? 'opacity-50 cursor-not-allowed line-through' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="noTieneAcceso"
                          checked={confirmaciones.noTieneAcceso}
                          onChange={handleConfirmacionChange}
                          disabled={confirmaciones.accesoPortal}
                          className="mr-2 w-3 h-3 text-red-600 disabled:opacity-50"
                        />
                        ❌ No tiene acceso al portal
                      </label>
                    </div>
                  </div>

                  {/* Grupo: Firma Electrónica */}
                  <div className="bg-purple-50 rounded-md p-2 border-l-2 border-purple-400">
                    <h4 className="font-medium text-purple-800 mb-1 text-xs">Firma Electrónica</h4>
                    <div className="grid grid-cols-1 gap-1">
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        confirmaciones.firmaElectronica ? 'bg-green-100 text-green-800 font-medium' : 'hover:bg-purple-100 text-gray-700'
                      }`}>
                        <input 
                          type="checkbox" 
                          name="firmaElectronica"
                          checked={confirmaciones.firmaElectronica}
                          onChange={handleConfirmacionChange}
                          className="mr-2 w-3 h-3 text-green-600"
                        />
                        🔐 Tiene firma electrónica y p12
                      </label>
                      
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        confirmaciones.noTieneFirma ? 'bg-red-100 text-red-800 font-medium' : 'hover:bg-purple-100 text-gray-700'
                      } ${confirmaciones.firmaElectronica ? 'opacity-50 cursor-not-allowed line-through' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="noTieneFirma"
                          checked={confirmaciones.noTieneFirma}
                          onChange={handleConfirmacionChange}
                          disabled={confirmaciones.firmaElectronica}
                          className="mr-2 w-3 h-3 text-red-600 disabled:opacity-50"
                        />
                        ⏳ No tiene firma aún
                      </label>
                    </div>
                  </div>

                  {/* Otros - En línea para ahorrar espacio */}
                  <div className="flex items-center bg-yellow-50 rounded-md p-2 border-l-2 border-yellow-400">
                    <label className={`flex items-center text-xs transition-colors cursor-pointer ${
                      confirmaciones.cambioRepresentante ? 'text-yellow-800 font-medium' : 'text-gray-700'
                    }`}>
                      <input 
                        type="checkbox" 
                        name="cambioRepresentante"
                        checked={confirmaciones.cambioRepresentante}
                        onChange={handleConfirmacionChange}
                        className="mr-2 w-3 h-3 text-yellow-600"
                      />
                      🔄 Cambio de Representante Legal
                    </label>
                  </div>

                  {/* Resumen Estado Compacto */}
                  {(confirmaciones.accesoPortal || confirmaciones.firmaElectronica || confirmaciones.noTieneAcceso || confirmaciones.noTieneFirma || confirmaciones.cambioRepresentante) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {confirmaciones.accesoPortal && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">✅ Portal</span>
                      )}
                      {confirmaciones.firmaElectronica && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">🔐 Firma</span>
                      )}
                      {confirmaciones.noTieneAcceso && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded font-medium">❌ Sin Portal</span>
                      )}
                      {confirmaciones.noTieneFirma && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded font-medium">⏳ Sin Firma</span>
                      )}
                      {confirmaciones.cambioRepresentante && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">🔄 Cambio</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== REGIÓN: DATOS TÉCNICO Y VENDEDOR ==================== */}
          <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
            <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center justify-center">
              👨‍💻 Datos del Técnico y Vendedor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Asignar</label>
                <select 
                  name="asignar"
                  value={formData.asignar}
                  onChange={handleChange}
                  disabled={cargandoTecnicos}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">
                    {cargandoTecnicos ? 'Cargando técnicos...' : 'Seleccione...'}
                  </option>
                  {tecnicos.map((tecnico, index) => (
                    <option key={`tecnico-${tecnico.miembroID}-${index}`} value={tecnico.nombre}>
                      {tecnico.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Vendedor</label>
                <div className="relative">
                  <input 
                    type="text"
                    name="vendedor"
                    value={formData.vendedor}
                    onChange={handleChange}
                    onFocus={() => {
                      if (vendedores.length > 0 && formData.vendedor.trim() !== '') {
                        const filtrados = vendedores.filter(v =>
                          v.nombre.toLowerCase().includes(formData.vendedor.toLowerCase())
                        )
                        setVendedoresFiltrados(filtrados)
                        setMostrarVendedores(filtrados.length > 0)
                      }
                    }}
                    onBlur={() => setTimeout(() => setMostrarVendedores(false), 200)}
                    placeholder={cargandoVendedores ? "Cargando vendedores..." : "Escribe para buscar vendedor..."}
                    disabled={cargandoVendedores}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {mostrarVendedores && vendedoresFiltrados.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {vendedoresFiltrados.map((vendedor, index) => (
                        <div
                          key={`vendedor-${vendedor.miembroID}-${index}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, vendedor: vendedor.nombre }))
                            setMostrarVendedores(false)
                          }}
                          className="px-4 py-2 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{vendedor.nombre}</div>
                          {vendedor.email && (
                            <div className="text-xs text-gray-500">{vendedor.email}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Vendedor / Distribuidor</label>
                <div className="relative">
                  <input 
                    type="text"
                    name="vendedorDistribuidor"
                    value={formData.vendedorDistribuidor}
                    onChange={handleChange}
                    onFocus={() => {
                      if (distribuidores.length > 0 && formData.vendedorDistribuidor.trim() !== '') {
                        const filtrados = distribuidores.filter(d =>
                          d.nombre.toLowerCase().includes(formData.vendedorDistribuidor.toLowerCase())
                        )
                        setDistribuidoresFiltrados(filtrados)
                        setMostrarDistribuidores(filtrados.length > 0)
                      }
                    }}
                    onBlur={() => setTimeout(() => setMostrarDistribuidores(false), 200)}
                    placeholder={cargandoDistribuidores ? "Cargando distribuidores..." : "Escribe para buscar distribuidor..."}
                    disabled={cargandoDistribuidores}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {mostrarDistribuidores && distribuidoresFiltrados.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {distribuidoresFiltrados.map((distribuidor, index) => (
                        <div
                          key={`dist-${distribuidor.miembroID}-${index}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, vendedorDistribuidor: distribuidor.nombre }))
                            setMostrarDistribuidores(false)
                          }}
                          className="px-4 py-2 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{distribuidor.nombre}</div>
                          {distribuidor.email && (
                            <div className="text-xs text-gray-500">{distribuidor.email}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Fecha inicio</label>
                <input 
                  type="date" 
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-600 cursor-not-allowed focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  title="Fecha automática - No editable"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Fecha contratación</label>
                <input 
                  type="date" 
                  name="fechaContratacion"
                  value={formData.fechaContratacion}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Monto de implementación</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="montoImplementacion"
                  value={formData.montoImplementacion}
                  onChange={handleChange}
                  placeholder="Ej: 3850.00"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Abono</label>
                <input 
                  type="text" 
                  name="abono"
                  value={formData.abono}
                  onChange={handleChange}
                  placeholder="Ej: 50% adelanto"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* ==================== REGIÓN: CONFIGURACIÓN TÉCNICA ==================== */}
          <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-500">
            <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center justify-center">
              ⚙️ Configuración Técnica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Formato</label>
                <select 
                  name="formato"
                  value={formData.formato}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Seleccione...</option>
                  <option value="XML">XML</option>
                  <option value="JSON">JSON</option>
                  <option value="TXT">TXT</option>
                  <option value="CSV">CSV</option>
                  <option value="SQL">SQL</option>
                  <option value="WEB">WEB</option>
                  <option value="TXT - VPrt">TXT - VPrt</option>
                  <option value="DBConn">DBConn</option>
                  <option value="Sin Enrolar">Sin Enrolar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Transmisión</label>
                <select 
                  name="transmision"
                  value={formData.transmision}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Seleccione...</option>
                  <option value="API/Rest">API/Rest</option>
                  <option value="SOAP">SOAP</option>
                  <option value="Shared Folder/Client FE">Shared Folder/Client FE</option>
                  <option value="DB Connector/Client FE">DB Connector/Client FE</option>
                  <option value="FTPS">FTPS</option>
                  <option value="Email">Email</option>
                  <option value="Client FE / Api">Client FE / Api</option>
                  <option value="Client FE / SOAP">Client FE / SOAP</option>
                  <option value="WEB / PORTAL">WEB / PORTAL</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">📋 Requisitos</label>
                <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                  
                  {/* Grupo: Propuestas */}
                  <div className="bg-blue-50 rounded-md p-2 border-l-2 border-blue-400">
                    <h4 className="font-medium text-blue-800 mb-1 text-xs">Propuestas</h4>
                    <div className="grid grid-cols-1 gap-1">
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        requisitos.firmoPropuestas ? 'bg-green-100 text-green-800 font-medium' : 'hover:bg-blue-100 text-gray-700'
                      }`}>
                        <input 
                          type="checkbox" 
                          name="firmoPropuestas"
                          checked={requisitos.firmoPropuestas}
                          onChange={handleRequisitoChange}
                          className="mr-2 w-3 h-3 text-green-600"
                        />
                        ✅ Firmó Propuestas
                      </label>
                      
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        requisitos.noFirmoPropuestas ? 'bg-red-100 text-red-800 font-medium' : 'hover:bg-blue-100 text-gray-700'
                      } ${requisitos.firmoPropuestas ? 'opacity-50 cursor-not-allowed line-through' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="noFirmoPropuestas"
                          checked={requisitos.noFirmoPropuestas}
                          onChange={handleRequisitoChange}
                          disabled={requisitos.firmoPropuestas}
                          className="mr-2 w-3 h-3 text-red-600 disabled:opacity-50"
                        />
                        ❌ No firmó Propuestas
                      </label>
                    </div>
                  </div>

                  {/* Grupo: Avance */}
                  <div className="bg-green-50 rounded-md p-2 border-l-2 border-green-400">
                    <h4 className="font-medium text-green-800 mb-1 text-xs">Avance de Pago</h4>
                    <div className="grid grid-cols-1 gap-1">
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        requisitos.hizoAvance ? 'bg-green-100 text-green-800 font-medium' : 'hover:bg-green-100 text-gray-700'
                      }`}>
                        <input 
                          type="checkbox" 
                          name="hizoAvance"
                          checked={requisitos.hizoAvance}
                          onChange={handleRequisitoChange}
                          className="mr-2 w-3 h-3 text-green-600"
                        />
                        💰 Hizo el avance
                      </label>
                      
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        requisitos.noHizoAvance ? 'bg-red-100 text-red-800 font-medium' : 'hover:bg-green-100 text-gray-700'
                      } ${requisitos.hizoAvance ? 'opacity-50 cursor-not-allowed line-through' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="noHizoAvance"
                          checked={requisitos.noHizoAvance}
                          onChange={handleRequisitoChange}
                          disabled={requisitos.hizoAvance}
                          className="mr-2 w-3 h-3 text-red-600 disabled:opacity-50"
                        />
                        ❌ No ha hecho el avance
                      </label>
                    </div>
                  </div>

                  {/* Grupo: Carta Autorización */}
                  <div className="bg-purple-50 rounded-md p-2 border-l-2 border-purple-400">
                    <h4 className="font-medium text-purple-800 mb-1 text-xs">Carta Autorización</h4>
                    <div className="grid grid-cols-1 gap-1">
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        requisitos.firmoCarta ? 'bg-green-100 text-green-800 font-medium' : 'hover:bg-purple-100 text-gray-700'
                      }`}>
                        <input 
                          type="checkbox" 
                          name="firmoCarta"
                          checked={requisitos.firmoCarta}
                          onChange={handleRequisitoChange}
                          className="mr-2 w-3 h-3 text-green-600"
                        />
                        📝 Firmó carta autorización firma
                      </label>
                      
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        requisitos.noFirmoCarta ? 'bg-red-100 text-red-800 font-medium' : 'hover:bg-purple-100 text-gray-700'
                      } ${requisitos.firmoCarta ? 'opacity-50 cursor-not-allowed line-through' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="noFirmoCarta"
                          checked={requisitos.noFirmoCarta}
                          onChange={handleRequisitoChange}
                          disabled={requisitos.firmoCarta}
                          className="mr-2 w-3 h-3 text-red-600 disabled:opacity-50"
                        />
                        ⏳ No firmó carta autorización
                      </label>
                    </div>
                  </div>

                  {/* Grupo: Acuerdo de Servicios */}
                  <div className="bg-yellow-50 rounded-md p-2 border-l-2 border-yellow-400">
                    <h4 className="font-medium text-yellow-800 mb-1 text-xs">Acuerdo de Servicios</h4>
                    <div className="grid grid-cols-1 gap-1">
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        requisitos.firmoAcuerdo ? 'bg-green-100 text-green-800 font-medium' : 'hover:bg-yellow-100 text-gray-700'
                      }`}>
                        <input 
                          type="checkbox" 
                          name="firmoAcuerdo"
                          checked={requisitos.firmoAcuerdo}
                          onChange={handleRequisitoChange}
                          className="mr-2 w-3 h-3 text-green-600"
                        />
                        ✅ Firmó acuerdo de servicio
                      </label>
                      
                      <label className={`flex items-center p-1 rounded text-xs transition-colors cursor-pointer ${
                        requisitos.noFirmoAcuerdo ? 'bg-red-100 text-red-800 font-medium' : 'hover:bg-yellow-100 text-gray-700'
                      } ${requisitos.firmoAcuerdo ? 'opacity-50 cursor-not-allowed line-through' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="noFirmoAcuerdo"
                          checked={requisitos.noFirmoAcuerdo}
                          onChange={handleRequisitoChange}
                          disabled={requisitos.firmoAcuerdo}
                          className="mr-2 w-3 h-3 text-red-600 disabled:opacity-50"
                        />
                        📄 No firmó acuerdo servicios
                      </label>
                    </div>
                  </div>

                  {/* Resumen Estado Compacto */}
                  {(requisitos.firmoPropuestas || requisitos.hizoAvance || requisitos.firmoCarta || requisitos.firmoAcuerdo || 
                    requisitos.noFirmoPropuestas || requisitos.noHizoAvance || requisitos.noFirmoCarta || requisitos.noFirmoAcuerdo) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {requisitos.firmoPropuestas && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">✅ Propuestas</span>
                      )}
                      {requisitos.hizoAvance && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">💰 Avance</span>
                      )}
                      {requisitos.firmoCarta && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">📝 Carta</span>
                      )}
                      {requisitos.firmoAcuerdo && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">✅ Acuerdo</span>
                      )}
                      {requisitos.noFirmoPropuestas && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded font-medium">❌ Sin Propuestas</span>
                      )}
                      {requisitos.noHizoAvance && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded font-medium">❌ Sin Avance</span>
                      )}
                      {requisitos.noFirmoCarta && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded font-medium">⏳ Sin Carta</span>
                      )}
                      {requisitos.noFirmoAcuerdo && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded font-medium">📄 Sin Acuerdo</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block font-semibold mb-2 text-gray-700">📝 Resumen contratado</label>
                <textarea 
                  name="resumenContratado"
                  value={formData.resumenContratado}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Detalle completo de los servicios contratados..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* ==================== REGIÓN: GESTIÓN DE GRUPOS ==================== */}
          <div className="bg-indigo-50 rounded-lg p-6 border-l-4 border-indigo-500">
            <h2 className="text-xl font-bold text-indigo-800 mb-4 flex items-center justify-center">
              🏢 Gestión de Grupos Empresariales
            </h2>
            
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-gray-700 text-center">¿Es un grupo?</label>
              <div className="flex gap-4 justify-center">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="esGrupo"
                    value="si"
                    checked={formData.esGrupo === 'si'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Sí
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="esGrupo"
                    value="no"
                    checked={formData.esGrupo === 'no'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {formData.esGrupo === 'si' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Nombre del Grupo</label>
                    <input 
                      type="text" 
                      name="nombreGrupo"
                      value={formData.nombreGrupo}
                      onChange={handleChange}
                      placeholder="Ingrese nombre del grupo"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Cantidad NRCs</label>
                    <input 
                      type="number"
                      name="cantidadNrcs"
                      value={formData.cantidadNrcs}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      placeholder="Ej: 3"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Máximo 50 NRCs permitidos</p>
                  </div>
                </div>

                {/* NRCs dinámicos */}
                {nrcs.map((nrc, index) => (
                  <div key={index} className="bg-white rounded-lg border border-indigo-200 p-4">
                    <h4 className="text-indigo-600 font-semibold mb-4">🏢 NRC #{index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-medium mb-1">Nombre</label>
                        <input 
                          type="text"
                          value={nrc.nombre}
                          onChange={(e) => handleNrcChange(index, 'nombre', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Nombre de la empresa"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">RNC</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={nrc.rnc}
                            onChange={(e) => handleNrcChange(index, 'rnc', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ej: 130123456"
                          />
                          <button
                            type="button"
                            onClick={() => buscarRncIndividual(index)}
                            disabled={nrc.buscando || !nrc.rnc.trim()}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center min-w-[40px]"
                            title={`Buscar empresa por RNC para NRC #${index + 1}`}
                          >
                            {nrc.buscando ? (
                              <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <svg 
                                className="w-3 h-3" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Email</label>
                        <input 
                          type="email"
                          value={nrc.email}
                          onChange={(e) => handleNrcChange(index, 'email', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="email@empresa.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-llenado desde Email Contacto</p>
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Dirección</label>
                        <input 
                          type="text"
                          value={nrc.direccion}
                          onChange={(e) => handleNrcChange(index, 'direccion', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Dirección completa"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-llenado desde Dirección física</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="flex items-center">
                        <input 
                          type="checkbox"
                          checked={nrc.activo}
                          onChange={(e) => handleNrcChange(index, 'activo', e.target.checked)}
                          className="mr-2"
                        />
                        ✅ Activo
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 rounded-xl transition-all font-semibold text-lg shadow-lg"
            >
              💾 Guardar Registro
            </button>
          </div>
        </form>
        
        {/* Componente de Notificación Profesional */}
        {notificacion.mostrar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-md w-full transform transition-all">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notificacion.tipo === 'success' && (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {notificacion.tipo === 'error' && (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {notificacion.tipo === 'warning' && (
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  )}
                  {notificacion.tipo === 'info' && (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {notificacion.titulo}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {notificacion.mensaje}
                  </p>
                </div>
                <button
                  onClick={cerrarNotificacion}
                  className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={cerrarNotificacion}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    notificacion.tipo === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    notificacion.tipo === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                    notificacion.tipo === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación */}
        {mostrarConfirmacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                {/* Icono de confirmación */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¿Confirmar creación de tarea?
                </h3>
                
                <p className="text-sm text-gray-500 mb-6">
                  Se creará una nueva tarea con los datos ingresados. Esta acción no se puede deshacer.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={cancelarGuardado}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={enviarFormulario}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Sí, crear tarea
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}