# 🎓 LMS ASESOL

Sistema de Gestión de Aprendizaje (Learning Management System) para programas de formación y capacitación en la localidad de Ciudad Bolívar.

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar el repositorio
git clone [tu-repo]
cd lms-asesol

# Instalar dependencias
npm install
```

### 2. Configuración (5 minutos)

**📖 Lee la guía completa:** [`PASOS-CONFIGURACION.md`](./PASOS-CONFIGURACION.md)

**Resumen rápido:**

1. **Configura Supabase:**
   - Crea un proyecto en [supabase.com](https://supabase.com)
   - Ejecuta el SQL de `scripts/init-supabase.sql`
   - Copia tus credenciales

2. **Configura Google reCAPTCHA:**
   - Ve a [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
   - Crea un sitio reCAPTCHA v2 (checkbox)
   - Copia la Site Key
   - **📖 Guía detallada:** [`CONFIGURACION-RECAPTCHA.md`](./CONFIGURACION-RECAPTCHA.md)

3. **Configura variables de entorno:**
   ```bash
   cp env.template .env.local
   # O en Windows: copy env.template .env.local
   # Edita .env.local con tus credenciales
   ```

4. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

5. **Accede a la aplicación:**
   - Abrir: `http://localhost:3000`
   - Usa las credenciales que configuraste en Supabase

## 📚 Documentación

- **[PASOS-CONFIGURACION.md](./PASOS-CONFIGURACION.md)** - ⚡ Guía rápida (5 minutos)
- **[CONFIGURACION-RECAPTCHA.md](./CONFIGURACION-RECAPTCHA.md)** - 🛡️ Configurar reCAPTCHA v2
- **[SETUP_AUTH.md](./SETUP_AUTH.md)** - 🔧 Configuración de autenticación
- **[README-AUTH.md](./README-AUTH.md)** - 📖 Documentación técnica de auth
- **[RESUMEN-IMPLEMENTACION.md](./RESUMEN-IMPLEMENTACION.md)** - ✅ Resumen de implementación

## ✨ Características

### ✅ Implementado

- 🔐 **Autenticación completa** con NextAuth y Supabase
- 👥 **Sistema de roles:** Estudiante y Administrador
- 📝 **Formulario de inscripción** multi-paso con validación
- 🛡️ **Google reCAPTCHA v2** para protección contra bots
- 💾 **Auto-guardado** de progreso en localStorage
- 📱 **Diseño responsive** y moderno
- 🛡️ **Protección de rutas** con middleware
- 🎨 **UI/UX moderna** con Tailwind CSS

### 🎯 Rutas

#### Públicas
- `/` - Redirige al formulario de inscripción
- `/formulario-inscripcion` - Formulario de inscripción público
- `/login` - Página de inicio de sesión

#### Protegidas (requiere autenticación)
- `/dashboard` - Dashboard general (estudiantes y admins)
- `/admin` - Panel de administración (solo admins)

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Autenticación:** NextAuth v5
- **Base de Datos:** Supabase (PostgreSQL)
- **Estilos:** Tailwind CSS
- **Forms:** React Hook Form
- **Validación:** Zod
- **Lenguaje:** TypeScript

## 📁 Estructura del Proyecto

```
lms-asesol/
├── src/
│   ├── app/                      # Páginas y rutas
│   │   ├── api/auth/            # API de autenticación
│   │   ├── login/               # Página de login
│   │   ├── dashboard/           # Dashboard
│   │   ├── admin/               # Panel admin
│   │   └── formulario-inscripcion/
│   ├── components/              # Componentes reutilizables
│   │   ├── SessionProvider.tsx
│   │   ├── UserInfo.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── FileUpload.tsx
│   ├── hooks/                   # Custom hooks
│   │   └── useAuth.ts
│   ├── lib/                     # Utilidades
│   │   └── supabase.ts
│   ├── types/                   # Tipos TypeScript
│   │   ├── index.ts
│   │   └── next-auth.d.ts
│   ├── views/                   # Vistas complejas
│   │   └── FormularioInscripcionView.tsx
│   ├── auth.ts                  # Configuración NextAuth
│   ├── auth.config.ts           # Opciones de auth
│   └── middleware.ts            # Middleware de rutas
├── scripts/
│   ├── init-supabase.sql        # SQL de inicialización
│   └── hash-password.js         # Generador de hashes
├── .env.example                 # Ejemplo de variables de entorno
└── package.json
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Tokens JWT seguros
- ✅ Variables de entorno para secretos
- ✅ Row Level Security (RLS) en Supabase
- ✅ Validación de entrada
- ✅ Protección CSRF
- ✅ Middleware de autorización

## 🧪 Desarrollo

```bash
# Modo desarrollo
npm run dev

# Lint
npm run lint

# Build
npm run build

# Producción
npm start
```

### Scripts Útiles

```bash
# Generar hash de contraseña
node scripts/hash-password.mjs "MiContraseña123"

# Verificar linter
npm run lint
```

## 👥 Roles y Permisos

### Estudiante
- ✅ Acceso al dashboard
- ✅ Ver su información
- ✅ Completar formulario de inscripción
- ❌ No accede al panel admin

### Administrador
- ✅ Todo lo del estudiante
- ✅ Acceso al panel de administración
- ✅ Ver inscripciones
- ✅ Gestionar usuarios (próximamente)
- ✅ Ver reportes y estadísticas (próximamente)

## 📊 Estado del Proyecto

### Fase 1: Autenticación y Formularios ✅ COMPLETADO
- [x] Sistema de autenticación
- [x] Roles de usuario
- [x] Formulario de inscripción
- [x] Dashboard básico
- [x] Panel admin básico

### Fase 2: Gestión de Usuarios 🚧 PRÓXIMAMENTE
- [ ] CRUD de usuarios desde admin
- [ ] Búsqueda y filtros
- [ ] Exportar a CSV/Excel
- [ ] Editar perfil propio
- [ ] Cambiar contraseña

### Fase 3: Cursos y Contenido 📋 PLANIFICADO
- [ ] Gestión de cursos
- [ ] Inscripción a cursos
- [ ] Contenido multimedia
- [ ] Seguimiento de progreso
- [ ] Certificados

### Fase 4: Comunicación 📋 PLANIFICADO
- [ ] Sistema de notificaciones
- [ ] Mensajería interna
- [ ] Anuncios
- [ ] Calendario de eventos

## 🐛 Solución de Problemas

### Error: "Invalid credentials"
- Verifica que ejecutaste el SQL en Supabase
- Usa las credenciales que configuraste en el SQL
- Revisa la consola del navegador

### Error: "Cannot connect to Supabase"
- Verifica las URLs en `.env.local`
- Asegúrate que el proyecto Supabase esté activo
- Verifica las API keys

### Error: "NEXTAUTH_SECRET missing"
- Verifica que `.env.local` existe
- Genera un secret: `openssl rand -base64 32`
- Reinicia el servidor

**Más ayuda:** Ver [`PASOS-CONFIGURACION.md`](./PASOS-CONFIGURACION.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y está destinado para uso exclusivo de ASESOL.

## 📞 Contacto

- **Proyecto:** LMS ASESOL
- **Organización:** ASESOL - Ciudad Bolívar

---

**⭐ ¡Gracias por usar LMS ASESOL!**

Para empezar, lee [`PASOS-CONFIGURACION.md`](./PASOS-CONFIGURACION.md)
