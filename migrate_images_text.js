const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE productos ALTER COLUMN imagen TYPE TEXT;
    `);
    console.log('Columna imagen actualizada a TEXT.');
  } catch (err) {
    console.error('Error actualizando columna imagen:', err);
  } finally {
    pool.end();
  }
}

migrate();
