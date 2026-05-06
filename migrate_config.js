const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function migrate() {
  try {
    console.log('Iniciando migración de configuración...');
    
    await pool.query(`
      ALTER TABLE restaurantes 
      ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50),
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS direccion TEXT,
      ADD COLUMN IF NOT EXISTS color_primario VARCHAR(20) DEFAULT '#10b981';
    `);
    
    console.log('Columnas añadidas a la tabla restaurantes.');
    
    // Actualizar el restaurante demo con datos por defecto
    await pool.query(`
      UPDATE restaurantes 
      SET whatsapp = '5491100000000', 
          direccion = 'Av. Siempre Viva 123',
          logo_url = 'https://img.freepik.com/vector-premium/logotipo-estacion-hamburguesas_113065-274.jpg'
      WHERE slug = 'restomanager' OR id = 1;
    `);
    
    console.log('Restaurante demo actualizado.');
    
  } catch (err) {
    console.error('Error en la migración:', err);
  } finally {
    pool.end();
  }
}

migrate();
