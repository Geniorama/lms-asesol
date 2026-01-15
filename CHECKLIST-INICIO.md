# ✅ Checklist de Inicio - LMS ASESOL

Usa este checklist para configurar el proyecto desde cero.

---

## 📋 Fase 1: Configuración Inicial

### 1.1 Clonar e Instalar

- [ ] Clonar el repositorio
- [ ] Abrir terminal en la carpeta del proyecto
- [ ] Ejecutar: `npm install`
- [ ] Esperar a que termine la instalación (~2 min)

---

## 📋 Fase 2: Configurar Supabase

### 2.1 Crear Proyecto

- [ ] Ir a [supabase.com](https://supabase.com)
- [ ] Hacer login o crear cuenta
- [ ] Click en "New Project"
- [ ] Completar:
  - Nombre del proyecto: `lms-asesol`
  - Database Password: (guárdala en lugar seguro)
  - Region: South America (o la más cercana)
- [ ] Click "Create new project"
- [ ] Esperar ~2 minutos a que se cree

### 2.2 Ejecutar SQL

- [ ] En tu proyecto de Supabase, buscar el ícono 🗒️ "SQL Editor" (barra lateral)
- [ ] Click en "New query"
- [ ] Abrir el archivo `scripts/init-supabase.sql` de tu proyecto
- [ ] Copiar TODO el contenido
- [ ] Pegarlo en el editor SQL de Supabase
- [ ] Click en "Run" (o presiona Ctrl+Enter)
- [ ] Verificar que aparezca: ✅ "Setup completado exitosamente!"

### 2.3 Obtener Credenciales

- [ ] En Supabase, ir a ⚙️ Settings (abajo a la izquierda)
- [ ] Click en "API" en el menú lateral
- [ ] Copiar y guardar estos 3 valores:

```
1. Project URL: https://xxxxx.supabase.co
2. anon public: eyJhbGci... (es largo)
3. service_role: eyJhbGci... (también es largo)
```

**IMPORTANTE:** No compartas el `service_role` key con nadie.

---

## 📋 Fase 3: Configurar Variables de Entorno

### 3.1 Crear Archivo .env.local

- [ ] En la raíz del proyecto, crear archivo `.env.local`
- [ ] Copiar el contenido de `env.template`
- [ ] Pegar en `.env.local`

### 3.2 Completar Variables

**NEXTAUTH_URL:**
- [ ] Dejar como está: `http://localhost:3000`

**NEXTAUTH_SECRET:**
- [ ] Abrir terminal
- [ ] Ejecutar: `openssl rand -base64 32`
  - Si no funciona, usar: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- [ ] Copiar el resultado
- [ ] Pegarlo en: `NEXTAUTH_SECRET=aqui-el-resultado`

**Variables de Supabase:**
- [ ] Pegar el `Project URL` en `NEXT_PUBLIC_SUPABASE_URL=`
- [ ] Pegar el `anon public` en `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- [ ] Pegar el `service_role` en `SUPABASE_SERVICE_ROLE_KEY=`

### 3.3 Verificar .env.local

Tu archivo `.env.local` debe verse así:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=abc123xyz789... (32 caracteres en base64)

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (token largo)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (token largo diferente)
```

- [ ] Verificar que NO haya espacios antes o después del `=`
- [ ] Verificar que NO haya comillas extras
- [ ] Guardar el archivo

---

## 📋 Fase 4: Iniciar el Proyecto

### 4.1 Levantar Servidor

- [ ] Abrir terminal en la carpeta del proyecto
- [ ] Ejecutar: `npm run dev`
- [ ] Esperar a que aparezca:
  ```
  ✓ Ready in Xs
  ○ Local: http://localhost:3000
  ```
- [ ] NO cerrar esta terminal

### 4.2 Verificar Funcionamiento

- [ ] Abrir navegador
- [ ] Ir a: `http://localhost:3000`
- [ ] Debería redirigir a: `http://localhost:3000/formulario-inscripcion`
- [ ] Si ves el formulario: ✅ ¡Funciona!

---

## 📋 Fase 5: Probar Login

### 5.1 Acceder a Login

- [ ] En el navegador, ir a: `http://localhost:3000/login`
- [ ] Deberías ver la página de login

### 5.2 Iniciar Sesión

- [ ] Email: `admin@asesol.com`
- [ ] Password: `Admin123!`
- [ ] Click en "Iniciar Sesión"
- [ ] Esperar redirección automática

### 5.3 Verificar Dashboard

- [ ] Deberías estar en: `http://localhost:3000/dashboard`
- [ ] Verifica que se vea:
  - ✅ Tu nombre: "Administrador Sistema"
  - ✅ Email: admin@asesol.com
  - ✅ Rol: Administrador
  - ✅ Botón "Panel de Administración"
  - ✅ Botón "Cerrar Sesión"

### 5.4 Verificar Panel Admin

- [ ] Click en "Panel de Administración"
- [ ] Deberías estar en: `http://localhost:3000/admin`
- [ ] Verifica que se vea:
  - ✅ Título: "Panel de Administración"
  - ✅ Estadísticas (aunque estén en 0)
  - ✅ Botones de gestión

---

## 📋 Fase 6: Pruebas de Seguridad

### 6.1 Probar Protección de Rutas

- [ ] Estando logueado, click en "Cerrar Sesión"
- [ ] Verifica que redirige a: `/login`
- [ ] Sin hacer login, intenta ir a: `http://localhost:3000/dashboard`
- [ ] Debería redirigirte automáticamente a `/login`
- [ ] Lo mismo para: `http://localhost:3000/admin`

### 6.2 Probar Login Fallido

- [ ] En `/login`, ingresar:
  - Email: `wrong@email.com`
  - Password: `wrongpass`
- [ ] Click en "Iniciar Sesión"
- [ ] Debería aparecer error: "Credenciales inválidas..."
- [ ] NO debería redirigir

---

## 📋 Fase 7: Cambiar Contraseña Admin (IMPORTANTE)

### 7.1 Generar Nueva Contraseña

- [ ] En terminal (nueva ventana, sin cerrar el servidor):
  ```bash
  node scripts/hash-password.mjs "TuNuevaContraseñaSegura123!"
  ```
- [ ] Copiar el hash generado

### 7.2 Actualizar en Supabase

- [ ] Ir a Supabase → Table Editor
- [ ] Seleccionar tabla `users`
- [ ] Buscar el registro de `admin@asesol.com`
- [ ] Click en editar (ícono de lápiz)
- [ ] Pegar el nuevo hash en el campo `password_hash`
- [ ] Guardar

### 7.3 Probar Nueva Contraseña

- [ ] Cerrar sesión en la app
- [ ] Intentar login con:
  - Email: `admin@asesol.com`
  - Password: `TuNuevaContraseñaSegura123!`
- [ ] Debería funcionar correctamente

---

## 📋 Fase 8: Verificación Final

### 8.1 Checklist de Funcionalidades

- [ ] ✅ Login funciona
- [ ] ✅ Dashboard se carga correctamente
- [ ] ✅ Panel admin es accesible
- [ ] ✅ Cerrar sesión funciona
- [ ] ✅ Rutas protegidas redirigen
- [ ] ✅ Formulario de inscripción es accesible sin login
- [ ] ✅ Auto-guardado en formulario funciona
- [ ] ✅ No hay errores en consola del navegador

### 8.2 Verificar Consola

- [ ] Abrir DevTools (F12)
- [ ] Ir a la pestaña "Console"
- [ ] NO debería haber errores rojos
- [ ] Warnings amarillos son normales (algunos)

### 8.3 Verificar Terminal

- [ ] Revisar la terminal donde corre `npm run dev`
- [ ] NO debería haber errores
- [ ] Es normal ver logs de requests

---

## 🎉 ¡Configuración Completada!

Si llegaste hasta aquí y todo está en ✅, entonces:

### ✨ Tu aplicación está lista para:
- ✅ Desarrollo local
- ✅ Recibir inscripciones
- ✅ Gestión de usuarios (próximamente)
- ✅ Deploy a producción (cuando estés listo)

---

## 📚 Próximos Pasos

### Para Desarrollo:
1. Leer: [`README-AUTH.md`](./README-AUTH.md) - Documentación técnica
2. Explorar: Código en `src/` para entender la estructura
3. Personalizar: Estilos, textos, colores según necesidad

### Para Producción:
1. Configurar dominio personalizado
2. Deploy a Vercel/Netlify
3. Configurar variables de entorno en producción
4. Habilitar HTTPS
5. Configurar backups en Supabase

### Para Usuarios:
1. Crear más usuarios admin (si es necesario)
2. Documentar procesos internos
3. Capacitar al equipo en el uso del sistema

---

## 🆘 ¿Tuviste Problemas?

Si algo no funcionó, revisa:

1. **[PASOS-CONFIGURACION.md](./PASOS-CONFIGURACION.md)** - Sección "¿Problemas?"
2. **Terminal del servidor** - Busca mensajes de error
3. **Consola del navegador** - Abre DevTools (F12)
4. **Variables de entorno** - Verifica `.env.local`
5. **Supabase** - Verifica que el proyecto esté activo

---

## 📊 Resumen de Credenciales

**Supabase:**
- URL: En tu dashboard de Supabase
- Database Password: La que elegiste al crear el proyecto

**Aplicación (por defecto):**
- Email: `admin@asesol.com`
- Password: `Admin123!` (¡cámbiala!)

**IMPORTANTE:** 
- ⚠️ Cambia la contraseña del admin
- 🔒 No compartas el `service_role` key
- 💾 Guarda tus credenciales en lugar seguro

---

**¡Felicitaciones! 🎉 El LMS ASESOL está listo para usar.**
