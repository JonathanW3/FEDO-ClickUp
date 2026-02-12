# FEDO-ClickUp - Docker Setup

## 🐳 Construcción y Despliegue

### Opción 1: Usando Docker Compose (Recomendado)

```bash
# Construir y levantar el contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

La aplicación estará disponible en: http://localhost:3000

### Opción 2: Usando Docker directamente

```bash
# Construir la imagen
docker build -t fedo-clickup:latest .

# Ejecutar el contenedor
docker run -d -p 3000:80 --name fedo-clickup-web fedo-clickup:latest

# Ver logs
docker logs -f fedo-clickup-web

# Detener y eliminar
docker stop fedo-clickup-web
docker rm fedo-clickup-web
```

## 📦 Estructura del Dockerfile

El Dockerfile utiliza un **build multi-etapa**:

1. **Etapa de construcción (builder)**:
   - Node.js 18 Alpine (imagen ligera)
   - Instala dependencias con `npm ci`
   - Compila la aplicación con Vite

2. **Etapa de producción**:
   - Nginx Alpine (solo ~5MB)
   - Copia los archivos construidos desde la etapa anterior
   - Configuración optimizada de Nginx con:
     - Compresión Gzip
     - Cache de assets estáticos
     - Headers de seguridad
     - Soporte para SPA (React Router)
     - Health check endpoint

## 🔧 Configuración Personalizada

### Variables de Entorno

Si necesitas variables de entorno en el build:

```bash
docker build --build-arg API_URL=https://tu-api.com -t fedo-clickup .
```

### Puerto Personalizado

Edita `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Cambia 8080 por el puerto que prefieras
```

## 🚀 Despliegue en Producción

### Usar una imagen de registro

```bash
# Tag la imagen
docker tag fedo-clickup:latest tu-registry.com/fedo-clickup:v1.0.0

# Push al registro
docker push tu-registry.com/fedo-clickup:v1.0.0
```

### Health Check

El servidor incluye un endpoint de health check:

```bash
curl http://localhost:3000/health
# Respuesta: healthy
```

## 📊 Tamaño de la Imagen

- Imagen de construcción: ~400MB (se descarta)
- Imagen final: ~25MB (solo Nginx + archivos estáticos)

## 🛡️ Seguridad

La configuración de Nginx incluye:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

## 🔍 Troubleshooting

### Ver logs del contenedor
```bash
docker logs fedo-clickup-web
```

### Acceder al contenedor
```bash
docker exec -it fedo-clickup-web sh
```

### Reconstruir sin cache
```bash
docker-compose build --no-cache
```
