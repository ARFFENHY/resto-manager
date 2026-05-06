"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminNav from "@/components/AdminNav";
import { Plus, Edit2, Trash2, X, Tag, DollarSign, AlignLeft, Image as ImageIcon, LogOut } from "lucide-react";

type Product = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
  categoria: string;
};

export default function AdminMenu() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    categoria: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/productos');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        imagen: product.imagen,
        categoria: product.categoria
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        imagen: "",
        categoria: "Hamburguesas" // Default
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Identificar si debemos quedarnos en el modal
    const stay = (e.nativeEvent as any).submitter?.getAttribute('data-stay') === 'true';
    setIsSubmitting(true);
    
    try {
      const url = editingId ? `/api/admin/productos/${editingId}` : '/api/admin/productos';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await fetchProducts();
        if (stay) {
          // Reset form but stay in modal
          setEditingId(null);
          setFormData({
            nombre: "",
            descripcion: "",
            precio: "",
            imagen: "",
            categoria: formData.categoria
          });
        } else {
          handleCloseModal();
        }
      } else {
        alert("Error al guardar el producto");
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    
    try {
      const res = await fetch(`/api/admin/productos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imagen: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const getImageSrc = (src: string) => {
    if (!src) return "";
    if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/')) {
      return src;
    }
    return `/${src}`;
  };

  const categories = Array.from(new Set(products.map(p => p.categoria)));

  return (
    <div className="bg-background-soft min-h-screen font-sans text-gray-900">
      <div className="bg-primary pt-10 pb-10 px-6 rounded-b-[40px] shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-bold text-2xl tracking-tight text-white">Mi Menú</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => handleOpenModal()}
              className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:bg-slate-50 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
            <button onClick={handleLogout} className="bg-white/10 p-2.5 rounded-xl text-white hover:bg-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-white/60 text-sm">Gestiona los productos de tu restaurante.</p>
      </div>

      <main className="px-4 py-8 max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-brand"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 mt-4">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Tu menú está vacío</h3>
            <p className="text-gray-500 text-sm mb-6">Agrega tu primer producto para empezar a recibir pedidos.</p>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-blue-brand text-white px-6 py-3 rounded-xl font-bold w-full shadow-md hover:bg-blue-brand-hover"
            >
              Crear Producto
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map(cat => (
              <div key={cat}>
                <h2 className="font-bold text-lg mb-4 ml-2 capitalize text-gray-800">{cat}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.filter(p => p.categoria === cat).map(product => (
                    <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                        {product.imagen ? (
                          <img 
                            src={getImageSrc(product.imagen)} 
                            alt={product.nombre} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 leading-tight">{product.nombre}</h3>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{product.descripcion}</p>
                        <div className="font-bold text-blue-brand mt-2">${parseFloat(product.precio).toFixed(2)}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleOpenModal(product)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="font-bold text-xl mb-6">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400"/> Nombre</label>
                <input 
                  type="text" 
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/20 transition-all"
                  placeholder="Ej. Hamburguesa Doble"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><DollarSign className="w-4 h-4 text-gray-400"/> Precio</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={e => setFormData({...formData, precio: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><AlignLeft className="w-4 h-4 text-gray-400"/> Categoría</label>
                  <input 
                    type="text" 
                    required
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/20 transition-all"
                    placeholder="Ej. Bebidas"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><AlignLeft className="w-4 h-4 text-gray-400"/> Descripción</label>
                <textarea 
                  rows={2}
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/20 transition-all resize-none"
                  placeholder="Detalles de los ingredientes..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gray-400"/> Imagen del Producto</label>
                <div className="flex items-center gap-4">
                  {formData.imagen && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-gray-200 flex-shrink-0">
                      <img 
                        src={getImageSrc(formData.imagen)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-center hover:border-blue-brand transition-all">
                      <span className="text-xs font-bold text-gray-500">
                        {formData.imagen ? "Cambiar imagen" : "Seleccionar de la PC"}
                      </span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-black text-white font-bold py-3.5 rounded-xl shadow-lg shadow-black/20 hover:bg-gray-800 disabled:opacity-70 transition-all"
                >
                  {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar Producto' : 'Guardar y Cerrar')}
                </button>
                
                {!editingId && (
                  <button 
                    type="submit" 
                    data-stay="true"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black border-2 border-black font-bold py-3.5 rounded-xl hover:bg-gray-50 disabled:opacity-70 transition-all"
                  >
                    Guardar y agregar otro
                  </button>
                )}

                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  );
}
