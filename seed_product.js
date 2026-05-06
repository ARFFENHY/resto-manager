const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

pool.query(`INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, restaurante_id) VALUES ('Smash Burger Doble', 'Doble carne smash, doble queso cheddar, lechuga, tomate y salsa especial en pan brioche tostado', 12.99, '/burger-smash.png', 'Hamburguesas', 1)`)
  .then(() => { 
    console.log('Producto Smash Burger agregado'); 
    pool.end(); 
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
