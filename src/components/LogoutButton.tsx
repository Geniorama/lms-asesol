"use client"

import { signOut } from "next-auth/react"
import { useState } from "react"

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function LogoutButton({ className, children }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // SignOut con NextAuth
      await signOut({ 
        redirect: true,
        callbackUrl: '/login'
      })
      
      // Forzar recarga completa de la página
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Aún así redirigir al login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className}
      type="button"
    >
      {loading ? 'Cerrando sesión...' : (children || 'Cerrar Sesión')}
    </button>
  )
}
