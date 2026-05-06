const { Pool } = require('pg');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function seed() {
  try {
    // 1. Run migrations
    const sql = fs.readFileSync('alter_auth.sql', 'utf8');
    await pool.query(sql);
    console.log('Migración completada');

    // 2. Set phone for restaurant
    await pool.query("UPDATE restaurantes SET telefono = '1234567890' WHERE id = 1");
    console.log('Teléfono agregado al restaurante');

    // 3. Create Admin User
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO usuarios (email, password, restaurante_id) 
      VALUES ('admin@restomanager.com', $1, 1)
      ON CONFLICT (email) DO UPDATE SET password = $1
    `, [hash]);
    console.log('Usuario admin creado: admin@restomanager.com / admin123');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

seed();
