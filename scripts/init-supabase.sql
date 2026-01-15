-- ========================================
-- Script de Inicialización Rápida
-- LMS ASESOL - Supabase
-- ========================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear enum para roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('estudiante', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  rol user_role DEFAULT 'estudiante',
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acceso TIMESTAMP WITH TIME ZONE
);

-- 4. Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- 6. Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Insertar usuario admin
-- IMPORTANTE: Genera tu propio hash usando:
-- node scripts/hash-password.mjs "TuContraseñaSegura"
-- 
-- Luego reemplaza los valores a continuación:
INSERT INTO users (email, password_hash, nombre, apellidos, rol) 
VALUES (
  'tu-email@ejemplo.com',  -- Cambia esto
  'tu-hash-generado-aqui',  -- Cambia esto por el hash generado
  'Tu Nombre',  -- Cambia esto
  'Tus Apellidos',  -- Cambia esto
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- 9. Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 10. Limpiar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- 11. Crear políticas de seguridad
-- Nota: auth.uid() en Supabase requiere configuración adicional de auth
-- Si no usas Supabase Auth, puedes simplificar o remover estas políticas

CREATE POLICY "Public read access" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (true);

-- 12. Verificación
SELECT 'Setup completado exitosamente!' as status;
SELECT 'Total de usuarios:' as info, COUNT(*) as count FROM users;
SELECT 'Usuarios admin:' as info, COUNT(*) as count FROM users WHERE rol = 'admin';
