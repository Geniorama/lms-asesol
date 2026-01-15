# Instrucciones para Actualizar Estados de Inscripciones

## 🔄 Actualización Requerida en Supabase

Para habilitar la gestión de estados por parte del administrador, necesitas ejecutar el siguiente script SQL en tu base de datos de Supabase.

---

## 📋 Pasos:

### 1. Accede a Supabase Dashboard
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Ve a la sección **SQL Editor**

### 2. Ejecuta el Script
   - Copia y pega el contenido del archivo `scripts/update-inscripciones-estados.sql`
   - Haz clic en **Run** para ejecutar

### 3. Verifica los Cambios
   - Ve a **Table Editor** > `inscripciones`
   - Verifica que la columna `estado` ahora acepta los nuevos valores:
     - `interesada` (valor por defecto)
     - `verificada`
     - `participante`
     - `lista_espera`
     - `rechazada`
   - Verifica que existen las nuevas columnas:
     - `notas_admin` (TEXT)
     - `modificado_por` (UUID)

---

## 🎯 Estados y su Significado:

| Estado | Descripción | Color en UI |
|--------|-------------|-------------|
| **INTERESADA** | Completó el formulario exitosamente (estado inicial automático) | Azul |
| **VERIFICADA** | Documentos revisados y validados por el equipo humano | Morado |
| **PARTICIPANTE** | Seleccionada dentro de los cupos disponibles | Verde |
| **LISTA DE ESPERA** | Verificada pero no alcanzó cupo | Amarillo |
| **RECHAZADA** | No cumplió requisitos o documentos falsos | Rojo |

---

## ✅ Nueva Funcionalidad Implementada:

### En el Panel de Administración:

1. **Filtro por Estado:**
   - Filtra inscripciones por cualquier estado
   - Ver todas o solo un estado específico

2. **Cambio de Estado:**
   - Haz clic en "Ver detalles" de cualquier inscripción
   - Clic en el botón "Cambiar" junto al estado actual
   - Selecciona el nuevo estado del dropdown
   - Agrega notas administrativas (opcional)
   - Guarda los cambios

3. **Notas Administrativas:**
   - Campo de texto para agregar observaciones
   - Se guarda junto con el cambio de estado
   - Visible solo para administradores

4. **Visualización:**
   - Badges de colores según el estado
   - Fechas de inscripción y actualización
   - Historial en notas administrativas

---

## 🔒 Seguridad:

- Solo usuarios con rol `admin` pueden:
  - Ver las inscripciones
  - Cambiar estados
  - Agregar notas administrativas

- La API valida la autenticación y autorización en cada petición

---

## 📝 Notas:

- Las inscripciones existentes con estado `pendiente` se actualizan automáticamente a `interesada`
- El campo `modificado_por` se puede usar en el futuro para auditoría
- El campo `fecha_actualizacion` se actualiza automáticamente con cada cambio

---

## 🚀 Próximos Pasos:

1. Ejecuta el script SQL en Supabase
2. Reinicia el servidor de desarrollo (si está corriendo)
3. Accede al panel de admin
4. Prueba cambiar el estado de alguna inscripción

---

¿Necesitas ayuda? Revisa la consola del navegador y los logs del servidor para cualquier error.
