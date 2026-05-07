import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idParam = (await params).id;
    const body = await req.json();
    const { nombre, descripcion, precio, imagen, categoria } = body;

    if (!nombre || !precio || !categoria) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const res = await query(`
      UPDATE productos 
      SET nombre = $1, descripcion = $2, precio = $3, imagen = $4, categoria = $5
      WHERE id = $6 AND restaurante_id = $7
      RETURNING id, nombre, descripcion, precio, imagen, categoria
    `, [nombre, descripcion || "", precio, imagen || "", categoria, parseInt(idParam), session.restauranteId]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, producto: res.rows[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idParam = (await params).id;

    // We might need to handle foreign key constraints if a product is in an order item.
    // For now, we will assume order_items don't strictly enforce product_id, or they duplicate the data.
    // In our schema, order_items has `producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL`.
    
    const res = await query(`
      DELETE FROM productos 
      WHERE id = $1 AND restaurante_id = $2
      RETURNING id
    `, [parseInt(idParam), session.restauranteId]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
