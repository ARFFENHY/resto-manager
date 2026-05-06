const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function cleanup() {
  try {
    // Remove leading / from http links
    await pool.query("UPDATE productos SET imagen = SUBSTRING(imagen FROM 2) WHERE imagen LIKE '/http%'");
    // Remove extra leading / from protocol-relative or double-slashed links
    await pool.query("UPDATE productos SET imagen = SUBSTRING(imagen FROM 2) WHERE imagen LIKE '//%'");
    console.log('Limpieza de base de datos terminada.');
  } catch (err) {
    console.error('Error limpiando DB:', err);
  } finally {
    pool.end();
  }
}

cleanup();
