import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { events } from "@/lib/events";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idParam = (await params).id;
    console.log(`[PUT /api/pedidos] Reibido para ID: ${idParam}`);
    
    const body = await req.json();
    console.log(`[PUT /api/pedidos] Body:`, body);
    const { estado } = body;

    if (!estado) {
      console.log(`[PUT /api/pedidos] Error: estado is required`);
      return NextResponse.json({ error: "Estado is required" }, { status: 400 });
    }

    console.log(`[PUT /api/pedidos] Actualizando DB. Estado: ${estado}, ID: ${idParam}, RestID: ${session.restauranteId}`);

    // Only update if it belongs to the authenticated restaurante_id
    const res = await query(`
      UPDATE pedidos 
      SET estado = $1 
      WHERE id = $2 AND restaurante_id = $3
      RETURNING id, estado
    `, [estado, parseInt(idParam), session.restauranteId]);

    if (res.rows.length === 0) {
      console.log(`[PUT /api/pedidos] Error: Row count 0. No se actualizó nada en DB.`);
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    console.log(`[PUT /api/pedidos] ÉXITO: Pedido actualizado a ${estado}`);

    events.emit("ORDER_UPDATED", {
      pedidoId: idParam,
      estado: estado
    });

    return NextResponse.json({ success: true, order: res.rows[0] });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
