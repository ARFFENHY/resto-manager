const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });
pool.query("UPDATE pedidos SET estado = 'pendiente'")
  .then(() => { console.log('Reset'); pool.end(); })
  .catch(console.error);
