import { auth } from './auth'

export default auth((req) => {
  // El middleware se ejecuta en cada request
  // La lógica de autorización está en auth.config.ts
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
