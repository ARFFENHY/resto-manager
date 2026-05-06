import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await query(`
      SELECT id, nombre, slug, whatsapp, logo_url, direccion, color_primario
      FROM restaurantes
      WHERE id = $1
    `, [session.restauranteId]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.restauranteId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { nombre, whatsapp, logo_url, direccion, color_primario } = body;

    const res = await query(`
      UPDATE restaurantes
      SET 
        nombre = COALESCE($1, nombre),
        whatsapp = COALESCE($2, whatsapp),
        logo_url = COALESCE($3, logo_url),
        direccion = COALESCE($4, direccion),
        color_primario = COALESCE($5, color_primario)
      WHERE id = $6
      RETURNING *
    `, [nombre, whatsapp, logo_url, direccion, color_primario, session.restauranteId]);

    return NextResponse.json({ success: true, restaurante: res.rows[0] });
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
