const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres:Arfeni090588@db.mjokebqkjxdvbtmgzyel.supabase.co:5432/postgres?sslmode=require"
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa:', res.rows[0]);
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    await pool.end();
  }
}

test();
