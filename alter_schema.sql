-- Asegurar slug único en restaurantes
ALTER TABLE restaurantes DROP CONSTRAINT IF EXISTS unique_slug;
ALTER TABLE restaurantes ADD CONSTRAINT unique_slug UNIQUE (slug);

-- Modificar productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS restaurante_id INTEGER DEFAULT 1 REFERENCES restaurantes(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_productos_restaurante_id ON productos(restaurante_id);

-- Modificar pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS restaurante_id INTEGER DEFAULT 1 REFERENCES restaurantes(id) ON DELETE CASCADE;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS origen VARCHAR(50) DEFAULT 'web';
CREATE INDEX IF NOT EXISTS idx_pedidos_restaurante_id ON pedidos(restaurante_id);

-- Actualizar estados
-- Si hay un estado viejo que no coincide, lo dejamos o actualizamos si es necesario. (nuevo -> pendiente)
UPDATE pedidos SET estado = 'pendiente' WHERE estado = 'nuevo';
