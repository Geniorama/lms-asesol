import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import { supabaseAdmin } from './lib/supabase'
import { z } from 'zod'

// Validación de credenciales
const credentialsSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true, // Necesario para Netlify y otros hosting
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        // Validar credenciales
        const validatedCredentials = credentialsSchema.safeParse(credentials)
        
        if (!validatedCredentials.success) {
          return null
        }
        
        const { email, password } = validatedCredentials.data
        
        try {
          // Buscar usuario en Supabase
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('activo', true)
            .single()
          
          if (error || !user) {
            console.log('Usuario no encontrado:', email)
            return null
          }
          
          // Verificar contraseña
          const passwordMatch = await bcrypt.compare(password, user.password_hash)
          
          if (!passwordMatch) {
            console.log('Contraseña incorrecta para:', email)
            return null
          }
          
          // Actualizar último acceso
          await supabaseAdmin
            .from('users')
            .update({ ultimo_acceso: new Date().toISOString() })
            .eq('id', user.id)
          
          // Retornar usuario (sin el password_hash)
          return {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellidos: user.apellidos,
            rol: user.rol,
          }
        } catch (error) {
          console.error('Error en authorize:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = user.rol
        token.nombre = user.nombre
        token.apellidos = user.apellidos
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.rol = token.rol as 'estudiante' | 'admin'
        session.user.nombre = token.nombre as string
        session.user.apellidos = token.apellidos as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
})
