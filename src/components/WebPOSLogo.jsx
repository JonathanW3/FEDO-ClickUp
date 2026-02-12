import React from 'react'

export default function WebPOSLogo({ variant = 'normal', className = 'h-8 w-auto' }) {
  const logoSrc = '/logo_empresa.png'
  
  // Sombras para mejor visibilidad en fondos oscuros
  const shadowStyle = variant === 'white' ? {
    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 0 rgba(255, 255, 255, 0.1))',
    // Alternativa con sombra más fuerte:
    // filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))'
  } : {}
  
  return (
    <img 
      src={logoSrc}
      alt="WebPOS" 
      className={className}
      style={shadowStyle}
      onError={(e) => {
        console.warn('Error cargando logo:', logoSrc)
        e.target.src = '/favicon.svg'
      }}
    />
  )
}

// Uso del componente:
// <WebPOSLogo /> - Logo normal sin efectos
// <WebPOSLogo variant="white" /> - Logo con sombras para fondos oscuros
// <WebPOSLogo className="h-16 w-auto" /> - Tamaño personalizado