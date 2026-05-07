const { Pool } = require('pg');
const dbUrl = "postgresql://postgres:Arfeni090588@db.mjokebqkjxdvbtmgzyel.supabase.co:5432/postgres";
const pool = new Pool({ connectionString: dbUrl });

async function check() {
  try {
    console.log('--- DIAGNÓSTICO DE BASE DE DATOS (SUPABASE) ---');
    
    // Check restaurantes
    const rest = await pool.query('SELECT * FROM restaurantes');
    console.log('Restaurantes encontrados:', rest.rows);

    if (rest.rows.length === 0) {
      console.log('❌ ERROR: No hay restaurantes en la base de datos.');
    } else {
      const rid = rest.rows[0].id;
      // Check usuarios
      const user = await pool.query('SELECT id, email, restaurante_id FROM usuarios');
      console.log('Usuarios encontrados:', user.rows);
      
      const admin = user.rows.find(u => u.email === 'admin@restomanager.com');
      if (!admin) {
        console.log('❌ ERROR: El usuario admin@restomanager.com no existe.');
      } else if (admin.restaurante_id !== rid) {
        console.log(`❌ ERROR: El usuario tiene restaurante_id ${admin.restaurante_id} pero el restaurante es ${rid}.`);
      } else {
        console.log('✅ TODO OK: El usuario y el restaurante están vinculados correctamente.');
      }
    }

    // Check productos
    const prod = await pool.query('SELECT COUNT(*) FROM productos');
    console.log('Total productos:', prod.rows[0].count);

  } catch (err) {
    console.error('❌ ERROR DE CONEXIÓN:', err.message);
  } finally {
    await pool.end();
  }
}

check();
