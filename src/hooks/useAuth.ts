"use client"

import { useSession } from "next-auth/react"

/**
 * Hook personalizado para acceder a la sesión del usuario
 * Solo para componentes client-side
 */
export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.rol === "admin",
    isEstudiante: session?.user?.rol === "estudiante",
  }
}
