const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mozo_nombre VARCHAR(100);
    `);
    console.log('Columna mozo_nombre agregada a la tabla pedidos.');
  } catch (err) {
    console.error('Error migrando mozo:', err);
  } finally {
    pool.end();
  }
}

migrate();
