// Script para generar hash de contraseña con bcrypt
// Uso: node scripts/hash-password.mjs "TuContraseña"

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Debes proporcionar una contraseña');
  console.log('Uso: node scripts/hash-password.mjs "TuContraseña"');
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('\n✅ Hash generado exitosamente:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(hash);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Query SQL para insertar usuario:');
console.log(`
INSERT INTO users (email, password_hash, nombre, apellidos, rol) 
VALUES (
  'usuario@ejemplo.com',
  '${hash}',
  'Nombre',
  'Apellidos',
  'estudiante'
);
`);
