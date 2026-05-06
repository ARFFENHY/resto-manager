-- schema.sql
-- Ejecuta este script en tu base de datos PostgreSQL local para crear las tablas.

CREATE TABLE IF NOT EXISTS restaurantes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  imagen VARCHAR(255),
  categoria VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  direccion TEXT,
  estado VARCHAR(50) DEFAULT 'nuevo',
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
  producto_nombre VARCHAR(255) NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL
);

-- Insertar restaurante demo
INSERT INTO restaurantes (nombre, slug) VALUES ('RestoManager', 'restomanager') ON CONFLICT DO NOTHING;

-- Opcional: Insertar productos demo para que la DB tenga datos base.
-- INSERT INTO productos (nombre, descripcion, precio, imagen, categoria) VALUES 
-- ('Hamburguesa Clásica', 'Carne de res...', 8.50, 'url_img', 'burgers');
