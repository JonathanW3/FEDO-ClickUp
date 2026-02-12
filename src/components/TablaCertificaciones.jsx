import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import Card from './Card'

export default function TablaCertificaciones({
    datos,
    loading,
    error,
    onReload,
    usandoDatosFallback = false
}) {
    // Debug: Verificar datos recibidos
    useEffect(() => {
        console.log('🔍 TablaCertificaciones - Datos recibidos:', datos)
        console.log('🔍 TablaCertificaciones - Es array?:', Array.isArray(datos))
        console.log('🔍 TablaCertificaciones - Cantidad:', datos?.length || 0)
        console.log('🔍 TablaCertificaciones - Loading:', loading)
        console.log('🔍 TablaCertificaciones - Error:', error)
        console.log('🔍 TablaCertificaciones - Usando fallback?:', usandoDatosFallback)
    }, [datos, loading, error, usandoDatosFallback])

    const [filtrosCert, setFiltrosCert] = useState({
        nombreEmpresa: '',
        rnc: '',
        certificacion: '',
        tecnico: ''
    })
    const [paginaActualCert, setPaginaActualCert] = useState(1)
    const registrosPorPaginaCert = 10

    // Resetear a página 1 cuando cambien los filtros de certificación
    useEffect(() => {
        setPaginaActualCert(1)
    }, [filtrosCert.nombreEmpresa, filtrosCert.rnc, filtrosCert.certificacion, filtrosCert.tecnico])

    const handleFiltroCertChange = (campo, valor) => {
        const nuevosFiltros = { ...filtrosCert, [campo]: valor }
        setFiltrosCert(nuevosFiltros)
    }

    const limpiarFiltrosCert = () => {
        setFiltrosCert({
            nombreEmpresa: '',
            rnc: '',
            certificacion: '',
            tecnico: ''
        })
    }

    // Función para filtrar datos de certificación
    // Asegurar que datos sea un array válido
    const datosValidos = Array.isArray(datos) ? datos : []
    
    // Debug del filtrado
    useEffect(() => {
        if (datosValidos.length > 0) {
            console.log('🔍 Filtrado - Datos válidos:', datosValidos.length)
            console.log('🔍 Filtrado - Filtros activos:', filtrosCert)
        }
    }, [datosValidos.length, filtrosCert])
    
    const certificacionesFiltradas = datosValidos.filter(item => {
        // Filtro especial para certificación en blanco
        let cumpleFiltrocertificacion = true
        if (filtrosCert.certificacion) {
            const filtroCertLower = filtrosCert.certificacion.toLowerCase().trim()
            const valorCert = (item.certificacionempresapadre || "").trim()
            const valorCertLower = valorCert.toLowerCase()
            
            // Si busca "blanco", "vacío", "sin estado" o variantes
            if (filtroCertLower.includes('blanco') || filtroCertLower.includes('vacio') || filtroCertLower.includes('vacío') || filtroCertLower.includes('sin estado')) {
                cumpleFiltrocertificacion = valorCert === ''
            } 
            // Si escribe exactamente "finalización" o "finalizacion" (solo eso), buscar estado completo
            else if (filtroCertLower === 'finalización' || filtroCertLower === 'finalizacion') {
                cumpleFiltrocertificacion = valorCertLower === 'paso 15 finalización' || valorCertLower === 'paso 15 finalizacion'
            }
            // Si escribe "sin empezar" buscar el estado completo
            else if (filtroCertLower === 'sin empezar') {
                cumpleFiltrocertificacion = valorCertLower === 'sin empezar certificación' || valorCertLower === 'sin empezar certificacion'
            }
            // Búsqueda normal (contiene el texto)
            else {
                cumpleFiltrocertificacion = valorCertLower.includes(filtroCertLower)
            }
        }
        
        return (
            (item.empresa_nombre || "").toLowerCase().includes(filtrosCert.nombreEmpresa.toLowerCase()) &&
            String(item.RNC || "").includes(filtrosCert.rnc) &&
            cumpleFiltrocertificacion &&
            (item.tecniconombre || "").toLowerCase().includes(filtrosCert.tecnico.toLowerCase())
        )
    })

    // Lógica de paginación para certificaciones
    const totalPaginasCert = Math.ceil(certificacionesFiltradas.length / registrosPorPaginaCert)
    const indiceInicioCert = (paginaActualCert - 1) * registrosPorPaginaCert
    const indiceFinCert = indiceInicioCert + registrosPorPaginaCert
    const certificacionesPaginadas = certificacionesFiltradas.slice(indiceInicioCert, indiceFinCert)

    // Función para cambiar página de certificaciones
    const cambiarPaginaCert = (nuevaPagina) => {
        setPaginaActualCert(nuevaPagina)
    }

    // Funciones de exportación para certificaciones
    const exportarCertificacionesHTML = () => {
        const fechaActual = new Date().toLocaleDateString('es-DO')
        const horaActual = new Date().toLocaleTimeString('es-DO')

        let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estado de Certificación de Empresas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f0fdf4; font-weight: bold; }
          tr:nth-child(even) { background-color: #f0fdf4; }
          .empresa-hija { background-color: #dbeafe; }
          .empresa-hija .empresa-nombre { padding-left: 20px; position: relative; }
          .empresa-hija .empresa-nombre:before { content: "↳ "; color: #3b82f6; font-weight: bold; }
          .certificado { color: #16a34a; font-weight: bold; }
          .no-certificado { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          .empresa-padre { font-size: 11px; color: #3b82f6; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Estado de Certificación de Empresas</h1>
          <div class="info">
            <p>Fecha de generación: ${fechaActual} - ${horaActual}</p>
            <p>Total de registros: ${certificacionesFiltradas.length}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Empresa</th>
              <th>RNC</th>
              <th>Certificación</th>
              <th>Técnico</th>
              <th>Vendedor</th>
              <th>Última Modificación</th>
            </tr>
          </thead>
          <tbody>
    `

        certificacionesFiltradas.forEach((item, index) => {
            const estadoCert = item.certificacionempresapadre || ''
            const esFinalizado = estadoCert.toLowerCase().includes('paso 15') || estadoCert.toLowerCase().includes('finalización')
            const claseEstado = esFinalizado ? 'certificado' : 'no-certificado'
            const claseFilaHija = item.esEmpresaHija ? 'empresa-hija' : ''

            html += `
        <tr class="${claseFilaHija}">
          <td>${index + 1}</td>
          <td class="empresa-nombre">
            ${item.empresa_nombre}
            ${item.esEmpresaHija && item.empresaPadre ? `<br><span class="empresa-padre">Subsidiaria de: ${item.empresaPadre}</span>` : ''}
          </td>
          <td>${item.RNC}</td>
          <td class="${claseEstado}">${item.certificacionempresapadre || 'No especificado'}</td>
          <td>${item.tecniconombre}</td>
          <td>${item.vendedornombre}</td>
          <td>${item.fecha_modificacion}</td>
        </tr>
      `
        })

        html += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generado por Sistema de Reportes FEDO-ClickUp</p>
          <p>Nota: Las empresas subsidiarias aparecen marcadas con ↳ y fondo azul claro</p>
        </div>
      </body>
      </html>
    `

        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `certificaciones_${new Date().toISOString().split('T')[0]}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const exportarCertificacionesXLSX = () => {
        const datosParaExcel = certificacionesFiltradas.map((item, index) => ({
            'Número': index + 1,
            'Empresa': item.esEmpresaHija ? `↳ ${item.empresa_nombre}` : item.empresa_nombre,
            'RNC': item.RNC,
            'Certificación': item.certificacionempresapadre || 'No especificado',
            'Técnico': item.tecniconombre,
            'Vendedor': item.vendedornombre,
            'Última Modificación': item.fecha_modificacion,
            'Tipo': item.esEmpresaHija ? 'Subsidiaria' : 'Principal',
            'Empresa Padre': item.esEmpresaHija ? item.empresaPadre || 'No especificado' : ''
        }))

        const ws = XLSX.utils.json_to_sheet(datosParaExcel)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Certificaciones')

        // Ajustar el ancho de las columnas
        const columnWidths = [
            { wch: 8 },  // Número
            { wch: 35 }, // Empresa
            { wch: 15 }, // RNC
            { wch: 20 }, // Certificación
            { wch: 20 }, // Técnico
            { wch: 20 }, // Vendedor
            { wch: 18 }, // Última Modificación
            { wch: 15 }, // Tipo
            { wch: 25 }  // Empresa Padre
        ]
        ws['!cols'] = columnWidths

        XLSX.writeFile(wb, `certificaciones_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    return (
        <Card>
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Estado de Certificación de Empresas</h2>
                            <p className="text-gray-600">Control y seguimiento del estado de certificaciones</p>
                        </div>
                    </div>

                    {/* Botones de descarga para certificaciones */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportarCertificacionesHTML}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Descargar como HTML"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>HTML</span>
                        </button>
                        <button
                            onClick={exportarCertificacionesXLSX}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Descargar como Excel"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>XLSX</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-700 font-medium">Cargando datos de certificación...</p>
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
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar certificaciones</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={onReload}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        🔄 Reintentar
                    </button>
                </div>
            ) : (
                <>
                    {/* Banner de advertencia cuando se usan datos de ejemplo */}
                    {usandoDatosFallback && (
                        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-yellow-800 mb-1">
                                        ⚠️ Mostrando datos de ejemplo
                                    </h3>
                                    <p className="text-sm text-yellow-700">
                                        No se pudo conectar con el servidor. Los datos mostrados son ejemplos para demostración.
                                    </p>
                                </div>
                                <button
                                    onClick={onReload}
                                    className="flex-shrink-0 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors font-medium"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filtros para Certificación */}
                    <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-200 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Filtros de Certificación</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    🏢 Empresa
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filtrosCert.nombreEmpresa}
                                        onChange={(e) => handleFiltroCertChange('nombreEmpresa', e.target.value)}
                                        placeholder="Buscar por empresa..."
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    📄 RNC
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filtrosCert.rnc}
                                        onChange={(e) => handleFiltroCertChange('rnc', e.target.value)}
                                        placeholder="Buscar por RNC..."
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    ✅ Certificación
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filtrosCert.certificacion}
                                        onChange={(e) => handleFiltroCertChange('certificacion', e.target.value)}
                                        placeholder="Estado de certificación..."
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    👨‍💻 Técnico
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filtrosCert.tecnico}
                                        onChange={(e) => handleFiltroCertChange('tecnico', e.target.value)}
                                        placeholder="Buscar por técnico..."
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                Mostrando <span className="font-bold text-green-700">{certificacionesFiltradas.length}</span> de <span className="font-bold">{datosValidos.length}</span> empresas
                            </p>
                            {(filtrosCert.nombreEmpresa || filtrosCert.rnc || filtrosCert.certificacion || filtrosCert.tecnico) && (
                                <button
                                    onClick={limpiarFiltrosCert}
                                    className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors font-medium"
                                >
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabla de Certificación Mejorada */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                #️⃣ <span>Núm.</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                🏢 <span>Empresa</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                📄 <span>RNC</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                ✅ <span>Certificación</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                👨‍💻 <span>Técnico</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                💼 <span>Vendedor</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                📅 <span>Últ. Modificación</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {certificacionesPaginadas.map((item, index) => (
                                        <tr key={index} className={`hover:bg-gradient-to-r hover:from-green-25 hover:to-emerald-25 transition-all duration-200 group ${item.esEmpresaHija ? 'bg-blue-50/30' : ''
                                            }`}>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${item.esEmpresaHija
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                        : 'bg-gradient-to-r from-green-500 to-green-600'
                                                        }`}>
                                                        {indiceInicioCert + index + 1}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${item.esEmpresaHija
                                                        ? 'bg-gradient-to-r from-blue-100 to-blue-200'
                                                        : 'bg-gradient-to-r from-green-100 to-green-200'
                                                        }`}>
                                                        <svg className={`w-5 h-5 ${item.esEmpresaHija ? 'text-blue-600' : 'text-green-600'
                                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-bold transition-colors ${item.esEmpresaHija
                                                            ? 'text-blue-900 group-hover:text-blue-700'
                                                            : 'text-gray-900 group-hover:text-green-700'
                                                            }`}>
                                                            {item.esEmpresaHija && (
                                                                <span className="inline-flex items-center gap-1 mr-2">
                                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                                    </svg>
                                                                </span>
                                                            )}
                                                            {item.empresa_nombre}
                                                        </div>
                                                        {item.esEmpresaHija && item.empresaPadre && (
                                                            <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                                Subsidiaria de: {item.empresaPadre}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg border">
                                                    {item.RNC}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border-2 ${
                                                    (item.certificacionempresapadre?.toLowerCase().includes('paso 15') || item.certificacionempresapadre?.toLowerCase().includes('finalización')) ? 'bg-green-50 text-green-700 border-green-200' :
                                                    item.certificacionempresapadre?.toLowerCase().includes('sin empezar') ? 'bg-red-50 text-red-700 border-red-200' :
                                                    !item.certificacionempresapadre || item.certificacionempresapadre.trim() === '' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        (item.certificacionempresapadre?.toLowerCase().includes('paso 15') || item.certificacionempresapadre?.toLowerCase().includes('finalización')) ? 'bg-green-500' :
                                                        item.certificacionempresapadre?.toLowerCase().includes('sin empezar') ? 'bg-red-500' :
                                                        !item.certificacionempresapadre || item.certificacionempresapadre.trim() === '' ? 'bg-gray-500' :
                                                        'bg-yellow-500'
                                                    }`}></div>
                                                    {item.certificacionempresapadre || '(En blanco)'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        T
                                                    </div>
                                                    {item.tecniconombre}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-800 rounded-full text-xs font-semibold border border-purple-200">
                                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        V
                                                    </div>
                                                    {item.vendedornombre}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                    {item.fecha_modificacion}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación de Certificaciones */}
                    {certificacionesFiltradas.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mt-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                                {/* Información de resultados */}
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-700">
                                        <span className="font-medium">Mostrando</span>
                                        <span className="mx-1 px-2 py-1 bg-green-100 text-green-800 rounded-lg font-bold">
                                            {indiceInicioCert + 1}
                                        </span>
                                        <span className="mx-1">a</span>
                                        <span className="mx-1 px-2 py-1 bg-green-100 text-green-800 rounded-lg font-bold">
                                            {Math.min(indiceFinCert, certificacionesFiltradas.length)}
                                        </span>
                                        <span className="mx-1">de</span>
                                        <span className="mx-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold">
                                            {certificacionesFiltradas.length}
                                        </span>
                                        <span>resultados</span>
                                    </div>
                                </div>

                                {/* Controles de navegación */}
                                <div className="flex items-center gap-2">

                                    {/* Botón anterior */}
                                    <button
                                        onClick={() => cambiarPaginaCert(paginaActualCert - 1)}
                                        disabled={paginaActualCert === 1}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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

                                                for (let i = 1; i <= totalPaginasCert; i++) {
                                                    if (i === 1 || i === totalPaginasCert || (i >= paginaActualCert - delta && i <= paginaActualCert + delta)) {
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

                                                const esActual = paginaActualCert === numero

                                                return (
                                                    <button
                                                        key={numero}
                                                        onClick={() => cambiarPaginaCert(numero)}
                                                        className={`w-10 h-10 text-sm font-bold rounded-xl transition-all duration-200 ${esActual
                                                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-110'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
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
                                        onClick={() => cambiarPaginaCert(paginaActualCert + 1)}
                                        disabled={paginaActualCert === totalPaginasCert}
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
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Página actual: {paginaActualCert}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>Total páginas: {totalPaginasCert}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span>Registros por página: {registrosPorPaginaCert}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje cuando no hay resultados */}
                    {certificacionesFiltradas.length === 0 && datosValidos.length > 0 && (
                        <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-12 text-center border border-gray-200 mt-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron certificaciones</h3>
                            <p className="text-gray-500 mb-4">
                                No hay empresas que coincidan con los filtros aplicados.
                            </p>
                            <button
                                onClick={limpiarFiltrosCert}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                    
                    {/* Mensaje cuando no hay datos en absoluto */}
                    {certificacionesFiltradas.length === 0 && datosValidos.length === 0 && !loading && !error && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center border border-blue-200 mt-8">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">No hay datos de certificación disponibles</h3>
                            <p className="text-blue-600 mb-4">
                                Aún no se han registrado certificaciones en el sistema.
                            </p>
                            <button
                                onClick={onReload}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Recargar datos
                            </button>
                        </div>
                    )}
                </>
            )}
        </Card>
    )
}
