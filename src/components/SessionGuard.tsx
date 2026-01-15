"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

interface SessionGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'estudiante'
}

export default function SessionGuard({ children, requiredRole }: SessionGuardProps) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Redirigir al login si no está autenticado
      window.location.href = '/login'
    },
  })
  
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificar sesión cada 5 segundos
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/session')
        const sessionData = await response.json()
        
        if (!sessionData || !sessionData.user) {
          // No hay sesión válida, redirigir a login
          window.location.href = '/login'
        } else if (requiredRole && sessionData.user.rol !== requiredRole) {
          // No tiene el rol requerido
          window.location.href = '/dashboard'
        }
      } catch (error) {
        console.error('Error verificando sesión:', error)
      }
    }, 5000) // Cada 5 segundos

    return () => clearInterval(interval)
  }, [requiredRole])

  useEffect(() => {
    // Verificar rol inmediatamente si la sesión está cargada
    if (status === 'authenticated' && session?.user) {
      if (requiredRole && session.user.rol !== requiredRole) {
        window.location.href = '/dashboard'
      }
    }
  }, [status, session, requiredRole])

  // Prevenir caché con evento beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Limpiar cualquier caché local
      if (window.performance) {
        if (performance.navigation.type === 2) {
          // Usuario volvió con el botón atrás
          window.location.reload()
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Detectar cuando la página se vuelve visible (por si viene del historial)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Verificar sesión cuando la página se hace visible
        fetch('/api/auth/session')
          .then(res => res.json())
          .then(data => {
            if (!data || !data.user) {
              window.location.href = '/login'
            }
          })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!session || !session.user) {
    return null // Se redirigirá automáticamente
  }

  return <>{children}</>
}
