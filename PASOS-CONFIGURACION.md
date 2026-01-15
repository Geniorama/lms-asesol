# 🚀 Pasos de Configuración Rápida - LMS ASESOL

## ⚡ Configuración en 5 minutos

### Paso 1: Configurar Supabase (3 minutos)

1. **Ve a [supabase.com](https://supabase.com)**
   - Crea una cuenta (si no tienes)
   - Crea un nuevo proyecto
   - Espera a que se inicialice (~2 minutos)

2. **Ejecuta el SQL de inicialización:**
   - Ve a tu proyecto → Icono SQL Editor (lado izquierdo)
   - Copia TODO el contenido de `scripts/init-supabase.sql`
   - Pégalo en el editor y haz clic en "Run"
   - ✅ Deberías ver "Setup completado exitosamente!"

3. **Obtén tus credenciales:**
   - Ve a Settings → API
   - Copia estos 3 valores:
     ```
     Project URL: https://xxxxx.supabase.co
     anon public key: eyJhbGci...
     service_role key: eyJhbGci... (¡mantén esto en secreto!)
     ```

### Paso 2: Configurar Variables de Entorno (1 minuto)

1. **Crea el archivo `.env.local` en la raíz del proyecto:**

```bash
# Copia el archivo de ejemplo
cp env.template .env.local

# O en Windows PowerShell:
copy env.template .env.local
```

2. **Edita `.env.local` con tus valores:**

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-esto-abajo

# Supabase (pega lo que copiaste arriba)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

3. **Genera tu NEXTAUTH_SECRET:**

```bash
# En Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# O en terminal bash/Linux/Mac:
openssl rand -base64 32
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET=`

### Paso 3: Iniciar el Proyecto (1 minuto)

```bash
# Si no has instalado dependencias:
npm install

# Inicia el servidor de desarrollo:
npm run dev
```

### Paso 4: ¡Prueba el Login! 🎉

1. Abre tu navegador en: `http://localhost:3000/login`

2. **Credenciales por defecto:**
   ```
   Email: admin@asesol.com
   Password: Admin123!
   ```

3. **¡Ya está!** Deberías ver el dashboard.

---

## 🔐 IMPORTANTE: Cambia la Contraseña del Admin

**Opción 1: Desde Supabase (Recomendado)**

1. Genera un nuevo hash:
   ```bash
   node scripts/hash-password.mjs "TuNuevaContraseñaSegura123!"
   ```

2. Ve a Supabase → Table Editor → `users`
3. Busca `admin@asesol.com`
4. Edita el campo `password_hash` con el nuevo hash
5. Guarda

**Opción 2: Crear un endpoint para cambiar contraseña**
(Lo implementaremos después)

---

## 📁 Estructura del Proyecto

```
lms-asesol/
├── .env.local              ← TUS SECRETOS (no compartir)
├── .env.example            ← Plantilla
├── scripts/
│   ├── init-supabase.sql  ← SQL para Supabase
│   └── hash-password.js   ← Genera hashes
├── src/
│   ├── auth.ts            ← Configuración NextAuth
│   ├── middleware.ts      ← Protege rutas
│   ├── lib/
│   │   └── supabase.ts   ← Cliente Supabase
│   ├── app/
│   │   ├── login/        ← Página de login
│   │   ├── dashboard/    ← Dashboard general
│   │   └── admin/        ← Panel admin
│   └── components/
│       └── SessionProvider.tsx
```

---

## ✅ Checklist de Verificación

- [ ] Proyecto de Supabase creado
- [ ] SQL ejecutado en Supabase
- [ ] `.env.local` creado y configurado
- [ ] `npm install` completado
- [ ] `npm run dev` funcionando
- [ ] Login exitoso con admin@asesol.com
- [ ] Puedes ver el dashboard
- [ ] Puedes acceder al panel admin

---

## 🐛 ¿Problemas?

### "Invalid credentials"
- ✅ Verifica que el SQL se ejecutó correctamente
- ✅ Revisa que las credenciales sean correctas
- ✅ Mira la consola del navegador por errores

### "Cannot connect to Supabase"
- ✅ Verifica las URLs en `.env.local`
- ✅ Asegúrate de que el proyecto Supabase esté activo
- ✅ Revisa que copiaste las keys completas

### "NEXTAUTH_SECRET missing"
- ✅ Verifica que `.env.local` existe
- ✅ Verifica que generaste el NEXTAUTH_SECRET
- ✅ Reinicia el servidor (`npm run dev`)

### Página en blanco
- ✅ Abre la consola del navegador (F12)
- ✅ Revisa errores en la terminal donde corre `npm run dev`
- ✅ Verifica que todos los archivos se guardaron

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Cambiar contraseña del admin** ⚠️
2. **Crear más usuarios** (desde el panel admin)
3. **Personalizar el dashboard**
4. **Implementar gestión de cursos**
5. **Conectar el formulario de inscripción con la base de datos**

---

## 📚 Documentación Completa

- Ver `README-AUTH.md` para documentación detallada
- Ver `SETUP_AUTH.md` para guía completa de configuración

---

## 💬 ¿Necesitas Ayuda?

Si algo no funciona, revisa:
1. La consola del navegador (F12 → Console)
2. La terminal donde corre `npm run dev`
3. Los logs de Supabase (en el dashboard)

¡Listo! 🚀
