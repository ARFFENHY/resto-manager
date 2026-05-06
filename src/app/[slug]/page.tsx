"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
};

type Restaurant = {
  id: number;
  nombre: string;
  slug: string;
  telefono: string;
};

type CartItem = Product & { quantity: number };

export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [urlMesa, setUrlMesa] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setUrlMesa(searchParams.get("mesa"));
    }
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/restaurantes/${slug}`);
        if (!res.ok) throw new Error("Restaurante no encontrado o sin menú");
        const data = await res.json();
        setRestaurant(data.restaurante);
        setCategories(data.categorias);
        setProducts(data.productos);
        if (data.categorias.length > 0) setActiveCategory(data.categorias[0].id);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [slug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing?.quantity === 1) {
        return prev.filter((item) => item.id !== productId);
      }
      return prev.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const deleteFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const generateWhatsAppLink = () => {
    const phoneNumber = restaurant?.telefono || ""; 
    let message = `Nuevo pedido:\n`;
    cart.forEach((item) => {
      message += `- ${item.quantity} ${item.name}\n`;
    });
    message += `Total: $${totalPrice.toFixed(2)}`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCheckout = async () => {
    if (!restaurant) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: restaurant.slug,
          cliente_nombre: "Cliente Web",
          telefono: "1234567890",
          direccion: "Retiro en local",
          total: totalPrice,
          mesa_nombre: urlMesa,
          items: cart.map(i => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity
          }))
        })
      });
      
      if (res.ok) {
        showToast("¡Pedido guardado exitosamente!");
        const link = generateWhatsAppLink();
        window.open(link, "_blank");
        setCart([]);
        setIsCartOpen(false);
      } else {
        showToast("Hubo un error al guardar tu pedido.");
      }
    } catch (e) {
      console.error(e);
      showToast("Hubo un error al guardar tu pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageSrc = (src: string) => {
    if (!src) return "";
    if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/')) {
      return src;
    }
    return `/${src}`;
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-sans">Cargando menú...</div>;
  }

  if (error || !restaurant) {
    return <div className="min-h-screen flex flex-col items-center justify-center font-sans gap-4">
      <p className="font-bold text-xl">{error}</p>
      <Link href="/" className="text-blue-brand underline">Volver al inicio</Link>
    </div>;
  }

  return (
    <div className="bg-background-soft min-h-screen pb-24 font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Restaurant Header */}
      <header className="bg-primary sticky top-0 z-40 shadow-sm border-b border-primary">
        <div className="flex items-center justify-between p-4 pb-2">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-black/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-lg text-black">{restaurant.nombre}</h1>
            <span className="text-[10px] text-green-success font-bold bg-white/30 px-2 py-0.5 rounded-full mt-0.5">Abierto ahora</span>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Categories Tabs */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto no-scrollbar gap-1 px-3 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`whitespace-nowrap px-5 py-2.5 rounded-t-2xl text-sm font-bold transition-colors capitalize ${
                  activeCategory === cat.id
                    ? "bg-white text-black"
                    : "text-black/70 hover:text-black"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Menu List */}
      <main className="p-4 flex flex-col gap-8 max-w-3xl mx-auto pt-6">
        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Este restaurante aún no tiene productos.</div>
        ) : (
          categories.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-32">
              <h2 className="text-xl font-bold mb-4 text-black capitalize">{category.name}</h2>
              <div className="flex flex-col gap-4">
                {products
                  .filter((p) => p.categoryId === category.id)
                  .map((product) => {
                    const cartItem = cart.find(c => c.id === product.id);
                    return (
                      <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex gap-4">
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-bold text-lg text-black">${product.price.toFixed(2)}</span>
                            
                            {cartItem ? (
                              <div className="flex items-center gap-3 bg-blue-light rounded-full px-2 py-1 border border-blue-200">
                                <button onClick={() => removeFromCart(product.id)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-blue-brand font-bold">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold w-4 text-center text-blue-brand">{cartItem.quantity}</span>
                                <button onClick={() => addToCart(product)} className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-brand shadow-sm hover:brightness-110 text-white font-bold">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => addToCart(product)}
                                className="bg-blue-light text-blue-brand hover:bg-blue-200 px-5 py-1.5 rounded-full font-bold text-sm transition-colors"
                              >
                                Agregar
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                          <Image src={getImageSrc(product.image)} alt={product.name} fill className="object-cover" sizes="112px" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center pointer-events-none">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full max-w-md bg-blue-brand text-white p-4 rounded-3xl shadow-xl shadow-blue-brand/20 flex items-center justify-between pointer-events-auto hover:bg-blue-brand-hover transition-transform transform active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <span className="font-bold text-sm">Ver Pedido</span>
            </div>
            <span className="font-bold">${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[32px] sm:rounded-3xl z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Mi Pedido
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <ArrowLeft className="w-5 h-5 rotate-180 text-gray-700" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={getImageSrc(item.image)} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm leading-tight pr-2">{item.name}</h4>
                          <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-blue-light rounded-full px-2 py-0.5 border border-blue-200">
                            <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-blue-brand">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-sm w-4 text-center text-blue-brand">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-brand shadow-sm hover:brightness-110 text-white">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => deleteFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-full">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-100 rounded-b-3xl">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-gray-600 font-bold">Total</span>
                  <span className="text-3xl font-black">${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-[#00A650] text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold text-lg hover:bg-[#008a42] transition-colors active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Procesando..." : "Continuar por WhatsApp"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
