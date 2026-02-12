# Sistema de APIs Centralizado

## 📁 Estructura de Archivos

### `/src/utils/apiUtils.js`
Centraliza todas las llamadas a APIs N8N y proporciona funciones utilitarias reutilizables.

### Funciones Disponibles

#### 🔧 Función Principal
```javascript
callN8NAPI(endpoint, options)
```
- **Propósito**: Función genérica para hacer llamadas a cualquier endpoint de N8N
- **Parámetros**: 
  - `endpoint`: Nombre del endpoint (ej: 'TablaMiembros', 'crear-miembro')
  - `options`: Opciones de fetch (method, body, headers, etc.)
- **Retorna**: Promise con la respuesta de la API

#### 📋 Funciones Específicas
```javascript
// Obtener lista de miembros
obtenerMiembros()

// Crear nuevo miembro
crearMiembro(datosPersonal)

// Crear nueva tarea
crearTarea(datosTarea)

// Funciones futuras (ejemplos)
actualizarMiembro(id, datosPersonal)
eliminarMiembro(id)
```

#### 🔄 Funciones Utilitarias
```javascript
// Convertir tipos de texto a números
convertirTiposANumeros(['Tecnico', 'Vendedor']) // [1, 2]

// Formatear datos del formulario para la API
formatearDatosParaAPI(formData)
```

## 🎯 Beneficios del Sistema

### ✅ Ventajas
1. **DRY (Don't Repeat Yourself)**: Una sola base URL para todos los endpoints
2. **Mantenimiento**: Cambios en la base se reflejan en toda la app
3. **Consistencia**: Mismo manejo de errores y logging para todas las APIs
4. **Escalabilidad**: Fácil agregar nuevos endpoints
5. **Debugging**: Logging centralizado y consistente

### 🔧 Configuración
```env
# Variable de entorno para la base URL
VITE_N8N_BASE_URL=https://n8n-dev.waopos.com/webhook
```

## 📚 Uso en Componentes

### Antes (Duplicación)
```javascript
// En cada componente
const response = await fetch('https://n8n-dev.waopos.com/webhook/TablaMiembros', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

### Después (Centralizado)
```javascript
// Importar funciones
import { obtenerMiembros, crearMiembro } from '../utils/apiUtils.js'

// Usar funciones específicas
const data = await obtenerMiembros()
const result = await crearMiembro(datosPersonal)
```

## 🚀 Endpoints Disponibles

| Función | Endpoint | Método | Descripción |
|---------|----------|--------|-------------|
| `obtenerMiembros()` | `/TablaMiembros` | POST | Obtiene lista de personal |
| `crearMiembro()` | `/crear-miembro` | POST | Crea nuevo miembro |
| `crearTarea()` | `/c49681de-ed44-4032-a426-ebe3c911a030` | POST | Crea nueva tarea |
| `actualizarMiembro()` | `/actualizar-miembro/{id}` | PUT | Actualiza miembro (futuro) |
| `eliminarMiembro()` | `/eliminar-miembro/{id}` | DELETE | Elimina miembro (futuro) |

## 🔍 Logging y Debugging

Todas las funciones incluyen logging automático:
- 🌐 Request: URL, método, datos enviados
- ✅ Success: Respuesta exitosa
- ❌ Error: Detalles del error con contexto

## 📝 Migración

### Pasos para migrar APIs existentes:
1. Identificar APIs que usan la misma base URL
2. Crear función específica en `apiUtils.js`
3. Reemplazar fetch directo con función utilitaria
4. Remover URLs duplicadas del `.env`
5. Probar funcionalidad

### Ejemplo de migración:
```javascript
// Antes
const url = `${import.meta.env.VITE_BASE_URL}/nuevo-endpoint`
const response = await fetch(url, options)

// Después
export async function nuevaFuncion(data) {
  return callN8NAPI('nuevo-endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

## 🎯 Ejemplo: API de Creación de Tareas

### Estructura de datos para `crearTarea()`:
```javascript
const datosTarea = {
  formData: {
    asignar: "Odalisse Arguello",
    fechaInicio: "2025-10-30",
    cantidadClientFE: "150",
    celular: "8095551234",
    emailTecnico: "tecnico@empresa.com",
    direccionFisica: "Av. Winston Churchill #25, Piantini, Santo Domingo",
    fechaContratacion: "2025-11-15",
    formato: "XML",
    nombreCliente: "Grupo Empresarial ABC",
    nombreContacto: "María García",
    montoImplementacion: "250000",
    procesamientoAnual: "1200000",
    rnc: "131234567",
    sistema: "WebPOS en la Nube v: 1",
    transmision: "Tiempo Real",
    abono: "100000",
    resumenContratado: "Implementación completa con 2 sucursales",
    vendedor: "Carlos Rodríguez",
    vendedorDistribuidor: "Tech Solutions RD",
    esGrupo: "si",
    nombreGrupo: "Grupo Empresarial ABC",
    cantidadNrcs: "2"
  },
  confirmaciones: {
    true: [
      "Tiene acceso al portal DGII",
      "Tiene firma electrónica y p12"
    ]
  },
  requisitos: {
    true: [
      "Firmó propuesta",
      "Hizo el avance",
      "Firmó Acuerdo de Servicio"
    ]
  },
  nrcs: [
    {
      nombre: "ABC Retail Store",
      rnc: "131567890",
      email: "tecnico@empresa.com",
      direccion: "Av. Winston Churchill #25, Piantini, Santo Domingo",
      activo: true,
      buscando: false
    },
    {
      nombre: "ABC Distribution Center",
      rnc: "131678901",
      email: "tecnico@empresa.com",
      direccion: "Av. Winston Churchill #25, Piantini, Santo Domingo",
      activo: true,
      buscando: false
    }
  ]
}

// Uso en componente
import { crearTarea } from '../utils/apiUtils'

const result = await crearTarea(datosTarea)
```
```