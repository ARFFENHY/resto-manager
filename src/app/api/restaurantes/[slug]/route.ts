import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    // Obtener restaurante
    const restRes = await query(`
      SELECT id, nombre, slug, telefono 
      FROM restaurantes 
      WHERE slug = $1
    `, [slug]);

    if (restRes.rowCount === 0) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    const restaurante = restRes.rows[0];

    // Obtener productos del restaurante
    const prodRes = await query(`
      SELECT id, nombre, descripcion, precio, imagen, categoria 
      FROM productos 
      WHERE restaurante_id = $1
    `, [restaurante.id]);

    // Extraer categorías únicas por ID
    const categoriasMap = new Map<string, string>();
    prodRes.rows.forEach(p => {
      const id = p.categoria.toLowerCase().replace(/\s+/g, '-');
      if (!categoriasMap.has(id)) {
        // Guardamos el primer nombre original que encontremos para este id
        categoriasMap.set(id, p.categoria);
      }
    });
    
    const categories = Array.from(categoriasMap.entries()).map(([id, name]) => ({
      id,
      name
    }));

    return NextResponse.json({
      restaurante,
      categorias: categories,
      productos: prodRes.rows.map(p => ({
        id: p.id.toString(),
        name: p.nombre,
        description: p.descripcion,
        price: parseFloat(p.precio),
        image: p.imagen || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop",
        categoryId: p.categoria.toLowerCase().replace(/\s+/g, '-')
      }))
    });

  } catch (error) {
    console.error("Error fetching restaurant menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
