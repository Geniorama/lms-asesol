# 🛡️ Configuración de Google reCAPTCHA v2

Este documento explica cómo configurar Google reCAPTCHA v2 para el formulario de inscripción.

## 📋 Paso 1: Obtener las Claves de reCAPTCHA

### 1.1 Acceder a la Consola de reCAPTCHA

1. Ve a: [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el botón **"+"** o **"Registrar un sitio nuevo"**

### 1.2 Configurar el Sitio

Completa el formulario con la siguiente información:

**Etiqueta:**
```
LMS ASESOL - Formulario de Inscripción
```

**Tipo de reCAPTCHA:**
- ✅ Selecciona: **reCAPTCHA v2**
- ✅ Marca: **"Casilla de verificación No soy un robot"**

**Dominios:**

Para **desarrollo** (localhost):
```
localhost
127.0.0.1
```

Para **producción** (Netlify u otro):
```
lms-asesol.netlify.app
tu-dominio-personalizado.com
```

**⚠️ IMPORTANTE:** Puedes agregar múltiples dominios. Agrega tanto localhost como tu dominio de producción.

**Propietarios:**
- Deja tu email de Google o agrega otros emails que necesiten acceso

**Acepta los Términos del Servicio:**
- ✅ Marca la casilla de aceptación

**Haz clic en "Enviar"**

---

## 🔑 Paso 2: Copiar las Claves

Después de crear el sitio, verás dos claves:

### Site Key (Clave del Sitio)
```
Esta clave es PÚBLICA y se usa en el frontend
Ejemplo: 6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Secret Key (Clave Secreta)
```
Esta clave es PRIVADA y se usa en el backend
⚠️ NUNCA la expongas en el código del cliente
Ejemplo: 6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Desarrollo Local

Abre tu archivo `.env.local` y agrega **AMBAS** claves:

```env
# Google reCAPTCHA v2
# Site Key (pública, para el frontend)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu-site-key-aqui

# Secret Key (privada, para el backend)
RECAPTCHA_SECRET_KEY=tu-secret-key-aqui
```

**Ejemplo:**
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **IMPORTANTE:** La Secret Key NUNCA debe exponerse en el código del cliente. Solo se usa en el servidor.

### 3.2 Producción (Netlify)

1. Ve a tu proyecto en Netlify
2. **Site configuration** → **Environment variables**
3. Agrega **AMBAS** variables:
   - **Key:** `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - **Value:** Tu Site Key de reCAPTCHA
   
   - **Key:** `RECAPTCHA_SECRET_KEY`
   - **Value:** Tu Secret Key de reCAPTCHA
4. Guarda y redeploy

---

## 🚀 Paso 4: Reiniciar el Servidor

Para que los cambios surtan efecto:

```bash
# Detén el servidor (Ctrl + C)
# Luego reinicia:
npm run dev
```

---

## ✅ Paso 5: Probar reCAPTCHA

### En Desarrollo (localhost):

1. Ve a: `http://localhost:3000/formulario-inscripcion`
2. Completa el formulario hasta el último paso
3. Deberías ver la casilla **"No soy un robot"**
4. Márcala para verificar
5. El botón **"Enviar Inscripción"** se habilitará solo si:
   - Todos los campos están completos
   - reCAPTCHA está verificado ✅

### En Producción:

1. Ve a tu URL de Netlify
2. Repite el mismo proceso
3. Verifica que funcione correctamente

---

## 🔍 Solución de Problemas

### Error: "ERROR for site owner: Invalid domain for site key"

**Causa:** El dominio no está registrado en reCAPTCHA

**Solución:**
1. Ve a la [consola de reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Haz clic en el ícono de engranaje ⚙️ de tu sitio
3. En **"Dominios"**, agrega el dominio faltante
4. Guarda los cambios

### Error: "Missing required parameters: sitekey"

**Causa:** La variable de entorno no está configurada

**Solución:**
1. Verifica que `.env.local` tenga `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
2. Verifica que el valor no esté vacío
3. Reinicia el servidor: `npm run dev`

### reCAPTCHA no aparece

**Posibles causas y soluciones:**

1. **La clave está vacía:**
   - Verifica el `.env.local`
   - Asegúrate de haber copiado la Site Key correcta

2. **Error de red:**
   - Verifica tu conexión a internet
   - Revisa la consola del navegador (F12) por errores

3. **Bloqueador de anuncios:**
   - Algunos bloqueadores bloquean reCAPTCHA
   - Desactiva el bloqueador temporalmente

### El botón "Enviar" está deshabilitado

El botón se habilita solo cuando:
- ✅ Todos los campos obligatorios están completos
- ✅ reCAPTCHA está verificado
- ✅ No hay filtros que bloqueen la inscripción

---

## 📊 Monitorear reCAPTCHA

Puedes ver estadísticas de uso en:
[https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)

Selecciona tu sitio para ver:
- Número de verificaciones
- Intentos fallidos
- Tráfico sospechoso
- Y más...

---

## 🔐 Seguridad Implementada

### ✅ Validación Completa (Frontend + Backend)

La implementación actual incluye validación en ambos lados:

**Frontend:**
- Muestra el widget de reCAPTCHA
- Captura el token cuando el usuario verifica
- Deshabilita el botón hasta completar la verificación

**Backend:**
- API endpoint: `/api/inscripciones`
- Valida el token con Google usando la Secret Key
- Solo guarda los datos si la verificación es exitosa
- Protege contra bots y envíos automatizados

**Flujo completo:**
```typescript
1. Usuario completa el formulario
2. Usuario marca "No soy un robot"
3. Frontend obtiene el token
4. Usuario hace clic en "Enviar"
5. Frontend envía datos + token al API
6. Backend valida el token con Google
7. Si es válido → guarda en Supabase
8. Si es inválido → rechaza y muestra error
```

### 2. Protección de Claves

- ✅ **Site Key** → Segura para exponer (frontend)
- ❌ **Secret Key** → NUNCA en el código del cliente
- ❌ **Secret Key** → NUNCA en Git
- ✅ **Secret Key** → Solo en variables de entorno del servidor

### 3. Límites y Umbrales

En la consola de reCAPTCHA puedes:
- Ajustar la sensibilidad
- Configurar alertas
- Bloquear regiones específicas (opcional)

---

## 🎯 Resumen

✅ **Lo que se implementó:**
1. ✅ Instalado `react-google-recaptcha`
2. ✅ reCAPTCHA en el paso 6 del formulario
3. ✅ Validación en frontend (token requerido)
4. ✅ **API endpoint `/api/inscripciones`**
5. ✅ **Validación del token con Google (backend)**
6. ✅ **Guardado automático en Supabase**
7. ✅ Manejo de errores y estados de carga
8. ✅ Tabla `inscripciones` con todos los campos

✅ **Lo que debes hacer:**
1. Crear el sitio en Google reCAPTCHA
2. Copiar **AMBAS** claves (Site Key y Secret Key)
3. Agregarlas a `.env.local` y Netlify
4. **Ejecutar el SQL** `scripts/create-inscripciones-table.sql` en Supabase
5. Probar el formulario completo

✅ **Funcionalidades incluidas:**
- 🛡️ Protección contra bots
- 💾 Guardado automático en base de datos
- 🔍 Validación de duplicados (número de documento)
- 📊 Seguimiento de IP y User Agent
- ✅ Estados: pendiente, en_revision, aprobado, rechazado
- 🎯 Puntaje calculado automáticamente
- 📧 Respuestas con ID de inscripción

---

## 📚 Recursos

- [Documentación oficial de reCAPTCHA](https://developers.google.com/recaptcha/docs/display)
- [react-google-recaptcha en GitHub](https://github.com/dozoisch/react-google-recaptcha)
- [Mejores prácticas de reCAPTCHA](https://developers.google.com/recaptcha/docs/best-practices)

---

¿Necesitas ayuda? Revisa la consola del navegador (F12) para ver mensajes de error específicos.
