-- ========================================
-- Tabla de Inscripciones - LMS ASESOL
-- ========================================

-- Crear tabla de inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Datos de Identificación
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  tipo_documento VARCHAR(50) NOT NULL,
  numero_documento VARCHAR(50) NOT NULL UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  edad_calculada INTEGER,
  telefono_principal VARCHAR(20) NOT NULL,
  telefono_secundario VARCHAR(20),
  correo_electronico VARCHAR(255) NOT NULL,
  
  -- Ubicación Territorial
  direccion TEXT NOT NULL,
  barrio VARCHAR(255) NOT NULL,
  upz_upl VARCHAR(255) NOT NULL,
  reside_ciudad_bolivar BOOLEAN DEFAULT true,
  
  -- Línea de Formación
  linea_formacion VARCHAR(100) NOT NULL,
  
  -- Calculadora de Puntaje (JSON para flexibilidad)
  datos_calculadora JSONB,
  puntaje_total INTEGER DEFAULT 0,
  
  -- Perfil Sociolaboral
  nivel_educativo VARCHAR(100),
  situacion_laboral VARCHAR(100),
  es_jefa_hogar BOOLEAN DEFAULT false,
  tiene_hijos BOOLEAN DEFAULT false,
  
  -- Legal
  acepta_declaracion BOOLEAN DEFAULT false,
  acepta_autorizacion_datos BOOLEAN DEFAULT false,
  acepta_compromiso BOOLEAN DEFAULT false,
  
  -- URLs de archivos subidos (Cloudinary, S3, etc.)
  url_recibo_publico TEXT,
  url_certificado_adres TEXT,
  
  -- Metadata
  recaptcha_verificado BOOLEAN DEFAULT false,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamps
  fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Estado de la inscripción
  estado VARCHAR(50) DEFAULT 'interesada' CHECK (estado IN ('interesada', 'verificada', 'participante', 'lista_espera', 'rechazada')),
  
  -- Información administrativa
  notas_admin TEXT,
  modificado_por UUID REFERENCES users(id)
);

-- Crear índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_inscripciones_numero_documento ON inscripciones(numero_documento);
CREATE INDEX IF NOT EXISTS idx_inscripciones_correo ON inscripciones(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_inscripciones_linea_formacion ON inscripciones(linea_formacion);
CREATE INDEX IF NOT EXISTS idx_inscripciones_estado ON inscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_inscripciones_fecha ON inscripciones(fecha_inscripcion);
CREATE INDEX IF NOT EXISTS idx_inscripciones_puntaje ON inscripciones(puntaje_total DESC);
CREATE INDEX IF NOT EXISTS idx_inscripciones_modificado_por ON inscripciones(modificado_por);

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_inscripciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inscripciones_timestamp ON inscripciones;
CREATE TRIGGER update_inscripciones_timestamp
  BEFORE UPDATE ON inscripciones
  FOR EACH ROW
  EXECUTE FUNCTION update_inscripciones_updated_at();

-- Habilitar Row Level Security
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Política: Admins pueden ver todas las inscripciones
CREATE POLICY "Admins can view all inscripciones" ON inscripciones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol = 'admin'
      AND activo = true
    )
  );

-- Política: Admins pueden actualizar inscripciones
CREATE POLICY "Admins can update inscripciones" ON inscripciones
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol = 'admin'
      AND activo = true
    )
  );

-- Política: Permitir inserción pública (desde el formulario)
-- Nota: En producción, podrías querer más restricciones
CREATE POLICY "Public can insert inscripciones" ON inscripciones
  FOR INSERT
  WITH CHECK (true);

-- Verificación
SELECT 'Tabla de inscripciones creada exitosamente!' as status;
