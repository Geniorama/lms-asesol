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
      
      // Permitir acceso al formulario de inscripción sin autenticación
      if (nextUrl.pathname.startsWith('/formulario-inscripcion')) {
        return true
      }
      
      if (isOnDashboard || isOnAdmin) {
        if (!isLoggedIn) return false // Redirigir a login
        
        // Verificar rol para admin
        if (isOnAdmin && auth.user.rol !== 'admin') {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
        
        return true
      }
      
      // Redirigir a dashboard si ya está logueado e intenta acceder a login
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      
      return true
    },
  },
  providers: [], // Se agregarán en auth.ts
} satisfies NextAuthConfig
