const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE mesas ADD COLUMN IF NOT EXISTS pos_x INTEGER DEFAULT 0;
      ALTER TABLE mesas ADD COLUMN IF NOT EXISTS pos_y INTEGER DEFAULT 0;
    `);
    console.log('Columnas pos_x y pos_y agregadas a la tabla mesas.');
  } catch (err) {
    console.error('Error migrando mesas:', err);
  } finally {
    pool.end();
  }
}

migrate();
