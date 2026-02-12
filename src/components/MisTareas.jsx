import React, { useState } from 'react'

export default function MisTareas() {
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const tareas = [
    { 
      id: 1,
      titulo: "Instalar router", 
      responsable: "Técnico 1", 
      prioridad: "Alta", 
      estado: "En progreso", 
      fecha: "2025-10-30",
      descripcion: "Instalar y configurar router WiFi en oficina principal del cliente",
      cliente: "Empresa ABC",
      ubicacion: "Santo Domingo, DN"
    },
    { 
      id: 2,
      titulo: "Enviar informe", 
      responsable: "Gabriel", 
      prioridad: "Media", 
      estado: "Por hacer", 
      fecha: "2025-10-29",
      descripcion: "Preparar y enviar informe mensual de actividades al supervisor",
      cliente: "Interno",
      ubicacion: "Oficina Central"
    },
    { 
      id: 3,
      titulo: "Llamar al cliente", 
      responsable: "Técnico 2", 
      prioridad: "Baja", 
      estado: "Completada", 
      fecha: "2025-10-25",
      descripcion: "Contactar al cliente para seguimiento post-implementación",
      cliente: "Distribuidora XYZ",
      ubicacion: "Santiago"
    },
    { 
      id: 4,
      titulo: "Configurar sistema", 
      responsable: "Técnico 1", 
      prioridad: "Alta", 
      estado: "Bloqueada", 
      fecha: "2025-11-01",
      descripcion: "Configurar sistema de facturación electrónica para nueva implementación",
      cliente: "Comercial DEF",
      ubicacion: "La Romana"
    },
    { 
      id: 5,
      titulo: "Revisar documentación", 
      responsable: "Gabriel", 
      prioridad: "Media", 
      estado: "Por hacer", 
      fecha: "2025-10-31",
      descripcion: "Revisar y actualizar documentación técnica del proyecto",
      cliente: "Proyecto Interno",
      ubicacion: "Remoto"
    }
  ]

  const tareasFiltradas = tareas.filter(tarea => {
    const coincideBuscar = tarea.titulo.toLowerCase().includes(buscar.toLowerCase()) ||
                          tarea.responsable.toLowerCase().includes(buscar.toLowerCase())
    const coincideEstado = !estado || tarea.estado === estado
    return coincideBuscar && coincideEstado
  })

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'Alta': return 'text-red-600 bg-red-50'
      case 'Media': return 'text-yellow-600 bg-yellow-50'
      case 'Baja': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Completada': return 'text-green-600 bg-green-50'
      case 'En progreso': return 'text-blue-600 bg-blue-50'
      case 'Por hacer': return 'text-gray-600 bg-gray-50'
      case 'Bloqueada': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const verTarea = (tarea) => {
    setTareaSeleccionada(tarea)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setTareaSeleccionada(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Mis Tareas</h2>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex gap-4 items-center flex-wrap">
          <input
            type="search"
            placeholder="Buscar tarea..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="flex-1 min-w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Por hacer">Por hacer</option>
            <option value="En progreso">En progreso</option>
            <option value="Bloqueada">Bloqueada</option>
            <option value="Completada">Completada</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tareasFiltradas.map((tarea, index) => (
                <tr key={tarea.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{tarea.titulo}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{tarea.responsable}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadColor(tarea.prioridad)}`}>
                      {tarea.prioridad}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(tarea.estado)}`}>
                      {tarea.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{tarea.fecha}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => verTarea(tarea)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      👁️ Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {tareasFiltradas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron tareas que coincidan con los filtros.
          </div>
        )}
      </div>

      {/* Modal para ver detalles de la tarea */}
      {mostrarModal && tareaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            {/* Header del modal */}
            <div className="bg-blue-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">Detalles de la Tarea</h3>
                  <p className="text-blue-100">#{tareaSeleccionada.id}</p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <p className="text-lg font-semibold text-gray-900">{tareaSeleccionada.titulo}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                    <p className="text-gray-900">{tareaSeleccionada.responsable}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <p className="text-gray-900">{tareaSeleccionada.cliente}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPrioridadColor(tareaSeleccionada.prioridad)}`}>
                      {tareaSeleccionada.prioridad}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor(tareaSeleccionada.estado)}`}>
                      {tareaSeleccionada.estado}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
                    <p className="text-gray-900">{tareaSeleccionada.fecha}</p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{tareaSeleccionada.descripcion}</p>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <p className="text-gray-900 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {tareaSeleccionada.ubicacion}
                </p>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cerrar
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Editar Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}