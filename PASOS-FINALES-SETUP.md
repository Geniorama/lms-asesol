# ⚡ Pasos Finales para Completar el Setup

## 📋 Checklist Rápido

### 1. Configurar Google reCAPTCHA ⏱️ 3 minutos

1. Ve a: https://www.google.com/recaptcha/admin
2. Crea un nuevo sitio:
   - **Tipo:** reCAPTCHA v2 → "Casilla No soy un robot"
   - **Dominios:** 
     - `localhost` (desarrollo)
     - `lms-asesol.netlify.app` (producción)
3. Copia las dos claves que te da:
   - Site Key (pública)
   - Secret Key (privada)

### 2. Actualizar Variables de Entorno ⏱️ 2 minutos

**En `.env.local` (desarrollo):**

```env
# Agrega estas dos líneas:
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu-site-key-aqui
RECAPTCHA_SECRET_KEY=tu-secret-key-aqui
```

**En Netlify (producción):**

1. Site configuration → Environment variables
2. Agrega:
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` = tu Site Key
   - `RECAPTCHA_SECRET_KEY` = tu Secret Key
3. Redeploy el sitio

### 3. Crear Tabla en Supabase ⏱️ 1 minuto

1. Abre Supabase → SQL Editor
2. Abre el archivo: `scripts/create-inscripciones-table.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Click en "Run"
6. Deberías ver: "✅ Tabla de inscripciones creada exitosamente!"

### 4. Reiniciar el Servidor ⏱️ 30 segundos

```bash
# Detén el servidor (Ctrl + C)
# Reinicia:
npm run dev
```

### 5. Probar el Formulario ⏱️ 2 minutos

1. Ve a: `http://localhost:3000/formulario-inscripcion`
2. Completa todos los pasos
3. En el último paso, verifica que veas:
   - ✅ La casilla "No soy un robot"
4. Márcala y envía el formulario
5. Deberías ver:
   - ✅ "¡Inscripción enviada exitosamente!"
   - ✅ Un ID de inscripción
6. Verifica en Supabase → Table Editor → `inscripciones`
   - Debería aparecer tu registro

---

## 🔍 Verificar que Todo Funcione

### Checklist de Pruebas:

- [ ] reCAPTCHA aparece en el último paso
- [ ] El botón "Enviar" está deshabilitado hasta marcar reCAPTCHA
- [ ] Al enviar, muestra mensaje "Enviando..."
- [ ] Aparece alerta de éxito con ID de inscripción
- [ ] Los datos aparecen en Supabase (tabla `inscripciones`)
- [ ] Si intentas enviar el mismo número de documento dos veces, muestra error de duplicado
- [ ] En Netlify, el formulario también funciona correctamente

---

## ❌ Si Algo Falla

### Error: "Invalid domain for site key"
- Ve a reCAPTCHA admin → Settings
- Agrega el dominio faltante
- Espera 1-2 minutos

### Error: "Missing required parameters: sitekey"
- Verifica que `.env.local` tenga `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Reinicia el servidor: `npm run dev`

### Error: "reCAPTCHA verification failed"
- Verifica que `.env.local` tenga `RECAPTCHA_SECRET_KEY`
- Asegúrate de que sea la Secret Key correcta (no la Site Key)

### Error al guardar en Supabase
- Ejecuta `scripts/create-inscripciones-table.sql` en Supabase
- Verifica que la tabla `inscripciones` exista
- Revisa los logs de la consola del navegador (F12)

### El formulario se envía pero no aparece en Supabase
- Abre la consola del navegador (F12)
- Busca errores en color rojo
- Verifica que las variables de entorno estén configuradas
- Revisa los logs del servidor (terminal donde corre `npm run dev`)

---

## 📊 Ver las Inscripciones

### En Supabase:

1. Ve a tu proyecto de Supabase
2. Click en "Table Editor" (icono de tabla)
3. Selecciona la tabla `inscripciones`
4. Verás todos los registros con:
   - Datos del estudiante
   - Puntaje calculado
   - Estado (pendiente/aprobado/etc.)
   - Fecha de inscripción
   - IP y User Agent

### Próximamente (Panel Admin):

Implementaremos un panel en `/admin` donde podrás:
- Ver todas las inscripciones
- Filtrar por línea de formación
- Ordenar por puntaje
- Aprobar/rechazar inscripciones
- Exportar a Excel/CSV

---

## 🎯 ¿Todo Listo?

Si completaste todos los pasos y las pruebas funcionan, ¡felicidades! 🎉

**Tu sistema ahora:**
- ✅ Acepta inscripciones
- ✅ Está protegido contra bots
- ✅ Guarda los datos en Supabase
- ✅ Valida duplicados
- ✅ Calcula puntajes automáticamente

**Próximos pasos recomendados:**
1. Personalizar el mensaje de éxito
2. Implementar envío de email de confirmación
3. Crear el panel de admin para gestionar inscripciones
4. Agregar exportación de datos a Excel

---

## 📚 Documentación Relacionada

- [`CONFIGURACION-RECAPTCHA.md`](./CONFIGURACION-RECAPTCHA.md) - Guía detallada de reCAPTCHA
- [`README.md`](./README.md) - Documentación general del proyecto
- [`PASOS-CONFIGURACION.md`](./PASOS-CONFIGURACION.md) - Setup inicial

---

**Tiempo total estimado:** ~10 minutos ⏱️

¿Necesitas ayuda? Revisa la sección de errores comunes arriba. 👆
