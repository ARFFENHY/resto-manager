import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idParam = (await params).id;

    const res = await query(`
      DELETE FROM mesas 
      WHERE id = $1 AND restaurante_id = $2
      RETURNING id
    `, [parseInt(idParam), session.restauranteId]);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Table not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idParam = (await params).id;
    const body = await req.json();
    const { pos_x, pos_y } = body;

    const res = await query(`
      UPDATE mesas 
      SET pos_x = $1, pos_y = $2
      WHERE id = $3 AND restaurante_id = $4
      RETURNING id, pos_x, pos_y
    `, [pos_x, pos_y, parseInt(idParam), session.restauranteId]);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, mesa: res.rows[0] });
  } catch (error) {
    console.error("Error updating table position:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
