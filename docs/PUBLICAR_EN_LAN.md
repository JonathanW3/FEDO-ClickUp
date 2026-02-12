# 🌐 Guía para Publicar la App en Red Local (LAN)

## 📋 Configuración Completada

La aplicación ya está configurada para funcionar en red local. Los cambios realizados incluyen:

### ⚙️ Configuración de Vite
- **host: '0.0.0.0'** en `vite.config.js` - Permite acceso desde cualquier IP
- **Scripts adicionales** en `package.json` para desarrollo y preview en LAN

---

## 🚀 Métodos para Publicar en LAN

### **Método 1: Desarrollo (Recomendado para pruebas)**

#### Paso 1: Ejecutar en modo desarrollo
```bash
npm run dev:lan
```
**O también:**
```bash
npm run dev -- --host 0.0.0.0
```

#### Paso 2: Obtener tu IP local
En **Windows PowerShell**:
```powershell
ipconfig | findstr "IPv4"
```

En **Command Prompt**:
```cmd
ipconfig
```

Busca tu dirección IPv4 (ejemplo: `192.168.1.100`)

#### Paso 3: Compartir la URL
- **Tu acceso local**: `http://localhost:5173`
- **Acceso desde otros dispositivos**: `http://TU_IP:5173`
- **Ejemplo**: `http://192.168.1.100:5173`

---

### **Método 2: Build de Producción**

#### Paso 1: Crear build de producción
```bash
npm run build
```

#### Paso 2: Servir la aplicación en LAN
```bash
npm run preview:lan
```

#### Paso 3: Acceder desde otros dispositivos
- **URL**: `http://TU_IP:4173`
- **Ejemplo**: `http://192.168.1.100:4173`

---

## 📱 Configuración de Firewall

### Windows Defender Firewall
1. **Abrir Configuración de Firewall**:
   - Panel de Control → Sistema y Seguridad → Firewall de Windows Defender

2. **Permitir aplicación**:
   - Clic en "Permitir una aplicación o característica..."
   - Agregar Node.js si no está permitido
   - Marcar tanto "Privada" como "Pública"

### Comando PowerShell (Como Administrador)
```powershell
# Permitir puerto 5173 (desarrollo)
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow

# Permitir puerto 4173 (preview)
New-NetFirewallRule -DisplayName "Vite Preview Server" -Direction Inbound -Protocol TCP -LocalPort 4173 -Action Allow
```

---

## 🔧 Solución de Problemas

### ❌ "No se puede conectar"
1. **Verificar IP**: Asegúrate de usar la IP correcta
2. **Verificar puerto**: Confirma que el puerto esté abierto
3. **Firewall**: Revisar configuración de firewall
4. **Red**: Asegúrate de estar en la misma red WiFi/LAN

### ❌ "Página no carga"
1. **Reiniciar servidor**: Para aplicar cambios de configuración
2. **Limpiar caché**: Ctrl+F5 en el navegador
3. **Probar otro dispositivo**: Para aislar el problema

### ❌ "APIs no funcionan"
- Las APIs externas seguirán funcionando desde cualquier dispositivo
- Las variables de entorno se mantienen

---

## 📋 Comandos Disponibles

| Comando | Descripción | URL de Acceso |
|---------|-------------|---------------|
| `npm run dev` | Desarrollo local | `http://localhost:5173` |
| `npm run dev:lan` | Desarrollo en LAN | `http://TU_IP:5173` |
| `npm run build` | Construir para producción | - |
| `npm run preview` | Preview local | `http://localhost:4173` |
| `npm run preview:lan` | Preview en LAN | `http://TU_IP:4173` |

---

## 🌟 Recomendaciones

### Para Desarrollo:
- Usar `npm run dev:lan` para desarrollo colaborativo
- Mantener la consola abierta para ver logs
- Hot reload funciona en todos los dispositivos

### Para Demos/Presentaciones:
- Usar `npm run build && npm run preview:lan`
- Mejor rendimiento y estabilidad
- Simula entorno de producción

### Para Pruebas Mobile:
- Acceder desde teléfonos/tablets en la misma WiFi
- Probar responsive design en dispositivos reales
- Verificar funcionamiento de APIs

---

## 🔒 Consideraciones de Seguridad

⚠️ **Importante**: 
- Solo usar en redes confiables (WiFi doméstica/oficina)
- No exponer en redes públicas
- Cerrar el servidor cuando no se use
- Para producción real, usar un servidor web apropiado

---

## 📞 Compartir con el Equipo

Para compartir fácilmente con tu equipo:

1. **Ejecutar**: `npm run dev:lan`
2. **Obtener IP**: Usar `ipconfig`
3. **Compartir URL**: `http://TU_IP:5173`
4. **QR Code**: Opcional - usar herramientas online para generar QR

### Ejemplo de mensaje para el equipo:
```
🚀 App disponible en red local:
📱 URL: http://192.168.1.100:5173
💻 Funciona en móviles, tablets y PCs
🔄 Actualizaciones en tiempo real
```