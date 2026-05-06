const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' }); 
pool.query(`
  INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, restaurante_id) VALUES 
  ('Hamburguesa Clásica', 'Carne 100% vacuna, cheddar, lechuga, tomate y salsa especial.', 12.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop', 'hamburguesas', 1), 
  ('Doble Smash', 'Doble medallón smash, doble cheddar, bacon crocante y cebolla caramelizada.', 15.00, 'https://images.unsplash.com/photo-1594212887874-9208bf1a00f0?q=80&w=500&auto=format&fit=crop', 'hamburguesas', 1), 
  ('Papas Cheddar', 'Porción abundante de papas fritas bañadas en queso cheddar fundido y bacon.', 8.50, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=500&auto=format&fit=crop', 'acompanamientos', 1), 
  ('Limonada Menta', 'Limonada natural refrescante con hojas de menta y jengibre.', 4.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=500&auto=format&fit=crop', 'bebidas', 1);
`).then(()=> {console.log('seeded'); pool.end()}).catch(console.error);
