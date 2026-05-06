const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cajas (
        id SERIAL PRIMARY KEY,
        restaurante_id INTEGER REFERENCES restaurantes(id),
        monto_apertura DECIMAL(10,2) NOT NULL,
        monto_cierre DECIMAL(10,2),
        fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre TIMESTAMP,
        estado VARCHAR(20) DEFAULT 'abierta' -- 'abierta', 'cerrada'
      );

      ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS caja_id INTEGER REFERENCES cajas(id);
    `);
    console.log('Tabla cajas creada y pedidos vinculados.');
  } catch (err) {
    console.error('Error migrando cajas:', err);
  } finally {
    pool.end();
  }
}

migrate();
