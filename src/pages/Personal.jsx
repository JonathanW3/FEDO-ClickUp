import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Toast from '../components/Toast.jsx'
import { useToast } from '../hooks/useToast.js'
import { obtenerMiembros, crearMiembro, actualizarMiembro, formatearDatosParaAPI, TIPOS_PERSONAL } from '../utils/apiUtils.js'
import { requireAuth, getCurrentUser } from '../utils/authUtils'

function Modal({open, onClose, title, children}){
  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Personal(){
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar autenticación al cargar la página
  useEffect(() => {
    if (!requireAuth(navigate)) {
      return
    }

    const userData = getCurrentUser()
    if (userData) {
      setCurrentUser(userData)
    } else {
      navigate('/login')
    }
  }, [navigate])
  
  const [modal, setModal] = useState(null) // 'add' | 'edit' | null
  const [saving, setSaving] = useState(false) // Estado para mostrar loading al guardar
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    prioridad: 'Media',
    tipos: [],
    activo: true
  })
  const [editIndex, setEditIndex] = useState(-1)

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina] = useState(10)

  // Filtros de búsqueda
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    prioridad: '',
    estado: ''
  })

  // Toast notifications
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast()

  const tiposDisponibles = ['Tecnico', 'Vendedor', 'Gerencia', 'Distribuidor']
  const prioridadesDisponibles = ['Alta', 'Media', 'Baja']

  // Mapeo de tipos para la API (ahora importado desde utils)
  const tiposToNumbers = TIPOS_PERSONAL

  // Datos de ejemplo como fallback
  const datosEjemplo = [
    {
      miembroID: 1,
      personal: "Juan Carlos Pérez",
      email: "juan.perez@webpos.com",
      contacto: "809-555-0123",
      prioridad: "Alta",
      tipos: "Tecnico, Gerencia",
      estado: "Activo"
    },
    {
      miembroID: 2,
      personal: "María González",
      email: "maria.gonzalez@webpos.com", 
      contacto: "809-555-0124",
      prioridad: "Media",
      tipos: "Vendedor",
      estado: "Activo"
    }
  ]

  // Función para cargar datos de ejemplo
  function cargarDatosEjemplo() {
    const personalTransformado = datosEjemplo.map(item => ({
      id: item.miembroID,
      nombre: item.personal,
      email: item.email,
      telefono: item.contacto?.toString() || '',
      prioridad: item.prioridad || 'Media',
      tipos: item.tipos ? item.tipos.split(', ').map(t => t.trim()) : [],
      activo: item.estado === 'Activo'
    }))
    
    setRows(personalTransformado)
    setError(null)
    console.log('✅ Datos de ejemplo cargados')
  }

  // Función de diagnóstico para probar la API
  async function diagnosticarAPI() {
    console.log('🔍 === DIAGNÓSTICO DE API ===')
    console.log('🌐 VITE_N8N_BASE_URL:', import.meta.env.VITE_N8N_BASE_URL)
    console.log('📊 VITE_WEBHOOK_TABLA_MIEMBROS:', import.meta.env.VITE_WEBHOOK_TABLA_MIEMBROS)
    
    const testUrl = `${import.meta.env.VITE_N8N_BASE_URL}/TablaMiembros`
    console.log('🔗 URL a probar:', testUrl)
    
    try {
      // Probar conexión directa
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Type": "SQL",
          "Table": "Miembros"
        })
      })
      
      console.log('📡 Status de respuesta:', response.status)
      console.log('📋 Headers de respuesta:', Array.from(response.headers.entries()))
      
      const responseText = await response.text()
      console.log('📄 Respuesta cruda:', responseText)
      
      if (responseText) {
        try {
          const jsonData = JSON.parse(responseText)
          console.log('✅ JSON parseado exitosamente:', jsonData)
          showSuccess('Diagnóstico exitoso: API responde correctamente')
        } catch (parseError) {
          console.error('❌ Error al parsear JSON:', parseError)
          showError(`Respuesta no es JSON válido: ${parseError.message}`)
        }
      } else {
        console.warn('⚠️ Respuesta vacía')
        showWarning('API devuelve respuesta vacía')
      }
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error)
      showError(`Error de conexión: ${error.message}`)
    }
  }

  // Función para probar diferentes configuraciones de la API
  async function probarAPI() {
    const apiUrl = import.meta.env.VITE_PERSONAL_API_URL
    const apiDirecta = import.meta.env.VITE_PERSONAL_API_DIRECT
    
    console.log('=== PRUEBA DE API ===')
    console.log('URL con proxy:', apiUrl)
    console.log('URL directa:', apiDirecta)
    
    // Probar con diferentes URLs y métodos
    const configuraciones = [
      {
        nombre: 'POST con proxy (recomendado)',
        url: apiUrl,
        config: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      },
      {
        nombre: 'GET con proxy',
        url: apiUrl,
        config: {
          method: 'GET'
        }
      },
      {
        nombre: 'POST directo (CORS probablemente falle)',
        url: apiDirecta,
        config: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      }
    ]
    
    for (const { nombre, url, config } of configuraciones) {
      try {
        console.log(`\nProbando: ${nombre}`)
        console.log(`URL: ${url}`)
        const response = await fetch(url, config)
        console.log(`Status: ${response.status}`)
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ÉXITO! Datos recibidos:`, data)
          
          // Si funciona, actualizar automáticamente
          if (Array.isArray(data)) {
            const personalTransformado = data.map(item => ({
              id: item.miembroID,
              nombre: item.personal || 'N/A',
              email: item.email || 'N/A',
              telefono: item.contacto?.toString() || 'N/A',
              prioridad: item.prioridad || 'Media',
              tipos: item.tipos ? item.tipos.split(', ').map(t => t.trim()) : [],
              activo: item.estado === 'Activo'
            }))
            setRows(personalTransformado)
            setError(null)
            console.log('✅ Datos cargados automáticamente en la tabla')
          }
          break // Si funciona, salir del bucle
        } else {
          console.log(`❌ Error HTTP: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.log(`❌ Error con ${nombre}:`, error.message)
      }
    }
  }

  // Función para cargar datos de la API
  async function cargarPersonal() {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Cargando personal desde la API...')
      
      // Usar la función utilitaria
      const data = await obtenerMiembros()
      
      console.log('📊 Estructura de datos recibida de la API:', data)
      console.log('📊 Primer elemento de los datos:', data[0])
      
      // Transformar datos de la API al formato esperado por el componente
      const personalTransformado = data.map(item => {
        // Manejar diferentes estructuras de respuesta de la API
        const miembroData = item.crear_o_actualizar_miembro_json || item;
        
        return {
          id: miembroData.miembroID || item.miembroID,
          miembroID: miembroData.miembroID || item.miembroID,
          nombre: miembroData.nombre || miembroData.personal || 'N/A',
          email: miembroData.email || 'N/A',
          telefono: miembroData.celular?.toString() || miembroData.contacto?.toString() || 'N/A',
          prioridad: miembroData.prioridad || 'Media',
          tipos: (() => {
            // Manejar diferentes formatos de tipos
            if (Array.isArray(miembroData.tipos)) {
              // Si ya es un array de números, convertir a texto
              return miembroData.tipos.map(tipoNum => {
                const tipoTexto = Object.keys(TIPOS_PERSONAL).find(key => TIPOS_PERSONAL[key] === tipoNum);
                return tipoTexto || `Tipo ${tipoNum}`;
              });
            } else if (typeof miembroData.tipos === 'string') {
              // Si es string, hacer split
              return miembroData.tipos.split(', ').map(t => t.trim()).filter(Boolean);
            } else {
              // Fallback
              return [];
            }
          })(),
          activo: miembroData.estado === 'Activo' || miembroData.activo !== false,
          // Campos adicionales para compatibilidad con la tabla
          personal: miembroData.nombre || miembroData.personal || 'N/A',
          contacto: miembroData.celular?.toString() || miembroData.contacto?.toString() || 'N/A'
        };
      })
      
      setRows(personalTransformado)
      console.log('✅ Personal cargado exitosamente:', personalTransformado.length, 'registros')
      
    } catch (err) {
      console.error('❌ Error al cargar personal:', err)
      setError(err.message)
      
      // Mostrar notificación de error
      showError(
        `Error al cargar el personal: ${err.message}. Usando datos de ejemplo.`,
        5000
      )
      
      // Cargar datos de ejemplo como fallback
      cargarDatosEjemplo()
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarPersonal()
  }, [])

  function addRow(){
    setModal('add')
    setForm({
      nombre: '',
      email: '',
      telefono: '',
      prioridad: 'Media',
      tipos: [],
      activo: true
    })
    setEditIndex(-1)
  }

  function saveRow(){
    if(editIndex >= 0){
      // Editando registro existente - consumir API
      editarPersonalExistente()
    } else {
      // Creando nuevo personal - consumir API
      crearNuevoPersonal()
    }
  }

  async function editarPersonalExistente() {
    setSaving(true)
    try {
      // Usar función utilitaria para formatear datos
      const datosAPI = formatearDatosParaAPI(form)

      console.log('📝 Datos del formulario para editar:', form)
      console.log('🔄 Datos formateados para API de edición:', datosAPI)

      // Obtener el ID del miembro a editar
      const miembroId = rows[editIndex].miembroID || rows[editIndex].id

      // Usar función utilitaria para actualizar miembro
      const responseData = await actualizarMiembro(miembroId, datosAPI)

      // Actualizar en el estado local
      setRows(r => r.map((x,i)=> i===editIndex ? {
        ...form, 
        id: x.id,
        miembroID: x.miembroID,
        // Mapear para la tabla local
        personal: form.nombre,
        contacto: form.telefono,
        tipos: form.tipos.join(', ')
      } : x))
      
      setModal(null)
      
      // Mostrar notificación de éxito profesional
      showSuccess(
        `✅ ${form.nombre} ha sido actualizado exitosamente. Los cambios se han guardado en el sistema.`,
        5000
      )
      
    } catch (error) {
      console.error('❌ Error al editar personal:', error)
      showError(
        `❌ Error al actualizar ${form.nombre}. Por favor, verifique la conexión e inténtelo nuevamente.`,
        6000
      )
    } finally {
      setSaving(false)
    }
  }

  async function crearNuevoPersonal() {
    setSaving(true)
    try {
      // Usar función utilitaria para formatear datos
      const datosAPI = formatearDatosParaAPI(form)

      console.log('📝 Datos del formulario:', form)
      console.log('🔄 Datos formateados para API:', datosAPI)

      // Usar función utilitaria para crear miembro
      const responseData = await crearMiembro(datosAPI)

      // Agregar al estado local con un ID temporal
      const newId = Math.max(...rows.map(r => r.id || 0), 0) + 1
      const nuevoPersonal = {
        ...form, 
        id: newId,
        miembroID: responseData.id || newId, // Usar ID de la respuesta si está disponible
        // Mapear para la tabla local
        personal: form.nombre,
        contacto: form.telefono,
        tipos: form.tipos.join(', ')
      }
      
      setRows(r => [...r, nuevoPersonal])
      setModal(null)
      
      // Resetear el formulario
      setForm({
        nombre: '',
        email: '',
        telefono: '',
        prioridad: 'Media',
        tipos: [],
        activo: true
      })
      
      // Mostrar notificación de éxito profesional
      showSuccess(
        `✅ ${form.nombre} ha sido agregado exitosamente al equipo. El registro está ahora disponible en la tabla.`,
        5000
      )
      
      // Scroll suave hacia la tabla para mostrar el nuevo registro
      setTimeout(() => {
        const tableElement = document.querySelector('[data-table-container]');
        if (tableElement) {
          tableElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500)
      
    } catch (error) {
      console.error('Error al crear personal:', error)
      
      // Mostrar notificación de error profesional
      showError(
        `❌ Error al crear el personal: ${error.message}. Por favor, intente nuevamente.`,
        6000
      )
      
      // Mostrar opción de guardado local como fallback
      setTimeout(() => {
        const confirmLocal = window.confirm(
          `No se pudo conectar con el servidor para guardar "${form.nombre}".\n\n` +
          '¿Desea guardar este registro localmente como borrador?\n\n' +
          'Nota: Los borradores locales no se sincronizan con el servidor.'
        )
        
        if (confirmLocal) {
          const newId = Math.max(...rows.map(r => r.id || 0), 0) + 1
          const nuevoPersonal = {
            ...form, 
            id: newId,
            personal: form.nombre,
            contacto: form.telefono,
            tipos: form.tipos.join(', '),
            esBorrador: true // Marcar como borrador local
          }
          setRows(r => [...r, nuevoPersonal])
          setModal(null)
          
          showWarning(
            `📝 ${form.nombre} guardado como borrador local. Sincronizar cuando se restablezca la conexión.`,
            5000
          )
        }
      }, 1000)
    } finally {
      setSaving(false)
    }
  }

  function removeRow(i){
    setRows(r => r.filter((_,idx)=> idx!==i))
  }

  function startEdit(i){
    setEditIndex(i)
    setForm({...rows[i]})
    setModal('edit')
  }

  function toggleTipo(tipo) {
    setForm(f => ({
      ...f,
      tipos: f.tipos.includes(tipo) 
        ? f.tipos.filter(t => t !== tipo)
        : [...f.tipos, tipo]
    }))
  }

  function getPrioridadColor(prioridad) {
    switch(prioridad) {
      case 'Alta': return 'text-red-700 bg-red-100'
      case 'Media': return 'text-yellow-700 bg-yellow-100'
      case 'Baja': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  function getTipoColor(tipo) {
    switch(tipo) {
      case 'Tecnico': return 'text-blue-700 bg-blue-100'
      case 'Vendedor': return 'text-purple-700 bg-purple-100'
      case 'Gerencia': return 'text-indigo-700 bg-indigo-100'
      case 'Distribuidor': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  // Aplicar filtros a los datos
  const rowsFiltrados = rows.filter(row => {
    // Filtro de búsqueda (nombre, email, teléfono)
    const busquedaLower = filtros.busqueda.toLowerCase()
    const coincideBusqueda = !filtros.busqueda || 
      row.nombre.toLowerCase().includes(busquedaLower) ||
      row.email.toLowerCase().includes(busquedaLower) ||
      row.telefono.toLowerCase().includes(busquedaLower)

    // Filtro de tipo
    const coincideTipo = !filtros.tipo || 
      (Array.isArray(row.tipos) && row.tipos.includes(filtros.tipo))

    // Filtro de prioridad
    const coincidePrioridad = !filtros.prioridad || 
      row.prioridad === filtros.prioridad

    // Filtro de estado
    const coincideEstado = !filtros.estado || 
      (filtros.estado === 'Activo' ? row.activo : !row.activo)

    return coincideBusqueda && coincideTipo && coincidePrioridad && coincideEstado
  })

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [filtros])

  // Cálculos de paginación con datos filtrados
  const indiceUltimo = paginaActual * itemsPorPagina
  const indicePrimero = indiceUltimo - itemsPorPagina
  const rowsPaginados = rowsFiltrados.slice(indicePrimero, indiceUltimo)
  const totalPaginas = Math.ceil(rowsFiltrados.length / itemsPorPagina)

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina)
    // Scroll al top de la tabla
    const tableContainer = document.querySelector('[data-table-container]')
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const irPaginaAnterior = () => {
    if (paginaActual > 1) cambiarPagina(paginaActual - 1)
  }

  const irPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) cambiarPagina(paginaActual + 1)
  }

  // Mostrar loading mientras se verifica la autenticación
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout currentUser={currentUser}>
      <div className="h-full p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Personal</h1>
          <p className="text-gray-600">Administra técnicos, vendedores y personal de gerencia</p>
        </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button 
          onClick={addRow}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Agregar Personal
        </button>
        <button 
          onClick={cargarPersonal}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:bg-gray-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {loading ? 'Cargando...' : 'Cargar desde API'}
        </button>
        <button 
          onClick={diagnosticarAPI}
          className="bg-yellow-600 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Diagnosticar API
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-2">Error al cargar datos</h4>
              <pre className="text-red-600 text-sm whitespace-pre-wrap bg-red-100 p-3 rounded border">{error}</pre>
              <div className="mt-3">
                <button 
                  onClick={cargarPersonal}
                  className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{rows.filter(r => r.activo).length}</div>
          <div className="text-sm text-gray-600">Personal Activo</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{rows.filter(r => r.tipos.includes('Tecnico')).length}</div>
          <div className="text-sm text-gray-600">Técnicos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{rows.filter(r => r.tipos.includes('Vendedor')).length}</div>
          <div className="text-sm text-gray-600">Vendedores</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-indigo-600">{rows.filter(r => r.tipos.includes('Gerencia')).length}</div>
          <div className="text-sm text-gray-600">Gerencia</div>
        </div>
      </div>

      {/* Filtros de Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
          {(filtros.busqueda || filtros.tipo || filtros.prioridad || filtros.estado) && (
            <button
              onClick={() => setFiltros({ busqueda: '', tipo: '', prioridad: '', estado: '' })}
              className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda por texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                placeholder="Nombre, email o teléfono..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          {/* Filtro por Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Personal
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Todos los tipos</option>
              {tiposDisponibles.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={filtros.prioridad}
              onChange={(e) => setFiltros({ ...filtros, prioridad: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Todas las prioridades</option>
              {prioridadesDisponibles.map(prioridad => (
                <option key={prioridad} value={prioridad}>{prioridad}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Indicador de resultados */}
        {(filtros.busqueda || filtros.tipo || filtros.prioridad || filtros.estado) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Se encontraron <span className="font-semibold text-gray-900">{rowsFiltrados.length}</span> registro(s) de <span className="font-semibold text-gray-900">{rows.length}</span> total(es)
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" data-table-container>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Cargando personal...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipos</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rowsPaginados.map((row, i) => (
                  <tr key={row.id} className={`hover:bg-gray-50 ${row.esBorrador ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {row.nombre}
                          {row.esBorrador && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              📝 Borrador
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{row.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{row.telefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPrioridadColor(row.prioridad)}`}>
                        {row.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(row.tipos) ? row.tipos : []).map(tipo => (
                          <span key={tipo} className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(tipo)}`}>
                            {tipo}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        row.activo ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                      }`}>
                        {row.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEdit(indicePrimero + i)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => removeRow(indicePrimero + i)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rowsFiltrados.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {rows.length === 0 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                          )}
                        </svg>
                        {rows.length === 0 ? (
                          <>
                            <p className="text-lg font-medium text-gray-900 mb-1">No hay personal registrado</p>
                            <p className="text-gray-500">Los datos se cargarán desde la API o puedes agregar personal manualmente</p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-medium text-gray-900 mb-1">No se encontraron resultados</p>
                            <p className="text-gray-500 mb-3">Intenta ajustar los filtros de búsqueda</p>
                            <button
                              onClick={() => setFiltros({ busqueda: '', tipo: '', prioridad: '', estado: '' })}
                              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Limpiar filtros
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Controles de Paginación */}
        {!loading && rowsFiltrados.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={irPaginaAnterior}
                disabled={paginaActual === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  paginaActual === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={irPaginaSiguiente}
                disabled={paginaActual === totalPaginas}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  paginaActual === totalPaginas
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indicePrimero + 1}</span> a <span className="font-medium">{Math.min(indiceUltimo, rowsFiltrados.length)}</span> de{' '}
                  <span className="font-medium">{rowsFiltrados.length}</span> registros
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={irPaginaAnterior}
                    disabled={paginaActual === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      paginaActual === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPaginas)].map((_, index) => {
                    const numeroPagina = index + 1
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                      numeroPagina === 1 ||
                      numeroPagina === totalPaginas ||
                      (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
                    ) {
                      return (
                        <button
                          key={numeroPagina}
                          onClick={() => cambiarPagina(numeroPagina)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            paginaActual === numeroPagina
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {numeroPagina}
                        </button>
                      )
                    } else if (
                      numeroPagina === paginaActual - 2 ||
                      numeroPagina === paginaActual + 2
                    ) {
                      return (
                        <span key={numeroPagina} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                  
                  <button
                    onClick={irPaginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      paginaActual === totalPaginas
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        open={!!modal} 
        onClose={() => setModal(null)} 
        title={modal === 'edit' ? 'Editar Personal' : 'Agregar Personal'}
      >
        <form onSubmit={(e) => { e.preventDefault(); saveRow(); }} className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo {modal === 'edit' && <span className="text-gray-400">(Solo lectura)</span>}
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm(f => ({...f, nombre: e.target.value}))}
                  readOnly={modal === 'edit'}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    modal === 'edit' ? 'bg-gray-100 text-gray-600' : 'bg-white'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email {modal === 'edit' && <span className="text-gray-400">(Solo lectura)</span>}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({...f, email: e.target.value}))}
                  readOnly={modal === 'edit'}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    modal === 'edit' ? 'bg-gray-100 text-gray-600' : 'bg-white'
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-green-600">(Editable)</span>
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm(f => ({...f, telefono: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="809-555-0123"
                required
              />
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Configuración</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                <select
                  value={form.prioridad}
                  onChange={(e) => setForm(f => ({...f, prioridad: e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {prioridadesDisponibles.map(prioridad => (
                    <option key={prioridad} value={prioridad}>{prioridad}</option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="activo"
                      checked={form.activo}
                      onChange={() => setForm(f => ({...f, activo: true}))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="activo"
                      checked={!form.activo}
                      onChange={() => setForm(f => ({...f, activo: false}))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactivo</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tipos (Multi-select) */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tipos de Personal</h4>
            <p className="text-sm text-gray-600 mb-3">Selecciona uno o más tipos (puede tener múltiples roles)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tiposDisponibles.map(tipo => (
                <label key={tipo} className="flex items-center p-3 border rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={form.tipos.includes(tipo)}
                    onChange={() => toggleTipo(tipo)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">{tipo}</span>
                </label>
              ))}
            </div>
            {form.tipos.length === 0 && (
              <p className="text-red-500 text-sm mt-2">Debe seleccionar al menos un tipo</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModal(null)}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={form.tipos.length === 0 || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saving 
                ? 'Guardando...' 
                : (modal === 'edit' ? 'Guardar Cambios' : 'Crear Personal')
              }
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
    </AppLayout>
  )
}
