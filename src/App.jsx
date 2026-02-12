import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Alertas from './pages/Alertas.jsx'
import Reportes from './pages/Reportes.jsx'
import Tablas from './pages/Tablas.jsx'
import Personal from './pages/Personal.jsx'

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/tablas" element={<Tablas />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}
