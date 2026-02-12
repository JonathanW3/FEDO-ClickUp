import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { requireAuth, getCurrentUser } from '../utils/authUtils'

export default function Alertas(){
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [count, setCount] = useState(3)

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
  const [items, setItems] = useState([
    {id: 1, name:'Sistema de Facturación Detenido', notifyTo:'admin@empresa.com', enabled: true, priority: 'Alta'},
    {id: 2, name:'Certificado Próximo a Vencer', notifyTo:'tecnico@empresa.com, admin@empresa.com', enabled: true, priority: 'Media'},
    {id: 3, name:'Backup de Base de Datos', notifyTo:'dba@empresa.com', enabled: false, priority: 'Baja'}
  ])
  const [log, setLog] = useState([
    '30/10/2025, 14:35:20: Alerta "Sistema de Facturación Detenido" activada',
    '30/10/2025, 12:15:10: Configuración guardada (3 alertas)',
    '30/10/2025, 09:45:30: Alerta "Certificado Próximo a Vencer" desactivada'
  ])

  const [destinatariosPredefinidos] = useState([
    'admin@empresa.com',
    'tecnico@empresa.com',
    'dba@empresa.com',
    'soporte@empresa.com',
    'gerencia@empresa.com'
  ])

  function updateCount(n){
    const newCount = parseInt(n,10)
    setCount(newCount)
    setItems(prev => {
      const copy = [...prev]
      if (newCount > copy.length) {
        let nextId = Math.max(...copy.map(item => item.id), 0) + 1
        while (copy.length < newCount) {
          copy.push({
            id: nextId++,
            name: `Alerta ${copy.length+1}`, 
            notifyTo: '', 
            enabled: false, 
            priority: 'Media'
          })
        }
      } else {
        copy.length = newCount
      }
      return copy
    })
  }

  function updateItem(index, field, value) {
    setItems(prev => prev.map((item, i) => 
      i === index ? {...item, [field]: value} : item
    ))
  }

  function toggleEnabled(index) {
    const item = items[index]
    const newEnabled = !item.enabled
    updateItem(index, 'enabled', newEnabled)
    
    const action = newEnabled ? 'activada' : 'desactivada'
    setLog(l => [`${new Date().toLocaleString()}: Alerta "${item.name}" ${action}`, ...l])
  }

  function saveConfig(){
    const activeAlerts = items.filter(item => item.enabled).length
    setLog(l => [`${new Date().toLocaleString()}: Configuración guardada (${activeAlerts} alertas activas de ${count} configuradas)`, ...l])
  }

  function addRecipient(index, email) {
    const currentEmails = items[index].notifyTo.split(',').map(e => e.trim()).filter(e => e)
    if (!currentEmails.includes(email)) {
      const newEmails = [...currentEmails, email].join(', ')
      updateItem(index, 'notifyTo', newEmails)
    }
  }

  return (
    <AppLayout currentUser={currentUser}>
      <div className="h-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-gray-800 p-6">
        {/* CONTENIDO PRINCIPAL */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* Panel de configuración de alertas */}
          <section className="bg-blue-50/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition-all">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M19.07 4.93A10 10 0 1112 2v0a10 10 0 017.07 2.93z" />
              </svg>
              Alertas configurables
            </h2>
            <p className="text-sm text-blue-600 mb-4">Selecciona cuántas alertas mostrar y define a quién notificar.</p>

            <label className="block mb-4">
              <span className="text-sm font-medium">Número de alertas visibles</span>
              <select 
                value={count} 
                onChange={e=>updateCount(e.target.value)} 
                className="mt-1 block w-full rounded-lg border-blue-300 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>

            <div className="space-y-6">
              {items.map((item, idx)=>(
                <div key={item.id} className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
                  {/* Header de la alerta con toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={item.enabled}
                          onChange={() => toggleEnabled(idx)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className={`font-medium ${item.enabled ? 'text-green-700' : 'text-gray-500'}`}>
                        {item.enabled ? '🟢 Activa' : '🔴 Inactiva'}
                      </span>
                    </div>
                    
                    <select 
                      value={item.priority} 
                      onChange={e => updateItem(idx, 'priority', e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Alta">🔴 Alta</option>
                      <option value="Media">🟡 Media</option>
                      <option value="Baja">🟢 Baja</option>
                    </select>
                  </div>

                  {/* Nombre de la alerta */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Alerta</label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
                      value={item.name} 
                      onChange={e => updateItem(idx, 'name', e.target.value)}
                      placeholder={`Nombre de la alerta ${idx+1}`} 
                    />
                  </div>

                  {/* Destinatarios */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destinatarios</label>
                    <div className="space-y-2">
                      <textarea 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none" 
                        value={item.notifyTo} 
                        onChange={e => updateItem(idx, 'notifyTo', e.target.value)}
                        placeholder="Emails separados por comas: admin@empresa.com, tecnico@empresa.com"
                      />
                      
                      {/* Destinatarios predefinidos */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-600 self-center">Agregar rápido:</span>
                        {destinatariosPredefinidos.map(email => (
                          <button
                            key={email}
                            onClick={() => addRecipient(idx, email)}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                            type="button"
                          >
                            + {email}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Estado visual */}
                  <div className={`text-xs p-2 rounded ${
                    item.enabled 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {item.enabled 
                      ? `✅ Esta alerta está activa y notificará a ${item.notifyTo.split(',').filter(e => e.trim()).length} destinatario(s)`
                      : '⏸️ Esta alerta está pausada y no enviará notificaciones'
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3 flex-wrap">
              <button 
                onClick={saveConfig} 
                className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Configuración
              </button>
              
              <button 
                onClick={()=>alert('Función de plantillas de correo en desarrollo')} 
                className="px-4 py-2 bg-white border border-blue-400 text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver Plantillas
              </button>

              <button 
                onClick={() => {
                  setItems(prev => prev.map(item => ({...item, enabled: true})))
                  setLog(l => [`${new Date().toLocaleString()}: Todas las alertas activadas`, ...l])
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activar Todas
              </button>

              <button 
                onClick={() => {
                  setItems(prev => prev.map(item => ({...item, enabled: false})))
                  setLog(l => [`${new Date().toLocaleString()}: Todas las alertas desactivadas`, ...l])
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Desactivar Todas
              </button>
            </div>

            {/* Resumen de alertas */}
            <div className="mt-6 bg-blue-100 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">📊 Resumen de Configuración</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-700">{count}</div>
                  <div className="text-blue-600">Total Alertas</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-700">{items.filter(i => i.enabled).length}</div>
                  <div className="text-green-600">Activas</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-red-700">{items.filter(i => i.priority === 'Alta' && i.enabled).length}</div>
                  <div className="text-red-600">Alta Prioridad</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-purple-700">{new Set(items.flatMap(i => i.notifyTo.split(',').map(e => e.trim())).filter(e => e)).size}</div>
                  <div className="text-purple-600">Destinatarios Únicos</div>
                </div>
              </div>
            </div>
          </section>

          {/* Panel de logs */}
          <section className="bg-blue-50/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition-all">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V7a4 4 0 118 0v4m-9 4h10M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Actividad reciente
            </h2>
            <div className="h-80 overflow-auto bg-white border border-blue-200 p-3 rounded text-sm text-blue-800">
              {log.length === 0 ? (
                <div className="text-slate-500">Sin actividad.</div>
              ) : (
                log.map((l,i)=> <div key={i} className="py-1">{l}</div>)
              )}
            </div>
          </section>
        </main>

        <footer className="mt-10 text-center text-xs text-blue-700">
          <p>© 2025 Sistema de Alertas</p>
        </footer>
      </div>
    </AppLayout>
  )
}
