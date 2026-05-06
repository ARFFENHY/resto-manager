import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { events } from "@/lib/events";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const restauranteId = session.restauranteId;

    const ordersRes = await query(`
      SELECT p.id, p.cliente_nombre, p.telefono, p.direccion, p.estado, p.total, p.created_at, p.mesa_nombre, p.mozo_nombre
      FROM pedidos p
      WHERE p.restaurante_id = $1
      ORDER BY p.created_at DESC
    `, [restauranteId]);
    
    const itemsRes = await query(`
      SELECT id, pedido_id, producto_nombre, cantidad, precio_unitario
      FROM pedido_items
    `);

    // Group items by order
    const orders = ordersRes.rows.map(order => {
      const items = itemsRes.rows.filter(i => i.pedido_id === order.id);
      return {
        id: order.id.toString(), // Convert to string as UI uses string IDs
        cliente_nombre: order.cliente_nombre,
        items: items.map(i => `${i.cantidad}x ${i.producto_nombre}`).join(", "),
        total: parseFloat(order.total),
        created_at: order.created_at,
        estado: order.estado,
        mesa_nombre: order.mesa_nombre,
        mozo_nombre: order.mozo_nombre
      };
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cliente_nombre, telefono, direccion, total, items, slug, mesa_nombre, mozo_nombre } = body;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Buscar restaurante_id real usando el slug
    const restRes = await query('SELECT id FROM restaurantes WHERE slug = $1', [slug]);
    
    if (restRes.rowCount === 0) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }
    
    const restaurante_id = restRes.rows[0].id;

    // Insert order
    const orderRes = await query(`
      INSERT INTO pedidos (cliente_nombre, telefono, direccion, total, estado, restaurante_id, origen, mesa_nombre, mozo_nombre)
      VALUES ($1, $2, $3, $4, 'pendiente', $5, 'web', $6, $7)
      RETURNING id, created_at
    `, [cliente_nombre || 'Cliente Web', telefono || '', direccion || '', total, restaurante_id, mesa_nombre || null, mozo_nombre || null]);
    
    const newOrderId = orderRes.rows[0].id;

    // Insert items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(`
          INSERT INTO pedido_items (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          newOrderId,
          null, 
          item.name,
          item.quantity,
          item.price
        ]);
      }
    }

    events.emit("ORDER_CREATED", {
      pedidoId: newOrderId,
      restauranteId: restaurante_id,
      total: total
    });

    return NextResponse.json({ 
      success: true, 
      orderId: newOrderId.toString() 
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
