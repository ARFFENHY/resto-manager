const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.mjokebqkjxdvbtmgzyel:Arfeni090588@aws-1-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function insert() {
  try {
    const res1 = await pool.query("INSERT INTO pedidos (cliente_nombre, telefono, total, estado, restaurante_id, origen, mesa_nombre) VALUES ('Juan Perez', '123456', 4500, 'pendiente', 1, 'web', '5') RETURNING id");
    const id1 = res1.rows[0].id;
    await pool.query("INSERT INTO pedido_items (pedido_id, producto_nombre, cantidad, precio_unitario) VALUES ($1, 'Hamburguesa Especial', 1, 3500), ($1, 'Coca Cola', 1, 1000)", [id1]);

    const res2 = await pool.query("INSERT INTO pedidos (cliente_nombre, telefono, total, estado, restaurante_id, origen, mesa_nombre) VALUES ('Maria Gomez', '654321', 3200, 'pendiente', 1, 'web', '8') RETURNING id");
    const id2 = res2.rows[0].id;
    await pool.query("INSERT INTO pedido_items (pedido_id, producto_nombre, cantidad, precio_unitario) VALUES ($1, 'Pizza Muzzarella', 2, 1600)", [id2]);

    console.log('Test orders created successfully');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
insert();
