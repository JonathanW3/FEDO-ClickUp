import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Card from '../components/Card.jsx'
import { Chart } from 'chart.js'
import { requireAuth, getCurrentUser } from '../utils/authUtils'

export default function Tablas(){
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const barRef = useRef(null)
  const hbarRef = useRef(null)
  const lineRef = useRef(null)
  const areaRef = useRef(null)
  const doughnut1Ref = useRef(null)
  const doughnut2Ref = useRef(null)
  const sparkRef = useRef(null)
  const comboRef = useRef(null)

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

  useEffect(()=>{
    const bar = new Chart(barRef.current, { type:'bar', data:{ labels:['A','B','C','D'], datasets:[{ data:[12,19,3,5], borderRadius:10 }] } })
    const hbar = new Chart(hbarRef.current, { type:'bar', data:{ labels:['X','Y','Z'], datasets:[{ data:[5,9,7], borderRadius:10 }] }, options:{ indexAxis:'y' } })
    const line = new Chart(lineRef.current, { type:'line', data:{ labels:['E','F','G','H','I'], datasets:[{ data:[3,7,4,9,6], tension:.4, fill:false }] } })
    const area = new Chart(areaRef.current, { type:'line', data:{ labels:['1','2','3','4','5'], datasets:[{ data:[2,4,6,4,7], tension:.4, fill:true }] } })
    const doughnut1 = new Chart(doughnut1Ref.current, { type:'doughnut', data:{ labels:['Uno','Dos','Tres'], datasets:[{ data:[10,20,30] }] } })
    const doughnut2 = new Chart(doughnut2Ref.current, { type:'doughnut', data:{ labels:['A','B','C','D'], datasets:[{ data:[25,15,35,25] }] } })
    const spark = new Chart(sparkRef.current, { type:'line', data:{ labels:Array.from({length:20}, (_,i)=>i+1), datasets:[{ data:Array.from({length:20},()=>Math.floor(Math.random()*10)+1), tension:.3 }] }, options:{ plugins:{legend:{display:false}}, scales:{x:{display:false}, y:{display:false}} } })
    const combo = new Chart(comboRef.current, { data:{ labels:['Q1','Q2','Q3','Q4'], datasets:[{ type:'bar', data:[5,7,6,9], borderRadius:8 }, { type:'line', data:[6,8,7,10], tension:.4 }] } })
    return ()=>{ [bar,hbar,line,area,doughnut1,doughnut2,spark,combo].forEach(c=>c.destroy()) }
  }, [])

  return (
    <AppLayout currentUser={currentUser}>
      <div className="h-full p-6">
        <h2 className="text-xl font-bold mb-6">TABLAS DE DATOS</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 h-full">
          <Card title="Título 1"><canvas ref={barRef}></canvas></Card>
          <Card title="Título 2"><canvas ref={hbarRef}></canvas></Card>
          <Card title="Título 3"><canvas ref={lineRef}></canvas></Card>
          <Card title="Título 4"><canvas ref={areaRef}></canvas></Card>
          <Card title="Título 5"><canvas ref={doughnut1Ref}></canvas></Card>
          <Card title="Título 7"><canvas ref={doughnut2Ref}></canvas></Card>
          <Card title="Título 9"><canvas ref={sparkRef}></canvas></Card>
          <Card title="Título 10"><canvas ref={comboRef}></canvas></Card>
        </div>
      </div>
    </AppLayout>
  )
}
