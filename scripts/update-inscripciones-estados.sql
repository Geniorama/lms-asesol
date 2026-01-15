-- ========================================
-- Actualizar Estados de Inscripciones - LMS ASESOL
-- ========================================

-- PASO 1: Eliminar el constraint antiguo primero
ALTER TABLE inscripciones 
DROP CONSTRAINT IF EXISTS inscripciones_estado_check;

-- PASO 2: Actualizar TODOS los estados existentes a los nuevos valores
-- Mapeo de estados antiguos a nuevos:
-- pendiente -> interesada
-- en_revision -> verificada
-- aprobado -> participante
-- rechazado -> rechazada
-- completado -> participante

UPDATE inscripciones 
SET estado = CASE 
  WHEN estado = 'pendiente' THEN 'interesada'
  WHEN estado = 'en_revision' THEN 'verificada'
  WHEN estado = 'aprobado' THEN 'participante'
  WHEN estado = 'rechazado' THEN 'rechazada'
  WHEN estado = 'completado' THEN 'participante'
  ELSE 'interesada'  -- Por defecto, cualquier otro estado se convierte en interesada
END
WHERE estado NOT IN ('interesada', 'verificada', 'participante', 'lista_espera', 'rechazada');

-- PASO 3: Ahora sí, agregar el nuevo constraint
ALTER TABLE inscripciones 
ADD CONSTRAINT inscripciones_estado_check 
CHECK (estado IN ('interesada', 'verificada', 'participante', 'lista_espera', 'rechazada'));

-- PASO 4: Actualizar el valor por defecto
ALTER TABLE inscripciones 
ALTER COLUMN estado SET DEFAULT 'interesada';

-- Agregar columna para notas administrativas (opcional)
ALTER TABLE inscripciones 
ADD COLUMN IF NOT EXISTS notas_admin TEXT;

-- Agregar columna para guardar quién modificó el estado
ALTER TABLE inscripciones 
ADD COLUMN IF NOT EXISTS modificado_por UUID REFERENCES users(id);

-- Crear índice para búsqueda por modificador
CREATE INDEX IF NOT EXISTS idx_inscripciones_modificado_por ON inscripciones(modificado_por);

-- Verificación
SELECT 'Estados de inscripciones actualizados exitosamente!' as status;
