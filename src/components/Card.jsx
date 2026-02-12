import React from 'react'

export default function Card({title, children, className=''}){
  return (
    <div className={`card ${className}`}>
      {title && <div className="text-sm text-blue-700 font-semibold mb-2">{title}</div>}
      {children}
    </div>
  )
}
