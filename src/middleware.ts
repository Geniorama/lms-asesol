import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user

  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')
  const isOnLogin = nextUrl.pathname.startsWith('/login')

  // Si intenta acceder a rutas protegidas sin estar logueado
  if ((isOnDashboard || isOnAdmin) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Si intenta acceder a admin sin ser admin
  if (isOnAdmin && isLoggedIn && req.auth?.user?.rol !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Si está logueado e intenta acceder a login, redirigir a dashboard
  if (isLoggedIn && isOnLogin) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Agregar headers de no-cache para páginas protegidas
  if (isOnDashboard || isOnAdmin) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
