const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mesas (
        id SERIAL PRIMARY KEY,
        restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE,
        numero_o_nombre VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla mesas creada o ya existente.');
  } catch (err) {
    console.error('Error creando tabla mesas:', err);
  } finally {
    pool.end();
  }
}

migrate();
