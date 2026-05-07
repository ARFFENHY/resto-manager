const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres.mjokebqkjxdvbtmgzyel:Arfeni090588@aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require"
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
