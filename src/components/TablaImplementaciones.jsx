import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import Card from './Card'

export default function TablaImplementaciones({
    datos,
    loading,
    error,
    onReload,
    onViewDetails
}) {
    const [filtroEmpresa, setFiltroEmpresa] = useState('')
    const [filtroRol, setFiltroRol] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [paginaActual, setPaginaActual] = useState(1)
    const registrosPorPagina = 10

    // Resetear a página 1 cuando cambien los filtros
    useEffect(() => {
        setPaginaActual(1)
    }, [filtroEmpresa, filtroRol, filtroEstado])

    // Función para filtrar implementaciones
    const implementacionesFiltradas = datos.filter(item => {
        return (
            (item.empresa || "").toLowerCase().includes(filtroEmpresa.toLowerCase()) &&
            (item.tecniconombre || "").toLowerCase().includes(filtroRol.toLowerCase()) &&
            (item.estado || "").toLowerCase().includes(filtroEstado.toLowerCase())
        )
    })

    // Lógica de paginación
    const totalPaginas = Math.ceil(implementacionesFiltradas.length / registrosPorPagina)
    const indiceInicio = (paginaActual - 1) * registrosPorPagina
    const indiceFin = indiceInicio + registrosPorPagina
    const implementacionesPaginadas = implementacionesFiltradas.slice(indiceInicio, indiceFin)

    // Función para cambiar página
    const cambiarPagina = (nuevaPagina) => {
        setPaginaActual(nuevaPagina)
    }

    // Funciones de exportación
    const exportarImplementacionesHTML = () => {
        const fechaActual = new Date().toLocaleDateString('es-DO')
        const horaActual = new Date().toLocaleTimeString('es-DO')

        let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Implementaciones y Tareas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8f9fa; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Implementaciones y Tareas</h1>
          <div class="info">
            <p>Fecha de generación: ${fechaActual} - ${horaActual}</p>
            <p>Total de registros: ${implementacionesFiltradas.length}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Empresa</th>
              <th>Estado</th>
              <th>Contacto</th>
              <th>Email</th>
              <th>Técnico</th>
              <th>Vendedor</th>
            </tr>
          </thead>
          <tbody>
    `

        implementacionesFiltradas.forEach((item, index) => {
            html += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.empresa_nombre}</td>
          <td>${item.estado || 'Sin estado'}</td>
          <td>${item.contacto}</td>
          <td>${item.contacto_email}</td>
          <td>${item.tecniconombre}</td>
          <td>${item.vendedornombre}</td>
        </tr>
      `
        })

        html += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generado por Sistema de Reportes FEDO-ClickUp</p>
        </div>
      </body>
      </html>
    `

        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `implementaciones_${new Date().toISOString().split('T')[0]}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const exportarImplementacionesXLSX = () => {
        const datosParaExcel = implementacionesFiltradas.map((item, index) => ({
            'Número': index + 1,
            'Empresa': item.empresa_nombre,
            'Estado': item.estado || 'Sin estado',
            'Contacto': item.contacto,
            'Email': item.contacto_email,
            'Técnico': item.tecniconombre,
            'Vendedor': item.vendedornombre,
            'RNC': item.RNC || '',
            'Dirección': item.direccion || '',
            'Monto Implementación': item.monto_implementacion || 0,
            'Fecha Contratación': item.fecha_contratacion ? new Date(item.fecha_contratacion).toLocaleDateString('es-DO') : '',
            'Fecha Inicio': item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es-DO') : '',
            'Fecha Modificación': item.fecha_modificacion ? new Date(item.fecha_modificacion).toLocaleDateString('es-DO') : ''
        }))

        const ws = XLSX.utils.json_to_sheet(datosParaExcel)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Implementaciones')

        // Ajustar el ancho de las columnas
        const columnWidths = [
            { wch: 8 },  // Número
            { wch: 25 }, // Empresa
            { wch: 15 }, // Estado
            { wch: 20 }, // Contacto
            { wch: 30 }, // Email
            { wch: 20 }, // Técnico
            { wch: 20 }, // Vendedor
            { wch: 15 }, // RNC
            { wch: 40 }, // Dirección
            { wch: 18 }, // Monto
            { wch: 18 }, // Fecha Contratación
            { wch: 15 }, // Fecha Inicio
            { wch: 18 }  // Fecha Modificación
        ]
        ws['!cols'] = columnWidths

        XLSX.writeFile(wb, `implementaciones_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    return (
        <Card>
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Reporte de Implementaciones y Tareas</h2>
                            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Gestión completa de proyectos de implementación</p>
                        </div>
                    </div>

                    {/* Botones de descarga para implementaciones */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={exportarImplementacionesHTML}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                            title="Descargar como HTML"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="hidden sm:inline">HTML</span>
                        </button>
                        <button
                            onClick={exportarImplementacionesXLSX}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                            title="Descargar como Excel"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="hidden sm:inline">XLSX</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-700 font-medium">Cargando datos de implementaciones...</p>
                        <p className="text-gray-500 text-sm mt-1">Por favor espera un momento</p>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center py-16 bg-gradient-to-br from-red-50 to-pink-100 rounded-xl">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar las implementaciones</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={onReload}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        🔄 Reintentar
                    </button>
                </div>
            ) : (
                <div className="space-y-6 sm:space-y-8">

                    {/* Filtros Mejorados */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Filtros de Búsqueda</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label htmlFor="filtroEmpresa" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    🏢 Empresa
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="filtroEmpresa"
                                        value={filtroEmpresa}
                                        onChange={(e) => setFiltroEmpresa(e.target.value)}
                                        placeholder="Buscar por nombre de empresa..."
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="filtroRol" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    👨‍💻 Técnico Asignado
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="filtroRol"
                                        value={filtroRol}
                                        onChange={(e) => setFiltroRol(e.target.value)}
                                        placeholder="Buscar por nombre del técnico..."
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="filtroEstado" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    📋 Estado
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="filtroEstado"
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value)}
                                        placeholder="Buscar por estado..."
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    📊 Estadísticas
                                </label>
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total:</span>
                                        <span className="text-lg font-bold text-blue-600">{implementacionesFiltradas.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-gray-500">Página {paginaActual} de {totalPaginas}</span>
                                        {(filtroEmpresa || filtroRol || filtroEstado) && (
                                            <button
                                                onClick={() => {
                                                    setFiltroEmpresa('')
                                                    setFiltroRol('')
                                                    setFiltroEstado('')
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Limpiar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla Mejorada - Version mobile-friendly con scroll horizontal */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Mensaje de scroll en móvil */}
                        <div className="lg:hidden bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                            </svg>
                            Desliza horizontalmente para ver más columnas
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                #️⃣ <span className="hidden sm:inline">Núm.</span>
                                            </div>
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                🏢 <span>Empresa</span>
                                            </div>
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                📊 <span>Estado</span>
                                            </div>
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                👤 <span>Contacto</span>
                                            </div>
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                📧 <span>Email</span>
                                            </div>
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                👨‍💻 <span>Técnico</span>
                                            </div>
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                💼 <span>Vendedor</span>
                                            </div>
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-gray-50">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                ⚡ <span className="hidden sm:inline">Acciones</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {implementacionesPaginadas.map((item, index) => (
                                        <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-25 hover:to-indigo-25 transition-all duration-200 group">
                                            <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                                                        {indiceInicio + index + 1}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors max-w-[150px] sm:max-w-none truncate" title={item.empresa_nombre}>
                                                            {item.empresa_nombre}
                                                        </div>
                                                        {item.empresas_hijas && item.empresas_hijas.length > 0 && (
                                                            <div className="text-xs text-purple-600 font-medium mt-1">
                                                                +{item.empresas_hijas.length} empresa{item.empresas_hijas.length > 1 ? 's' : ''} hija{item.empresas_hijas.length > 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border-2 ${
                                                    item.estado?.toLowerCase() === 'completado' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    item.estado?.toLowerCase() === 'en producción' || item.estado?.toLowerCase() === 'en producci[on]' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    item.estado?.toLowerCase() === 'pruebas/precertificacion' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                                                    item.estado?.toLowerCase() === 'inicio proyecto' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    item.estado?.toLowerCase() === 'en revision o debug' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    item.estado?.toLowerCase() === 'on hold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    item.estado?.toLowerCase() === 'no iniciado' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-gray-50 text-gray-700 border-gray-200'
                                                }`}>
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        item.estado?.toLowerCase() === 'completado' ? 'bg-green-500' :
                                                        item.estado?.toLowerCase() === 'en producción' || item.estado?.toLowerCase() === 'en producci[on]' ? 'bg-emerald-500' :
                                                        item.estado?.toLowerCase() === 'pruebas/precertificacion' ? 'bg-cyan-500' :
                                                        item.estado?.toLowerCase() === 'inicio proyecto' ? 'bg-blue-500' :
                                                        item.estado?.toLowerCase() === 'en revision o debug' ? 'bg-orange-500' :
                                                        item.estado?.toLowerCase() === 'on hold' ? 'bg-amber-500' :
                                                        item.estado?.toLowerCase() === 'no iniciado' ? 'bg-red-500' :
                                                        'bg-gray-500'
                                                    }`}></div>
                                                    {item.estado || 'Sin estado'}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center">
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                        </svg>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-900 max-w-[100px] sm:max-w-none truncate" title={item.contacto}>{item.contacto}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                                                <div className="max-w-[120px] sm:max-w-[200px] truncate" title={item.contacto_email}>
                                                    <a
                                                        href={`mailto:${item.contacto_email}`}
                                                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                    >
                                                        {item.contacto_email}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        T
                                                    </div>
                                                    <span className="hidden sm:inline">{item.tecniconombre}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-50 text-green-800 rounded-full text-xs font-semibold border border-green-200">
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        V
                                                    </div>
                                                    <span className="hidden sm:inline">{item.vendedornombre}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap sticky right-0 bg-white group-hover:bg-blue-25">
                                                <button
                                                    onClick={() => onViewDetails(item)}
                                                    className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                    <span className="hidden sm:inline">Ver</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación Mejorada */}
                    {implementacionesFiltradas.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                                {/* Información de resultados */}
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                                        <span className="font-medium">Mostrando</span>
                                        <span className="mx-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold text-xs">
                                            {indiceInicio + 1}
                                        </span>
                                        <span className="mx-1">a</span>
                                        <span className="mx-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold text-xs">
                                            {Math.min(indiceFin, implementacionesFiltradas.length)}
                                        </span>
                                        <span className="mx-1">de</span>
                                        <span className="mx-1 px-2 py-1 bg-green-100 text-green-800 rounded-lg font-bold text-xs">
                                            {implementacionesFiltradas.length}
                                        </span>
                                        <span className="hidden sm:inline">resultados</span>
                                    </div>
                                </div>

                                {/* Controles de navegación */}
                                <div className="flex items-center gap-1 sm:gap-2">

                                    {/* Botón anterior */}
                                    <button
                                        onClick={() => cambiarPagina(paginaActual - 1)}
                                        disabled={paginaActual === 1}
                                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                        </svg>
                                        <span className="hidden sm:block">Anterior</span>
                                    </button>

                                    {/* Números de página */}
                                    <div className="flex gap-1">
                                        {(() => {
                                            const obtenerNumerosPagina = () => {
                                                const delta = 1 // Número de páginas a mostrar a cada lado de la actual
                                                const range = []
                                                const rangeWithDots = []
                                                let l

                                                for (let i = 1; i <= totalPaginas; i++) {
                                                    if (i === 1 || i === totalPaginas || (i >= paginaActual - delta && i <= paginaActual + delta)) {
                                                        range.push(i)
                                                    }
                                                }

                                                range.forEach(i => {
                                                    if (l) {
                                                        if (i - l === 2) {
                                                            rangeWithDots.push(l + 1)
                                                        } else if (i - l !== 1) {
                                                            rangeWithDots.push('...')
                                                        }
                                                    }
                                                    rangeWithDots.push(i)
                                                    l = i
                                                })

                                                return rangeWithDots
                                            }

                                            return obtenerNumerosPagina().map((numero, index) => {
                                                if (numero === '...') {
                                                    return (
                                                        <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                                                            ...
                                                        </span>
                                                    )
                                                }

                                                const esActual = paginaActual === numero

                                                return (
                                                    <button
                                                        key={numero}
                                                        onClick={() => cambiarPagina(numero)}
                                                        className={`w-10 h-10 text-sm font-bold rounded-xl transition-all duration-200 ${esActual
                                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-110'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                                                            }`}
                                                    >
                                                        {numero}
                                                    </button>
                                                )
                                            })
                                        })()}
                                    </div>

                                    {/* Botón siguiente */}
                                    <button
                                        onClick={() => cambiarPagina(paginaActual + 1)}
                                        disabled={paginaActual === totalPaginas}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                                    >
                                        <span className="hidden sm:block">Siguiente</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>Página actual: {paginaActual}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Total páginas: {totalPaginas}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span>Registros por página: {registrosPorPagina}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje cuando no hay resultados */}
                    {implementacionesFiltradas.length === 0 && (
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 text-center border border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron resultados</h3>
                            <p className="text-gray-500 mb-4">
                                No hay implementaciones que coincidan con los filtros aplicados.
                            </p>
                            <button
                                onClick={() => {
                                    setFiltroEmpresa('')
                                    setFiltroRol('')
                                    setFiltroEstado('')
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}
