import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnLogin = nextUrl.pathname.startsWith('/login')
      const isOnGracias = nextUrl.pathname.startsWith('/gracias')
      
      // Permitir acceso público a estas rutas
      if (nextUrl.pathname.startsWith('/formulario-inscripcion') || 
          nextUrl.pathname === '/' ||
          isOnGracias) {
        return true
      }
      
      // Proteger rutas de dashboard y admin
      if (isOnDashboard || isOnAdmin) {
        if (!isLoggedIn) return false
        
        // Verificar rol para admin
        if (isOnAdmin && auth.user.rol !== 'admin') {
          return false
        }
        
        return true
      }
      
      // Redirigir a dashboard si ya está logueado e intenta acceder a login
      if (isLoggedIn && isOnLogin) {
        return false
      }
      
      return true
    },
  },
  providers: [], // Se agregarán en auth.ts
} satisfies NextAuthConfig
