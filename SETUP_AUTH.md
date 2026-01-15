# Configuración de Autenticación - LMS ASESOL

Este documento explica cómo configurar el sistema de autenticación con NextAuth y Supabase.

## 📋 Prerequisitos

1. Cuenta de Supabase creada
2. Proyecto de Supabase configurado

## 🚀 Pasos de Configuración

### 1. Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Guarda las credenciales

2. **Ejecutar el esquema SQL:**
   - Abre el Editor SQL en Supabase
   - Copia y pega el contenido de `supabase-schema.sql`
   - Ejecuta el script

3. **Obtener las credenciales:**
   - Ve a Settings → API
   - Copia:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configurar Variables de Entorno

1. **Crear archivo `.env.local`:**
```bash
cp env.template .env.local
# O en Windows PowerShell:
copy env.template .env.local
```

2. **Completar las variables:**
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secret-con-openssl-rand-base64-32

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

3. **Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Crear Usuario Administrador

Ejecuta este SQL en Supabase para crear el admin por defecto:

```sql
-- Instalar bcrypt para generar el hash
-- Puedes usar: https://bcrypt-generator.com/
-- Contraseña: Admin123!

INSERT INTO users (email, password_hash, nombre, apellidos, rol) 
VALUES (
  'admin@asesol.com',
  -- Hash para Admin123! (generado con bcrypt)
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Administrador',
  'Sistema',
  'admin'
);
```

**IMPORTANTE:** Cambia la contraseña inmediatamente después del primer login.

### 4. Instalar Dependencias

Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
npm install next-auth@beta @supabase/supabase-js bcryptjs zod
npm install --save-dev @types/bcryptjs
```

### 5. Ejecutar el Proyecto

```bash
npm run dev
```

Visita: `http://localhost:3000/login`

## 🔐 Credenciales por Defecto

**Admin:**
- Email: `admin@asesol.com`
- Password: `Admin123!`

## 🎯 Rutas Protegidas

### Públicas:
- `/` - Redirecciona al formulario
- `/formulario-inscripcion` - Acceso público
- `/login` - Página de login

### Protegidas (requiere autenticación):
- `/dashboard` - Dashboard general (estudiante y admin)
- `/admin` - Panel de administración (solo admin)

## 📂 Estructura de Archivos

```
src/
├── auth.ts                    # Configuración principal de NextAuth
├── auth.config.ts             # Config de autenticación y callbacks
├── middleware.ts              # Middleware para proteger rutas
├── lib/
│   └── supabase.ts           # Cliente de Supabase
├── types/
│   └── next-auth.d.ts        # Tipos TypeScript para NextAuth
└── app/
    ├── api/auth/[...nextauth]/route.ts
    ├── login/page.tsx        # Página de login
    ├── dashboard/page.tsx    # Dashboard general
    └── admin/page.tsx        # Panel de admin
```

## 🔧 Personalización

### Agregar más campos al usuario

1. Modifica la tabla `users` en Supabase
2. Actualiza los tipos en `src/types/next-auth.d.ts`
3. Actualiza los callbacks en `src/auth.ts`

### Cambiar tiempo de sesión

En `src/auth.ts`:
```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 días (modifica aquí)
}
```

### Agregar más roles

1. Modifica el enum en Supabase:
```sql
ALTER TYPE user_role ADD VALUE 'profesor';
```

2. Actualiza los tipos en `src/types/next-auth.d.ts`
3. Actualiza la lógica de autorización en `src/auth.config.ts`

## 🐛 Solución de Problemas

### Error: "Invalid credentials"
- Verifica que el usuario exista en Supabase
- Verifica que el hash de la contraseña sea correcto
- Revisa los logs de la consola

### Error: "NEXTAUTH_URL missing"
- Asegúrate de tener el archivo `.env.local` configurado
- Reinicia el servidor de desarrollo

### Error de conexión con Supabase
- Verifica las credenciales en `.env.local`
- Verifica que el proyecto de Supabase esté activo
- Revisa la configuración de RLS en Supabase

## 📚 Recursos

- [NextAuth Documentation](https://authjs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

## 🔄 Próximos Pasos

1. Implementar recuperación de contraseña
2. Agregar registro de usuarios desde admin
3. Implementar perfil de usuario
4. Agregar cambio de contraseña
5. Implementar gestión completa de usuarios en admin
