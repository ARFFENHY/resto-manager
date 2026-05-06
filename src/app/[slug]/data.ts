export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
};

export const categories: Category[] = [
  { id: "burgers", name: "Hamburguesas" },
  { id: "drinks", name: "Bebidas" },
  { id: "desserts", name: "Postres" },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Hamburguesa Clásica",
    description: "Carne de res 150g, queso cheddar, lechuga, tomate y salsa de la casa.",
    price: 8.5,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    categoryId: "burgers",
  },
  {
    id: "p2",
    name: "Doble Smash Burger",
    description: "Doble carne smash, doble queso cheddar, cebolla caramelizada y tocino.",
    price: 12.0,
    image: "https://images.unsplash.com/photo-1594212885994-010531cd8c16?w=500&q=80",
    categoryId: "burgers",
  },
  {
    id: "p3",
    name: "Coca Cola Original",
    description: "Lata 355ml bien fría.",
    price: 2.0,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    categoryId: "drinks",
  },
  {
    id: "p4",
    name: "Limonada Natural",
    description: "Limonada fresca con un toque de menta.",
    price: 3.5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    categoryId: "drinks",
  },
  {
    id: "p5",
    name: "Brownie con Helado",
    description: "Brownie de chocolate caliente con bola de helado de vainilla.",
    price: 5.0,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
    categoryId: "desserts",
  },
];
