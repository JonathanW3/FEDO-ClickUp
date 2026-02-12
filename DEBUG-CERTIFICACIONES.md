# 🔍 Guía de Diagnóstico - Tabla de Certificaciones

## Problema Identificado y Solución

### ✅ **PROBLEMA SOLUCIONADO**
La función `cargarCertificacion` estaba faltando el log de confirmación después de hacer `setDatosCert`. Ya fue corregido.

---

## Pasos para Verificar que Funciona

### 1. Abre la Consola del Navegador
- Presiona `F12` o `Ctrl+Shift+I` (Chrome/Edge)
- Ve a la pestaña **Console**

### 2. Ve a la Página de Reportes
- Navega a `/reportes` en tu aplicación
- La tabla de certificaciones debería cargar automáticamente

### 3. Revisa los Logs en la Consola

Deberías ver algo como:
```
🔄 Cargando certificaciones desde la API...
📊 Datos de certificación recibidos: Array(X)
📊 Tipo de datos: Array
📊 Cantidad de registros: X
📊 Primer registro de certificación: {objeto}
📊 Campos disponibles: ['campo1', 'campo2', ...]
📊 Primer registro transformado: {objeto}
✅ Certificaciones cargadas: X registros
✅ Estado actualizado con datos: Array(X)
```

---

## 🚨 Si NO Aparecen Datos

### Posible Causa 1: API no responde
**Síntomas:**
```
❌ Error al cargar certificaciones: No se pudo obtener los datos...
```

**Solución:**
1. Verifica que el servidor N8N esté funcionando
2. Verifica la URL en tu archivo `.env`:
   ```
   VITE_N8N_BASE_URL=https://n8n-dev.waopos.com/webhook
   ```
3. Verifica que la tabla "certificaciones" exista en tu base de datos

### Posible Causa 2: Datos vacíos
**Síntomas:**
```
📊 Cantidad de registros: 0
```

**Solución:**
- La tabla "certificaciones" en tu base de datos está vacía
- Verifica que tengas datos en la tabla con una consulta SQL:
  ```sql
  SELECT * FROM certificaciones LIMIT 10;
  ```

### Posible Causa 3: Campos incorrectos
**Síntomas:**
- Los datos cargan pero la tabla muestra "No asignado" o "Empresa no especificada"

**Solución:**
Revisa el log `📊 Campos disponibles:` en la consola y compara con los campos esperados:
- `nombreempresapadre` o `empresa_nombre`
- `rncempresapadre` o `RNC`
- `nombretecnico` o `tecniconombre`
- `nombrevendedor` o `vendedornombre`
- `certificacion` o `estado`
- `fecha_modificacion`

---

## 🔧 Prueba Manual de la API

Abre una nueva pestaña de consola en el navegador y ejecuta:

```javascript
// Probar la API directamente
fetch('https://n8n-dev.waopos.com/webhook/TablaMiembros', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    "Table": "certificaciones",
    "Type": "SQL"
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Respuesta de la API:', data)
  console.log('✅ Cantidad:', data.length)
  console.log('✅ Primer registro:', data[0])
})
.catch(err => console.error('❌ Error:', err))
```

---

## 📋 Checklist de Verificación

- [ ] La consola muestra "🔄 Cargando certificaciones desde la API..."
- [ ] La consola muestra "📊 Datos de certificación recibidos"
- [ ] La consola muestra "✅ Certificaciones cargadas: X registros"
- [ ] La tabla muestra los datos correctamente
- [ ] Los filtros funcionan
- [ ] La paginación funciona
- [ ] Los botones de exportación funcionan

---

## 💡 Información Adicional

### Estructura Esperada de la Respuesta de la API

```json
[
  {
    "nombreempresapadre": "Nombre de la Empresa",
    "rncempresapadre": "123456789",
    "nombretecnico": "Juan Pérez",
    "nombrevendedor": "María García",
    "certificacion": "Certificado",
    "fecha_modificacion": "2025-12-03"
  }
]
```

### Si Necesitas Datos de Prueba

Los datos de fallback se cargarán automáticamente si hay un error:
- TechCorp SA (Pendiente)
- Supermercado El Ahorro (Certificado)
- El Ahorro Express (Certificado - Subsidiaria)

---

## 🎯 Próximos Pasos

1. **Ejecuta tu aplicación:**
   ```bash
   npm run dev
   ```

2. **Abre la consola del navegador** (F12)

3. **Ve a /reportes**

4. **Revisa los logs** y compártelos conmigo si hay algún problema

5. **Si funciona:** ¡Listo! Puedes eliminar este archivo DEBUG.

---

## 📞 Soporte

Si sigues teniendo problemas, proporciona:
1. Los logs completos de la consola
2. La respuesta de la API (usando el código de prueba manual)
3. Captura de pantalla de la tabla de certificaciones
