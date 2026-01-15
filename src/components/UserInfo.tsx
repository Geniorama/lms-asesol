"use client"

import { useAuth } from "@/hooks/useAuth"

/**
 * Componente para mostrar información del usuario autenticado
 * Muestra un skeleton loader mientras carga
 */
export default function UserInfo() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
          <div className="h-3 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
        {user.nombre.charAt(0)}{user.apellidos.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {user.nombre} {user.apellidos}
        </p>
        <p className="text-xs text-gray-500 capitalize">
          {user.rol}
        </p>
      </div>
    </div>
  )
}
