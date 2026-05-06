import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar caja abierta
    const res = await query(`
      SELECT * FROM cajas 
      WHERE restaurante_id = $1 AND estado = 'abierta'
      LIMIT 1
    `, [session.restauranteId]);

    return NextResponse.json({ 
      cajaAbierta: res.rowCount > 0 ? res.rows[0] : null 
    });
  } catch (error) {
    console.error("Error fetching caja status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, monto } = body; // action: 'abrir' | 'cerrar'

    if (action === 'abrir') {
      const res = await query(`
        INSERT INTO cajas (restaurante_id, monto_apertura, estado)
        VALUES ($1, $2, 'abierta')
        RETURNING *
      `, [session.restauranteId, monto]);
      return NextResponse.json({ success: true, caja: res.rows[0] });
    } else if (action === 'cerrar') {
      const res = await query(`
        UPDATE cajas 
        SET monto_cierre = $1, estado = 'cerrada', fecha_cierre = CURRENT_TIMESTAMP
        WHERE restaurante_id = $2 AND estado = 'abierta'
        RETURNING *
      `, [monto, session.restauranteId]);
      return NextResponse.json({ success: true, caja: res.rows[0] });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing caja:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
