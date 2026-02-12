import React, { useState, useEffect } from 'react'
import AppLayout from '../components/AppLayout'
import TablaImplementaciones from '../components/TablaImplementaciones'
import TablaCertificaciones from '../components/TablaCertificaciones'
import ModalDetalles from '../components/ModalDetalles'
import { obtenerImplementaciones, obtenerCertificacion } from '../utils/apiUtils'

export default function Reportes() {
  // Estado para Implementaciones
  const [datosImplementaciones, setDatosImplementaciones] = useState([])
  const [cargandoImplementaciones, setCargandoImplementaciones] = useState(true)
  const [errorImplementaciones, setErrorImplementaciones] = useState(null)

  // Estado para Certificaciones
  const [datosCert, setDatosCert] = useState([])
  const [cargandoCert, setCargandoCert] = useState(true)
  const [errorCert, setErrorCert] = useState(null)
  const [usandoDatosFallbackCert, setUsandoDatosFallbackCert] = useState(false)

  // Estado para Modal de Detalles
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false)
  const [itemDetalles, setItemDetalles] = useState(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarImplementaciones()
    cargarCertificacion()
  }, [])

  const cargarImplementaciones = async () => {
    try {
      setCargandoImplementaciones(true)
      setErrorImplementaciones(null)

      console.log('🔄 Cargando implementaciones desde la API...')

      const data = await obtenerImplementaciones()
      console.log('📊 Datos recibidos de la API:', data)

      // Transformar datos si es necesario para asegurar compatibilidad
      const implementacionesTransformadas = data.map((item, index) => ({
        ...item,
        // Mapeo de campos de la API a los nombres esperados por los componentes
        empresa_nombre: item.nombreempresapadre || item.empresa_nombre || "Empresa no especificada",
        RNC: item.rncempresapadre || item.RNC || "",
        direccion: item.direccionempresapadre || item.direccion || "Dirección no especificada",
        contacto: item.contactoempresapadre || item.contacto || "No especificado",
        contacto_email: item.emailempresapadre || item.contacto_email || "No especificado",
        contacto_celular: item.celularempresapadre || item.contacto_celular || "",

        // Personal
        tecniconombre: item.nombretecnico || item.tecniconombre || "No asignado",
        email: item.emailtecnico || item.email || "", // Email del técnico
        vendedornombre: item.nombrevendedor || item.vendedornombre || "No asignado",
        vendedoremail: item.emailvendedor || item.vendedoremail || "",
        destribuidornombre: item.nombredistribuidor || item.destribuidornombre || "No asignado",
        destribuidoremail: item.emaildistribuidor || item.destribuidoremail || "",

        // Estado y Sistema
        estado: item.estadoempresapadre || item.estado || "No especificado",
        nombre: item.nombresistema || item.nombre || "", // Nombre del sistema
        version: item.versionsistema || item.version || "",

        // Mantener empresas hijas como array
        empresas_hijas: item.empresas_hijas_json || [],

        // Campos adicionales para compatibilidad
        empresa: item.nombreempresapadre || item.empresa_nombre || "Empresa no especificada",
        rol: (item.nombretecnico || item.tecniconombre) ? "Técnico de Implementación" : "Sin técnico asignado"
      }))

      setDatosImplementaciones(implementacionesTransformadas)
      console.log(`✅ Implementaciones cargadas: ${implementacionesTransformadas.length} registros`)

    } catch (err) {
      console.error('❌ Error al cargar implementaciones:', err)
      setErrorImplementaciones(`Error al cargar datos: ${err.message}`)

      // Datos de ejemplo para desarrollo/fallback
      console.log('📋 Cargando datos de ejemplo como fallback...')
      const datosFallback = [
        {
          implementacionID: 1,
          empresa_nombre: "TechCorp SA",
          RNC: "101-55555-1",
          direccion: "Av. Winston Churchill #123, Santo Domingo",
          contacto: "Juan Pérez",
          contacto_email: "juan.perez@techcorp.do",
          contacto_celular: "809-555-0101",
          tecniconombre: "Carlos Rodríguez",
          email: "carlos.r@fedo.com.do",
          celular: "829-555-0202",
          vendedornombre: "Ana Martínez",
          vendedoremail: "ana.m@fedo.com.do",
          vendedorcelular: "809-555-0303",
          destribuidornombre: "Distribuidora Central",
          destribuidoremail: "ventas@distcentral.com",
          destribuidorcelular: "809-555-0404",
          estado: "en progreso",
          activo: true,
          nombre: "Sistema POS Avanzado",
          version: "2.5.0",
          formato_factura: "B01",
          metodo_integracion: "API REST",
          monto_implementacion: 150000,
          abono: 75000,
          fecha_contratacion: "2023-10-15",
          fecha_inicio: "2023-11-01",
          fecha_creacion: "2023-10-10",
          fecha_modificacion: "2023-11-20",
          resumen: "Implementación completa de sistema POS con integración fiscal.",
          formulario_recopilacion: "Completado y firmado",
          requisitos: "Servidor dedicado, Impresora fiscal Epson",
          confirmaciones: "Pago inicial recibido, Hardware instalado",
          id_tarea_clickup: "TASK-12345",
          empresas_hijas: []
        },
        {
          implementacionID: 2,
          empresa_nombre: "Supermercado El Ahorro",
          RNC: "131-22222-9",
          direccion: "Calle Sol #45, Santiago",
          contacto: "María Díaz",
          contacto_email: "maria.d@ahorro.com.do",
          contacto_celular: "809-555-0505",
          tecniconombre: "Pedro Sánchez",
          email: "pedro.s@fedo.com.do",
          celular: "829-555-0606",
          vendedornombre: "Luis García",
          vendedoremail: "luis.g@fedo.com.do",
          vendedorcelular: "809-555-0707",
          destribuidornombre: "Soluciones Tecnológicas",
          destribuidoremail: "info@soltecdom.com",
          destribuidorcelular: "809-555-0808",
          estado: "completado",
          activo: true,
          nombre: "ERP Enterprise",
          version: "5.1.2",
          formato_factura: "B01",
          metodo_integracion: "Directa",
          monto_implementacion: 350000,
          abono: 350000,
          fecha_contratacion: "2023-08-10",
          fecha_inicio: "2023-08-20",
          fecha_creacion: "2023-08-05",
          fecha_modificacion: "2023-10-30",
          resumen: "Migración de sistema anterior a ERP Enterprise.",
          formulario_recopilacion: "Validado",
          requisitos: "Red cableada Cat6, Servidor Windows 2022",
          confirmaciones: "Capacitación finalizada, Acta de entrega firmada",
          id_tarea_clickup: "TASK-67890",
          empresas_hijas: [
            {
              empresaID: 201,
              empresa_nombre: "El Ahorro Express",
              RNC: "131-22222-9",
              direccion: "Plaza Central, Santiago",
              contacto_nombre: "José Ruiz",
              contacto_email: "jose.r@ahorro.com.do",
              contacto_celular: "809-555-0909",
              estado: "completado",
              activo: true,
              certificacion: "Certificado"
            }
          ]
        },
        {
          implementacionID: 3,
          empresa_nombre: "Farmacia Salud Total",
          RNC: "102-33333-7",
          direccion: "Av. 27 de Febrero #88, Santo Domingo",
          contacto: "Dra. Elena Gómez",
          contacto_email: "elena.g@saludtotal.do",
          contacto_celular: "809-555-1010",
          tecniconombre: "Carlos Rodríguez",
          email: "carlos.r@fedo.com.do",
          celular: "829-555-0202",
          vendedornombre: "Ana Martínez",
          vendedoremail: "ana.m@fedo.com.do",
          vendedorcelular: "809-555-0303",
          destribuidornombre: "Distribuidora Central",
          destribuidoremail: "ventas@distcentral.com",
          destribuidorcelular: "809-555-0404",
          estado: "iniciado",
          activo: true,
          nombre: "Sistema POS Farmacia",
          version: "2.5.0",
          formato_factura: "B01",
          metodo_integracion: "API REST",
          monto_implementacion: 120000,
          abono: 60000,
          fecha_contratacion: "2023-11-25",
          fecha_inicio: "2023-12-01",
          fecha_creacion: "2023-11-20",
          fecha_modificacion: "2023-12-02",
          resumen: "Implementación inicial.",
          formulario_recopilacion: "En proceso",
          requisitos: "PC All-in-One",
          confirmaciones: "Contrato firmado",
          id_tarea_clickup: "TASK-11223",
          empresas_hijas: []
        }
      ]
      setDatosImplementaciones(datosFallback)

    } finally {
      setCargandoImplementaciones(false)
    }
  }

  const cargarCertificacion = async () => {
    try {
      setCargandoCert(true)
      setErrorCert(null)

      console.log('🔄 Cargando certificaciones desde la API...')

      const data = await obtenerCertificacion()
      console.log('📊 Datos de certificación recibidos:', data)
      console.log('📊 Tipo de datos:', Array.isArray(data) ? 'Array' : typeof data)
      console.log('📊 Cantidad de registros:', Array.isArray(data) ? data.length : 0)
      
      // Si la API devuelve array vacío, lanzar error para cargar fallback
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ API devolvió datos vacíos, cargando datos de ejemplo...')
        throw new Error('No hay datos de certificación en la base de datos')
      }
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('📊 Primer registro de certificación:', data[0])
        console.log('📊 Campos disponibles:', Object.keys(data[0]))
      }

      // Transformar datos para la tabla de certificaciones
      const certificacionesExpandidas = []
      
      data.forEach((item, index) => {
        // Agregar empresa padre
        const empresaPadre = {
          ...item,
          empresa_nombre: item.nombreempresapadre || item.empresa_nombre || "Empresa no especificada",
          RNC: item.rncempresapadre || item.RNC || "",
          tecniconombre: item.nombretecnico || item.tecniconombre || "No asignado",
          vendedornombre: item.nombrevendedor || item.vendedornombre || "No asignado",
          certificacionempresapadre: item.certificacionempresapadre || "",
          fecha_modificacion: item.fecha_modificacion || new Date().toISOString().split('T')[0],
          esEmpresaHija: false
        }
        
        certificacionesExpandidas.push(empresaPadre)
        
        // Agregar empresas hijas si existen
        if (Array.isArray(item.empresas_hijas_json) && item.empresas_hijas_json.length > 0) {
          item.empresas_hijas_json.forEach((hija) => {
            certificacionesExpandidas.push({
              empresa_nombre: hija.empresa_nombre_hija || "Subsidiaria sin nombre",
              RNC: hija.RNC_hija || "",
              certificacionempresapadre: hija.estado_hija || "",
              tecniconombre: item.nombretecnico || item.tecniconombre || "No asignado",
              vendedornombre: item.nombrevendedor || item.vendedornombre || "No asignado",
              fecha_modificacion: item.fecha_modificacion || new Date().toISOString().split('T')[0],
              esEmpresaHija: true,
              empresaPadre: empresaPadre.empresa_nombre
            })
          })
        }
        
        if (index === 0) {
          console.log('📊 Primer registro transformado:', empresaPadre)
          if (Array.isArray(item.empresas_hijas_json) && item.empresas_hijas_json.length > 0) {
            console.log('📊 Empresas hijas encontradas:', item.empresas_hijas_json.length)
          }
        }
      })

      setDatosCert(certificacionesExpandidas)
      setUsandoDatosFallbackCert(false) // Datos reales cargados
      console.log(`✅ Certificaciones cargadas: ${certificacionesExpandidas.length} registros (incluyendo subsidiarias)`)
      console.log('✅ Estado actualizado con datos:', certificacionesExpandidas)

    } catch (err) {
      console.error('❌ Error al cargar certificaciones:', err)
      console.warn('⚠️ Cargando datos de ejemplo como fallback...')
      
      // Mostrar advertencia pero no como error crítico
      setErrorCert(null) // No mostrar error si tenemos fallback

      // Fallback data for certifications
      const datosCertFallback = [
        {
          empresa_nombre: "TechCorp SA",
          RNC: "101-55555-1",
          certificacionempresapadre: "Sin empezar Certificación",
          tecniconombre: "Carlos Rodríguez",
          vendedornombre: "Ana Martínez",
          fecha_modificacion: "2023-11-20",
          esEmpresaHija: false
        },
        {
          empresa_nombre: "Supermercado El Ahorro",
          RNC: "131-22222-9",
          certificacionempresapadre: "Paso 15 Finalización",
          tecniconombre: "Pedro Sánchez",
          vendedornombre: "Luis García",
          fecha_modificacion: "2023-10-30",
          esEmpresaHija: false
        },
        {
          empresa_nombre: "El Ahorro Express",
          RNC: "131-22222-9",
          certificacionempresapadre: "",
          tecniconombre: "Pedro Sánchez",
          vendedornombre: "Luis García",
          fecha_modificacion: "2023-10-30",
          esEmpresaHija: true,
          empresaPadre: "Supermercado El Ahorro"
        }
      ]
      setDatosCert(datosCertFallback)
      setUsandoDatosFallbackCert(true) // Marcador de datos de ejemplo
      console.log('✅ Datos de ejemplo cargados:', datosCertFallback.length, 'registros')

    } finally {
      setCargandoCert(false)
    }
  }

  const handleViewDetails = (item) => {
    setItemDetalles(item)
    setModalDetallesAbierto(true)
  }

  return (
    <AppLayout>
      <div className="h-full p-3 sm:p-4 lg:p-6">
        {/* Header de la página */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Panel de Reportes</h1>
          <p className="text-sm sm:text-base text-gray-600">Visualización y gestión de implementaciones y certificaciones</p>
        </div>

        <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
          {/* Tabla de Implementaciones */}
          <TablaImplementaciones
            datos={datosImplementaciones}
            loading={cargandoImplementaciones}
            error={errorImplementaciones}
            onReload={cargarImplementaciones}
            onViewDetails={handleViewDetails}
          />

          {/* Tabla de Certificaciones */}
          <TablaCertificaciones
            datos={datosCert}
            loading={cargandoCert}
            error={errorCert}
            onReload={cargarCertificacion}
            usandoDatosFallback={usandoDatosFallbackCert}
          />
        </div>

        {/* Modal de Detalles */}
        <ModalDetalles
          isOpen={modalDetallesAbierto}
          onClose={() => setModalDetallesAbierto(false)}
          item={itemDetalles}
        />
      </div>
    </AppLayout>
  )
}
