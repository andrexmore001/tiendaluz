const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function initDb() {
  console.log('🚀 Iniciando configuración manual de Base de Datos (JS)...');

  try {
    // 1. Asegurar que el .env sea correcto
    const envPath = path.join(process.cwd(), '.env');
    const envContent = 'DATABASE_URL="file:./dev.db"';
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env configurado.');

    // 2. Intentar generar el cliente
    console.log('📦 Generando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 3. Empujar el esquema a la base de datos
    console.log('🛠️ Creando estructura de base de datos...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

    console.log('✨ Base de datos inicializada con éxito.');
  } catch (error) {
    console.error('❌ Error fatal en la inicialización:', error.message);
    process.exit(1);
  }
}

initDb();
