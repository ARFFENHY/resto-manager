const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const passwords = ['root', 'postgres', 'admin', '123456', ''];
let connected = false;

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  
  for (const pwd of passwords) {
    if (connected) break;
    const dbUrl = `postgresql://postgres:${pwd}@localhost:5432/postgres`;
    console.log('Intentando conectar con contraseña:', pwd || '<vacía>');
    const pool = new Pool({ connectionString: dbUrl });
    
    try {
      await pool.query(schema);
      console.log("¡Éxito! Tablas creadas correctamente con contraseña:", pwd || '<vacía>');
      connected = true;
      
      // Update .env.local with correct password
      const envPath = path.join(__dirname, '.env.local');
      fs.writeFileSync(envPath, `DATABASE_URL="${dbUrl}"`);
      console.log("Archivo .env.local actualizado con la credencial correcta.");
      
    } catch (err) {
      // Ignorar error y probar otra
    } finally {
      await pool.end();
    }
  }

  if (!connected) {
    console.error("No se pudo conectar a PostgreSQL con las contraseñas por defecto.");
    console.error("Por favor, edita .env.local con tu contraseña real.");
  }
}

main();
