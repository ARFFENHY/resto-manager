const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Forzar ignorar certificados no autorizados para la migración
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dbUrl = "postgresql://postgres:Arfeni090588@db.mjokebqkjxdvbtmgzyel.supabase.co:5432/postgres?sslmode=require";
const pool = new Pool({ 
  connectionString: dbUrl,
  ssl: true // Activamos SSL
});

async function run() {
  try {
    console.log('--- RECONSTRUYENDO BASE DE DATOS EN SUPABASE (FORCE SSL) ---');

    // 0. Limpieza total
    console.log('0. Limpiando tablas existentes...');
    await pool.query(`
      DROP TABLE IF EXISTS pedido_items CASCADE;
      DROP TABLE IF EXISTS pedidos CASCADE;
      DROP TABLE IF EXISTS productos CASCADE;
      DROP TABLE IF EXISTS usuarios CASCADE;
      DROP TABLE IF EXISTS cajas CASCADE;
      DROP TABLE IF EXISTS restaurantes CASCADE;
    `);
    console.log('   OK: Base de datos limpia.');

    const executeFile = async (filename) => {
      console.log(`Ejecutando ${filename}...`);
      const sql = fs.readFileSync(path.join(__dirname, filename), 'utf-8');
      await pool.query(sql);
      console.log(`   OK: ${filename} aplicado.`);
    };

    // 1. Ejecutar archivos SQL en orden
    await executeFile('schema.sql');
    await executeFile('alter_schema.sql');
    await executeFile('alter_auth.sql');

    // 2. Ejecutar migraciones manuales adicionales
    console.log('Aplicando migraciones adicionales (Cajas, Mesas, Mozos)...');
    
    // Cajas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cajas (
        id SERIAL PRIMARY KEY,
        restaurante_id INTEGER REFERENCES restaurantes(id),
        monto_apertura DECIMAL(10,2) NOT NULL,
        monto_cierre DECIMAL(10,2),
        fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre TIMESTAMP,
        estado VARCHAR(20) DEFAULT 'abierta'
      );
      ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS caja_id INTEGER REFERENCES cajas(id);
    `);

    // Mesas y Mozos
    await pool.query(`
      ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mesa_nombre VARCHAR(50);
      ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mozo_nombre VARCHAR(100);
    `);
    console.log('   OK: Migraciones manuales aplicadas.');

    // 3. Crear usuario Administrador
    console.log('Creando usuario administrador...');
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO usuarios (email, password, restaurante_id) 
      VALUES ('admin@restomanager.com', $1, 1)
      ON CONFLICT (email) DO UPDATE SET password = $1
    `, [hash]);
    console.log('   OK: Usuario admin@restomanager.com creado.');

    // 4. Sembrar productos demo
    console.log('Sembrando productos demo...');
    await pool.query(`
      INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, restaurante_id) VALUES 
      ('Hamburguesa Clásica', 'Carne 100% vacuna, cheddar, lechuga, tomate y salsa especial.', 12.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop', 'hamburguesas', 1), 
      ('Doble Smash', 'Doble medallón smash, doble cheddar, bacon crocante y cebolla caramelizada.', 15.00, 'https://images.unsplash.com/photo-1594212887874-9208bf1a00f0?q=80&w=500&auto=format&fit=crop', 'hamburguesas', 1), 
      ('Papas Cheddar', 'Porción abundante de papas fritas bañadas en queso cheddar fundido y bacon.', 8.50, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=500&auto=format&fit=crop', 'acompanamientos', 1)
      ON CONFLICT DO NOTHING;
    `);
    console.log('   OK: Productos demo creados.');

    console.log('--- RECONSTRUCCIÓN COMPLETADA CON ÉXITO ---');
    
    // Actualizar .env local
    fs.writeFileSync(path.join(__dirname, '.env'), `DATABASE_URL="${dbUrl}"\n`);
    fs.writeFileSync(path.join(__dirname, '.env.local'), `DATABASE_URL="${dbUrl}"\n`);
    console.log('Archivos .env y .env.local actualizados.');

  } catch (err) {
    console.error('ERROR DURANTE LA RECONSTRUCCIÓN:', err);
  } finally {
    await pool.end();
  }
}

run();
