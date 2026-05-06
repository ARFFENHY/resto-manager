const fetch = require('node-fetch'); // wait, native fetch is in node 18+
async function test() {
  try {
    // Let's use the DB pool to check what the API might be failing on
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });
    
    // In API:
    // const res = await query('UPDATE pedidos SET estado = $1 WHERE id = $2 AND restaurante_id = $3 RETURNING id, estado', [estado, parseInt(idParam), session.restauranteId]);
    // Assume id = 1, estado = 'preparando', restaurante_id = 1
    
    const res = await pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2 AND restaurante_id = $3 RETURNING id, estado', ['preparando', 1, 1]);
    console.log('Update result:', res.rowCount > 0 ? res.rows[0] : 'No rows updated');
    
    pool.end();
  } catch (e) {
    console.error(e);
  }
}
test();
