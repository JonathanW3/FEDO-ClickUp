import React from 'react'

export default function ModalDetalles({ isOpen, onClose, item }) {
    if (!isOpen || !item) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
                {/* Header del Modal mejorado */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            Detalles de Implementación
                        </h2>
                        <p className="text-blue-100 text-lg">{item.empresa_nombre}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-blue-200 text-3xl font-light transition-colors duration-200 hover:bg-white hover:bg-opacity-10 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                        ×
                    </button>
                </div>

                {/* Contenido con scroll mejorado */}
                <div className="overflow-y-auto max-h-[calc(95vh-120px)] bg-gray-50">
                    <div className="px-8 py-6">

                        {/* Estado y badges principales */}
                        <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-600">ID:</span>
                                    <span className="text-lg font-bold text-gray-900">#{item.implementacionID}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-600">Estado:</span>
                                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${item.estado === 'completado' ? 'bg-green-100 text-green-800 border border-green-200' :
                                        item.estado === 'en progreso' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                            item.estado === 'iniciado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                item.estado === 'no iniciado' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                    'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                        {item.estado || 'No especificado'}
                                    </span>
                                </div>
                                {item.id_tarea_clickup && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-600">ClickUp:</span>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                            {item.id_tarea_clickup}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grid de información principal */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                            {/* Información de la Empresa */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Empresa</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</label>
                                        <p className="text-gray-900 font-semibold text-lg">{item.empresa_nombre}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">RNC</label>
                                        <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg">{item.RNC}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dirección</label>
                                        <p className="text-gray-700 leading-relaxed">{item.direccion}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</label>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {item.activo ? '🟢 Activo' : '🔴 Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Información de Contacto */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Contacto</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</label>
                                        <p className="text-gray-900 font-semibold">{item.contacto}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                        <a href={`mailto:${item.contacto_email}`} className="text-blue-600 hover:text-blue-800 font-medium break-all">
                                            {item.contacto_email}
                                        </a>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Celular</label>
                                        <a href={`tel:${item.contacto_celular}`} className="text-blue-600 hover:text-blue-800 font-mono">
                                            {item.contacto_celular}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Información del Sistema */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Sistema</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</label>
                                        <p className="text-gray-900 font-semibold">{item.nombre}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Versión</label>
                                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                            {item.version}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Formato Factura</label>
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                            {item.formato_factura}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Método Integración</label>
                                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium">
                                            {item.metodo_integracion}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Asignado */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Personal Asignado</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Técnico */}
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            T
                                        </span>
                                        <h4 className="font-semibold text-blue-900">Técnico</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-blue-800 font-medium">{item.tecniconombre}</p>
                                        <p className="text-blue-600 text-sm break-all">{item.email}</p>
                                        <p className="text-blue-600 text-sm">{item.celular}</p>
                                    </div>
                                </div>

                                {/* Vendedor */}
                                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            V
                                        </span>
                                        <h4 className="font-semibold text-green-900">Vendedor</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-green-800 font-medium">{item.vendedornombre}</p>
                                        <p className="text-green-600 text-sm break-all">{item.vendedoremail}</p>
                                        <p className="text-green-600 text-sm">{item.vendedorcelular}</p>
                                    </div>
                                </div>

                                {/* Distribuidor */}
                                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            D
                                        </span>
                                        <h4 className="font-semibold text-purple-900">Distribuidor</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-purple-800 font-medium">{item.destribuidornombre}</p>
                                        <p className="text-purple-600 text-sm break-all">{item.destribuidoremail}</p>
                                        <p className="text-purple-600 text-sm">{item.destribuidorcelular}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información Financiera y Fechas */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                            {/* Información Financiera */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Información Financiera</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                        <label className="text-xs font-semibold text-green-600 uppercase tracking-wider">Monto Implementación</label>
                                        <p className="text-2xl font-bold text-green-800">
                                            ${item.monto_implementacion?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Abono Realizado</label>
                                        <p className="text-xl font-bold text-blue-800">
                                            ${item.abono?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Fechas Importantes */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Cronología</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contratación</label>
                                            <p className="text-gray-900 font-medium">
                                                {item.fecha_contratacion ? new Date(item.fecha_contratacion).toLocaleDateString('es-DO') : 'No especificada'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inicio</label>
                                            <p className="text-gray-900 font-medium">
                                                {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es-DO') : 'No especificada'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Creación</label>
                                            <p className="text-gray-900 font-medium">
                                                {item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString('es-DO') : 'No especificada'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modificación</label>
                                            <p className="text-gray-900 font-medium">
                                                {item.fecha_modificacion ? new Date(item.fecha_modificacion).toLocaleDateString('es-DO') : 'No especificada'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Empresas Hijas */}
                        {item.empresas_hijas && item.empresas_hijas.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Empresas Subsidiarias</h3>
                                        <p className="text-sm text-gray-600">
                                            {item.empresas_hijas.length} empresa{item.empresas_hijas.length > 1 ? 's' : ''} asociada{item.empresas_hijas.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {item.empresas_hijas.map((empresa, index) => (
                                        <div key={empresa.empresaID_hija || index} className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100 hover:shadow-md transition-all duration-200">
                                            {/* Header de la empresa hija */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 leading-tight">
                                                            {empresa.empresa_nombre_hija || 'Sin nombre'}
                                                        </h4>
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                                                            (empresa.estado_hija || '').toLowerCase() === 'completado' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                            (empresa.estado_hija || '').toLowerCase() === 'en progreso' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                            (empresa.estado_hija || '').toLowerCase() === 'iniciado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                            (empresa.estado_hija || '').toLowerCase() === 'on hold' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                                            (empresa.estado_hija || '').toLowerCase() === 'no iniciado' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                            'bg-gray-100 text-gray-800 border border-gray-200'
                                                        }`}>
                                                            {empresa.estado_hija || 'No especificado'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-3 h-3 rounded-full ${empresa.activo_hija ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {empresa.activo_hija ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Información de la empresa hija */}
                                            <div className="space-y-4">
                                                {/* RNC */}
                                                {empresa.RNC_hija && (
                                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">RNC</label>
                                                        <p className="text-gray-900 font-mono text-sm font-medium">{empresa.RNC_hija}</p>
                                                    </div>
                                                )}

                                                {/* Contacto */}
                                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Información de Contacto</label>
                                                    <div className="space-y-2">
                                                        {empresa.contacto_nombre_hija && (
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                                </svg>
                                                                <span className="text-sm font-medium text-gray-900">{empresa.contacto_nombre_hija}</span>
                                                            </div>
                                                        )}
                                                        {empresa.contacto_email_hija && (
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                                                </svg>
                                                                <a href={`mailto:${empresa.contacto_email_hija}`} className="text-sm text-blue-600 hover:text-blue-800 break-all">
                                                                    {empresa.contacto_email_hija}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Detalles Adicionales Mejorados */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Detalles Adicionales</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-2 block">📋 Resumen del Proyecto</label>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <p className="text-gray-900 leading-relaxed">
                                            {item.resumen || 'No especificado'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-2 block">📝 Formulario de Recopilación</label>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <p className="text-gray-900 leading-relaxed">
                                            {item.formulario_recopilacion || 'No especificado'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-2 block">✅ Requisitos</label>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        {(() => {
                                            try {
                                                const requisitosArray = item.requisitos
                                                    ? item.requisitos.replace(/[{}]/g, '').split(',').map(item => item.trim().replace(/"/g, ''))
                                                    : [];

                                                return requisitosArray.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {requisitosArray.map((req, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200"
                                                            >
                                                                {req}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 italic">No especificado</span>
                                                );
                                            } catch (error) {
                                                return <span className="text-gray-900">{item.requisitos || 'No especificado'}</span>;
                                            }
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-2 block">✔️ Confirmaciones</label>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        {(() => {
                                            try {
                                                const confirmacionesArray = item.confirmaciones
                                                    ? item.confirmaciones.replace(/[{}]/g, '').split(',').map(item => item.trim().replace(/"/g, ''))
                                                    : [];

                                                return confirmacionesArray.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {confirmacionesArray.map((conf, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200"
                                                            >
                                                                {conf}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 italic">No especificado</span>
                                                );
                                            } catch (error) {
                                                return <span className="text-gray-900">{item.confirmaciones || 'No especificado'}</span>;
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer mejorado */}
                <div className="bg-gray-100 px-8 py-4 flex justify-end border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
