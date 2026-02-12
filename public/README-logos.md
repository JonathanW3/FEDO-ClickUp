# Logo WebPOS

## Ubicación de Logos
Los logos de WebPOS están disponibles en:

- `/public/logo_empresa.png` - Logo principal de la empresa (PNG personalizado)
- `/public/logo-webpos-white.svg` - Logo SVG blanco (fallback)
- `/public/favicon.svg` - Favicon actual

## Uso en React
```jsx
// Logo normal
<WebPOSLogo className="h-16 w-auto" />

// Logo con filtro blanco para fondo oscuro
<WebPOSLogo variant="white" className="h-16 w-auto" />
```

## Especificaciones
- Formato principal: PNG personalizado
- Archivo: logo_empresa.png
- Filtros CSS: brightness(0) invert(1) para versión blanca
- Alternativa: SVG vectorial como fallback

## Notas
- El logo PNG se usa en todas las variantes
- Para fondos oscuros se aplica filtro CSS automáticamente
- Si necesitas una versión específica para fondos oscuros, coloca el archivo como `logo_empresa_white.png`