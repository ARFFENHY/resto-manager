const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://postgres.mjokebqkjxdvbtmgzyel:Arfeni090588@aws-1-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Iniciando migración de configuración en SUPABASE...');
    
    // 1. Añadir columnas si no existen
    await pool.query(`
      ALTER TABLE restaurantes 
      ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50),
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS direccion TEXT,
      ADD COLUMN IF NOT EXISTS color_primario VARCHAR(20) DEFAULT '#10b981';
    `);
    
    console.log('✅ Columnas añadidas (o ya existían).');
    
    // 2. Asegurar que el restaurante 1 tenga el slug correcto y datos base
    await pool.query(`
      UPDATE restaurantes 
      SET slug = 'restomanager',
          whatsapp = COALESCE(whatsapp, '5491100000000'),
          nombre = COALESCE(nombre, 'RestoManager')
      WHERE id = 1;
    `);
    
    console.log('✅ Datos del restaurante 1 actualizados.');
    
  } catch (err) {
    console.error('❌ Error en la migración:', err);
  } finally {
    await pool.end();
  }
}

migrate();
