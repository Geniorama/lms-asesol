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
    const response = NextResponse.redirect(new URL('/login', nextUrl))
    // Headers agresivos para evitar caché
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')
    return response
  }

  // Si intenta acceder a admin sin ser admin
  if (isOnAdmin && isLoggedIn && req.auth?.user?.rol !== 'admin') {
    const response = NextResponse.redirect(new URL('/dashboard', nextUrl))
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }

  // Si está logueado e intenta acceder a login, redirigir a dashboard
  if (isLoggedIn && isOnLogin) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Agregar headers de no-cache para páginas protegidas
  if (isOnDashboard || isOnAdmin) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('X-Accel-Expires', '0')
    return response
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
