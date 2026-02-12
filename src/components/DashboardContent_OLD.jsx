import React, { useEffect, useRef, useState } from 'react'
import { obtenerImplementaciones } from '../utils/apiUtils.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  BarController,
  LineController,
  PieController
} from 'chart.js'

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  BarController,
  LineController,
  PieController
)

export default function DashboardContent({ currentUser }) {
  const [datosImplementaciones, setDatosImplementaciones] = useState([])
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [error, setError] = useState(null)
  const pieRef = useRef(null)
  const vendRef = useRef(null)
  const tecRef = useRef(null)
  const lineRef = useRef(null)

  // Función para cargar datos de implementaciones
  const cargarDatosImplementaciones = async () => {
    try {
      setCargandoDatos(true)
      setError(null)
      
      console.log('🔄 Cargando datos para Dashboard...')
      
      const data = await obtenerImplementaciones()
      console.log('📊 Datos del Dashboard recibidos:', data)
      
      setDatosImplementaciones(data)
      console.log(`✅ Dashboard cargado: ${data.length} implementaciones`)
      
    } catch (err) {
      console.error('❌ Error al cargar datos del Dashboard:', err)
      setError(`Error al cargar datos: ${err.message}`)
    } finally {
      setCargandoDatos(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosImplementaciones()
  }, [])

  useEffect(() => {
    // Solo crear gráficos cuando los datos estén cargados
    if (cargandoDatos || error || datosImplementaciones.length === 0) {
      return
    }

    // Configuración de colores moderna
    const colors = {
      primary: '#3B82F6',
      secondary: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      purple: '#8B5CF6',
      pink: '#EC4899',
      cyan: '#06B6D4'
    }

    // Calcular estadísticas reales de los datos
    const estadisticas = {
      total: datosImplementaciones.length,
      porTecnico: {},
      porVendedor: {},
      porCertificacion: {
        'Certificado': 0,
        'En Proceso': 0,
        'Pendiente': 0
      }
    }

    // Procesar datos para estadísticas
    datosImplementaciones.forEach(item => {
      // Por técnico
      const tecnico = item.tecniconombre || 'Sin asignar'
      estadisticas.porTecnico[tecnico] = (estadisticas.porTecnico[tecnico] || 0) + 1

      // Por vendedor
      const vendedor = item.vendedornombre || 'Sin asignar'
      estadisticas.porVendedor[vendedor] = (estadisticas.porVendedor[vendedor] || 0) + 1

      // Por certificación
      const cert = item.certificacion || 'Pendiente'
      if (cert.toLowerCase().includes('certificado') || cert === 'SI') {
        estadisticas.porCertificacion['Certificado']++
      } else if (cert.toLowerCase().includes('proceso') || cert === 'EN PROCESO') {
        estadisticas.porCertificacion['En Proceso']++
      } else {
        estadisticas.porCertificacion['Pendiente']++
      }
    })

    // Gráfico de Pie - Certificaciones
    const pie = new ChartJS(pieRef.current, {
      type: 'doughnut',
      data: { 
        labels: Object.keys(estadisticas.porCertificacion), 
        datasets: [{
          data: Object.values(estadisticas.porCertificacion),
          backgroundColor: [colors.secondary, colors.warning, colors.danger],
          borderWidth: 0,
          hoverOffset: 10
        }] 
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: { 
          legend: { 
            position: 'bottom',
            labels: {
              padding: 20,
              font: { size: 12, weight: '500' },
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8
          }
        }
      }
    })
    
    // Gráfico de Vendedores - con datos reales
    const topVendedores = Object.entries(estadisticas.porVendedor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    const vend = new ChartJS(vendRef.current, { 
      type: 'bar', 
      data: { 
        labels: topVendedores.map(([nombre]) => nombre), 
        datasets: [{
          label: 'Implementaciones Asignadas',
          data: topVendedores.map(([, cantidad]) => cantidad), 
          backgroundColor: [
            colors.primary + '33',
            colors.secondary + '33', 
            colors.warning + '33',
            colors.purple + '33',
            colors.pink + '33'
          ],
          borderColor: [
            colors.primary,
            colors.secondary, 
            colors.warning,
            colors.purple,
            colors.pink
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }] 
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          }
        }
      }
    })
    
    // Gráfico de Técnicos - con datos reales
    const topTecnicos = Object.entries(estadisticas.porTecnico)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    const tec = new ChartJS(tecRef.current, { 
      type: 'bar', 
      data: { 
        labels: topTecnicos.map(([nombre]) => nombre), 
        datasets: [{
          label: 'Implementaciones Asignadas',
          data: topTecnicos.map(([, cantidad]) => cantidad), 
          backgroundColor: [
            colors.cyan + '33',
            colors.primary + '33',
            colors.secondary + '33',
            colors.purple + '33',
            colors.warning + '33'
          ],
          borderColor: [
            colors.cyan,
            colors.primary,
            colors.secondary,
            colors.purple,
            colors.warning
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }] 
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          }
        }
      }
    })
    
    // Gráfico de línea mejorado
    const line = new ChartJS(lineRef.current, { 
      type: 'line', 
      data: { 
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], 
        datasets: [{
          label: 'Empresas Incorporadas', 
          data: [2, 4, 7, 10, 13, 15, 19, 22, 25, 28, 31, 35], 
          fill: true,
          backgroundColor: colors.primary + '20',
          borderColor: colors.primary,
          borderWidth: 3,
          pointBackgroundColor: colors.primary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4
        }] 
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, weight: '500' },
              color: '#374151',
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          }
        }
      }
    })
    
    return () => {
      pie.destroy(); 
      vend.destroy(); 
      tec.destroy(); 
      line.destroy(); 
    }
  }, [datosImplementaciones, cargandoDatos, error])  return (
    <div className="space-y-6">
      {/* Loading State */}
      {cargandoDatos && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-red-800 font-medium">Error al cargar datos</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={cargarDatosImplementaciones}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Stats Cards - Solo mostrar cuando hay datos */}
      {!cargandoDatos && !error && datosImplementaciones.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Implementaciones</p>
                  <p className="text-3xl font-bold">{datosImplementaciones.length}</p>
                  <p className="text-blue-100 text-sm">Registros en el sistema</p>
                </div>
                <div className="w-12 h-12 bg-blue-400/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Certificadas</p>
                  <p className="text-3xl font-bold">
                    {datosImplementaciones.filter(item => 
                      (item.certificacion || '').toLowerCase().includes('certificado') || 
                      item.certificacion === 'SI'
                    ).length}
                  </p>
                  <p className="text-green-100 text-sm">Empresas certificadas</p>
                </div>
                <div className="w-12 h-12 bg-green-400/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">En Proceso</p>
                  <p className="text-3xl font-bold">
                    {datosImplementaciones.filter(item => 
                      (item.certificacion || '').toLowerCase().includes('proceso') || 
                      item.certificacion === 'EN PROCESO'
                    ).length}
                  </p>
                  <p className="text-yellow-100 text-sm">En certificación</p>
                </div>
                <div className="w-12 h-12 bg-yellow-400/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Técnicos Activos</p>
                  <p className="text-3xl font-bold">
                    {new Set(datosImplementaciones.map(item => item.tecniconombre).filter(Boolean)).size}
                  </p>
                  <p className="text-purple-100 text-sm">Técnicos asignados</p>
                </div>
                <div className="w-12 h-12 bg-purple-400/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Charts Grid - Solo mostrar cuando hay datos */}
      {!cargandoDatos && !error && datosImplementaciones.length > 0 && (
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Empresas</p>
              <p className="text-3xl font-bold">35</p>
              <p className="text-purple-100 text-sm">+3 este mes</p>
            </div>
            <div className="w-12 h-12 bg-purple-400/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Tareas */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Estado de Tareas</h3>
              <p className="text-sm text-gray-600">Distribución actual</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
            </div>
          </div>
          <div className="h-64">
            <canvas ref={pieRef}></canvas>
          </div>
        </div>

        {/* Empresas por Mes */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Empresas Incorporadas</h3>
              <p className="text-sm text-gray-600">Crecimiento mensual</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
          <div className="h-64">
            <canvas ref={lineRef}></canvas>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento Vendedores */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Rendimiento Vendedores</h3>
              <p className="text-sm text-gray-600">Ventas completadas</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
          </div>
          <div className="h-64">
            <canvas ref={vendRef}></canvas>
          </div>
        </div>

        {/* Rendimiento Técnicos */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Rendimiento Técnicos</h3>
              <p className="text-sm text-gray-600">Tickets resueltos</p>
            </div>
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
          </div>
          <div className="h-64">
            <canvas ref={tecRef}></canvas>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}