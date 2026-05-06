const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const envPath = path.join(__dirname, '.env.local');
  let dbUrl = '';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL="([^"]+)"/);
    if (match) dbUrl = match[1];
  }

  const pool = new Pool({ connectionString: dbUrl });
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'alter_schema.sql'), 'utf-8');
    await pool.query(schema);
    console.log("Migración aplicada exitosamente.");
  } catch (err) {
    console.error("Error en migración:", err.message);
  } finally {
    await pool.end();
  }
}

main();
