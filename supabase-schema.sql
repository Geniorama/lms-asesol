-- Esquema de base de datos para el LMS con autenticación
-- Ejecuta este SQL en tu proyecto de Supabase

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para roles de usuario
CREATE TYPE user_role AS ENUM ('estudiante', 'admin');

-- Tabla de usuarios
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

-- Tabla de sesiones (opcional, para seguimiento)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario admin (genera tu propio hash primero)
-- Usa: node scripts/hash-password.mjs "TuContraseñaSegura"
INSERT INTO users (email, password_hash, nombre, apellidos, rol) 
VALUES (
  'tu-email@ejemplo.com',  -- Reemplaza con tu email
  'tu-hash-generado-aqui',  -- Reemplaza con el hash que generaste
  'Tu Nombre',  -- Reemplaza con tu nombre
  'Tus Apellidos',  -- Reemplaza con tus apellidos
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- RLS (Row Level Security) - Opcional pero recomendado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propia información
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Los admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Política: Los usuarios pueden actualizar su propia información
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Política: Los admins pueden actualizar cualquier usuario
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin'
    )
  );
