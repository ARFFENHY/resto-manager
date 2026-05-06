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
      SELECT id, numero_o_nombre, pos_x, pos_y, created_at
      FROM mesas
      WHERE restaurante_id = $1
      ORDER BY numero_o_nombre ASC
    `, [session.restauranteId]);

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error fetching admin tables:", error);
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
    const { numero_o_nombre } = body;

    if (!numero_o_nombre) {
      return NextResponse.json({ error: "Nombre o número de mesa es requerido" }, { status: 400 });
    }

    const res = await query(`
      INSERT INTO mesas (numero_o_nombre, restaurante_id)
      VALUES ($1, $2)
      RETURNING id, numero_o_nombre, created_at
    `, [numero_o_nombre, session.restauranteId]);

    return NextResponse.json({ success: true, mesa: res.rows[0] });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
