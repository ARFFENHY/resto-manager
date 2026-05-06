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
      SELECT id, nombre, descripcion, precio, imagen, categoria
      FROM productos
      WHERE restaurante_id = $1
      ORDER BY categoria ASC, nombre ASC
    `, [session.restauranteId]);

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error fetching admin products:", error);
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
    const { nombre, descripcion, precio, imagen, categoria } = body;

    if (!nombre || !precio || !categoria) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const res = await query(`
      INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, restaurante_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre, descripcion, precio, imagen, categoria
    `, [nombre, descripcion || "", precio, imagen || "", categoria, session.restauranteId]);

    return NextResponse.json({ success: true, producto: res.rows[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
