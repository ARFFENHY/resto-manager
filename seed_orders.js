const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Arfeni090588@localhost:5432/postgres' });

async function seedOrders() {
  try {
    // 1. Pedido Pendiente
    const res1 = await pool.query(`
      INSERT INTO pedidos (cliente_nombre, telefono, direccion, total, estado, restaurante_id, origen)
      VALUES ('Carlos Perez', '1122334455', 'Mesa 3', 15.50, 'pendiente', 1, 'web')
      RETURNING id
    `);
    await pool.query(`
      INSERT INTO pedido_items (pedido_id, producto_nombre, cantidad, precio_unitario)
      VALUES ($1, 'Hamburguesa Clásica', 1, 8.50), ($1, 'Papas Fritas', 1, 7.00)
    `, [res1.rows[0].id]);

    // 2. Pedido Preparando
    const res2 = await pool.query(`
      INSERT INTO pedidos (cliente_nombre, telefono, direccion, total, estado, restaurante_id, origen)
      VALUES ('María Gomez', '9988776655', 'Para llevar', 25.98, 'preparando', 1, 'web')
      RETURNING id
    `);
    await pool.query(`
      INSERT INTO pedido_items (pedido_id, producto_nombre, cantidad, precio_unitario)
      VALUES ($1, 'Smash Burger Doble', 2, 12.99)
    `, [res2.rows[0].id]);

    // 3. Pedido Listo
    const res3 = await pool.query(`
      INSERT INTO pedidos (cliente_nombre, telefono, direccion, total, estado, restaurante_id, origen)
      VALUES ('Juan Rodriguez', '5544332211', 'Mesa 1', 8.50, 'listo', 1, 'web')
      RETURNING id
    `);
    await pool.query(`
      INSERT INTO pedido_items (pedido_id, producto_nombre, cantidad, precio_unitario)
      VALUES ($1, 'Hamburguesa Clásica', 1, 8.50)
    `, [res3.rows[0].id]);

    console.log('Pedidos simulados creados con éxito');
  } catch (error) {
    console.error('Error al crear pedidos:', error);
  } finally {
    pool.end();
  }
}

seedOrders();
