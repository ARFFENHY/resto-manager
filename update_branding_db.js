const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function updateBranding() {
  try {
    console.log('Actualizando branding en la base de datos...');
    
    // 1. Actualizar el restaurante
    await pool.query(`
      UPDATE restaurantes 
      SET nombre = 'RestoManager', 
          slug = 'restomanager' 
      WHERE slug = 'burger-station' OR id = 1;
    `);
    
    // 2. Actualizar el logo si es el por defecto
    await pool.query(`
      UPDATE restaurantes 
      SET logo_url = 'https://img.freepik.com/vector-premium/vector-logotipo-restaurante-diseno-minimalista-moderno_1103-1234.jpg'
      WHERE slug = 'restomanager' AND logo_url LIKE '%burger%';
    `);

    // 3. Actualizar usuarios (opcional pero recomendado)
    await pool.query(`
      UPDATE usuarios 
      SET email = REPLACE(email, 'burgerstation.com', 'restomanager.com')
      WHERE email LIKE '%burgerstation.com%';
    `);
    
    console.log('Branding actualizado correctamente en la DB.');
    
  } catch (err) {
    console.error('Error al actualizar la DB:', err);
  } finally {
    pool.end();
  }
}

updateBranding();
