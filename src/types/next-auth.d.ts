import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      rol: 'estudiante' | 'admin'
      nombre: string
      apellidos: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    nombre: string
    apellidos: string
    rol: 'estudiante' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    rol: 'estudiante' | 'admin'
    nombre: string
    apellidos: string
  }
}
