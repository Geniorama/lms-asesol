# 🔐 Sistema de Autenticación - LMS ASESOL

## 📚 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Configuración](#configuración)
3. [Uso](#uso)
4. [Estructura](#estructura)
5. [API](#api)
6. [Ejemplos](#ejemplos)

---

## 🚀 Instalación

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install next-auth@beta @supabase/supabase-js bcryptjs zod
npm install --save-dev @types/bcryptjs
```

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-generado

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Base de Datos

Ejecuta el SQL en Supabase (archivo `supabase-schema.sql`):

```sql
-- Crea tablas, roles y políticas de seguridad
```

### 3. Usuario Admin Inicial

Genera un hash de contraseña:

```bash
node scripts/hash-password.mjs "Admin123!"
```

Luego inserta el admin en Supabase.

---

## 📖 Uso

### Proteger Páginas (Server Components)

```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }
  
  // Solo admins
  if (session.user.rol !== 'admin') {
    redirect("/dashboard")
  }
  
  return <div>Contenido protegido</div>
}
```

### Usar Sesión (Client Components)

```typescript
"use client"

import { useAuth } from "@/hooks/useAuth"

export default function MyComponent() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()
  
  if (isLoading) return <div>Cargando...</div>
  
  if (!isAuthenticated) return <div>Debes iniciar sesión</div>
  
  return (
    <div>
      <h1>Hola {user?.nombre}</h1>
      {isAdmin && <p>Eres administrador</p>}
    </div>
  )
}
```

### Login Manual

```typescript
"use client"

import { signIn } from "next-auth/react"

async function handleLogin(email: string, password: string) {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  })
  
  if (result?.ok) {
    router.push("/dashboard")
  }
}
```

### Logout

```typescript
import { signOut } from "@/auth"

// Server Action
<form action={async () => {
  "use server"
  await signOut({ redirectTo: "/login" })
}}>
  <button type="submit">Cerrar Sesión</button>
</form>
```

O desde el cliente:

```typescript
"use client"

import { signOut } from "next-auth/react"

<button onClick={() => signOut({ callbackUrl: "/login" })}>
  Cerrar Sesión
</button>
```

---

## 🏗️ Estructura

```
src/
├── auth.ts                          # Configuración principal de NextAuth
├── auth.config.ts                   # Callbacks y opciones de auth
├── middleware.ts                    # Middleware para proteger rutas
├── lib/
│   └── supabase.ts                 # Cliente de Supabase
├── hooks/
│   └── useAuth.ts                  # Hook para usar sesión (client)
├── components/
│   └── SessionProvider.tsx         # Provider de sesión
├── types/
│   └── next-auth.d.ts              # Tipos extendidos de NextAuth
└── app/
    ├── api/auth/[...nextauth]/     # Endpoint de NextAuth
    ├── login/                      # Página de login
    ├── dashboard/                  # Dashboard protegido
    └── admin/                      # Panel de admin (solo admin)
```

---

## 🔌 API

### Server-Side

```typescript
import { auth } from "@/auth"

// Obtener sesión actual
const session = await auth()

// Verificar rol
if (session?.user.rol === 'admin') {
  // Código de admin
}
```

### Client-Side

```typescript
import { useAuth } from "@/hooks/useAuth"

const { 
  user,           // Objeto de usuario
  isLoading,      // Estado de carga
  isAuthenticated,// Si está autenticado
  isAdmin,        // Si es admin
  isEstudiante    // Si es estudiante
} = useAuth()
```

### Tipos de Usuario

```typescript
interface User {
  id: string
  email: string
  nombre: string
  apellidos: string
  rol: 'estudiante' | 'admin'
}
```

---

## 💡 Ejemplos

### Ejemplo 1: Botón Condicional por Rol

```typescript
"use client"

import { useAuth } from "@/hooks/useAuth"

export default function ConditionalButton() {
  const { isAdmin, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) return null
  
  return (
    <div>
      {isAdmin ? (
        <button>Ver Panel Admin</button>
      ) : (
        <button>Ver Mi Perfil</button>
      )}
    </div>
  )
}
```

### Ejemplo 2: Formulario de Login Completo

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Credenciales inválidas")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input 
        name="email" 
        type="email" 
        required 
        placeholder="Email"
      />
      
      <input 
        name="password" 
        type="password" 
        required 
        placeholder="Contraseña"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Iniciar Sesión"}
      </button>
    </form>
  )
}
```

### Ejemplo 3: Proteger API Route

```typescript
// app/api/admin/users/route.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    )
  }
  
  if (session.user.rol !== 'admin') {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 403 }
    )
  }
  
  // Lógica de admin
  return NextResponse.json({ users: [] })
}
```

### Ejemplo 4: Crear Nuevo Usuario

```typescript
// app/api/admin/users/create/route.ts
import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  const { email, password, nombre, apellidos, rol } = await request.json()
  
  // Hash de contraseña
  const passwordHash = await bcrypt.hash(password, 10)
  
  // Insertar en Supabase
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      nombre,
      apellidos,
      rol,
    })
    .select()
    .single()
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json({ user: data })
}
```

---

## 🔒 Seguridad

### Buenas Prácticas

1. **Nunca expongas el SUPABASE_SERVICE_ROLE_KEY** en el cliente
2. **Usa variables de entorno** para secretos
3. **Valida siempre en el servidor** (no solo en el cliente)
4. **Implementa rate limiting** en endpoints de login
5. **Usa HTTPS** en producción

### Row Level Security (RLS)

El esquema incluye políticas RLS en Supabase:
- Los usuarios solo pueden ver/editar su propio perfil
- Los admins pueden ver/editar todos los usuarios

---

## 🐛 Troubleshooting

### "Session not found"
- Verifica que `SessionProvider` esté en el layout
- Asegúrate de usar `"use client"` en componentes que usen `useAuth`

### "Invalid credentials"
- Verifica el hash de la contraseña
- Revisa que el usuario exista y esté activo
- Chequea los logs del servidor

### "NEXTAUTH_SECRET missing"
- Verifica que `.env.local` exista y tenga el secret
- Reinicia el servidor después de cambiar env vars

---

## 📚 Recursos

- [NextAuth Docs](https://authjs.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [bcrypt Docs](https://github.com/kelektiv/node.bcrypt.js)

---

## 🎯 Roadmap

- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] 2FA (autenticación de dos factores)
- [ ] OAuth (Google, GitHub, etc.)
- [ ] Historial de sesiones
- [ ] Logs de actividad
