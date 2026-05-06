"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, CheckCircle2 } from "lucide-react";
import AdminNav from "@/components/AdminNav";

type OrderStatus = "pendiente" | "preparando" | "listo" | "entregado";

type Order = {
  id: string;
  cliente_nombre: string;
  items: string;
  total: number;
  created_at: string;
  estado: OrderStatus;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"pendientes" | "preparando" | "listos">("pendientes");
  const [toastMessage, setToastMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/pedidos?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // The API returns cliente_nombre, but we mapped it to customerName previously. Let's use the DB names.
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const changeStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/pedidos/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newStatus } : o));
        showToast("Estado actualizado correctamente");
        // Optamos por UI optimista, el polling de 10s hará el sync después
      }
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pendiente": return "bg-red-100 text-red-700 border-red-200";
      case "preparando": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "listo": return "bg-blue-100 text-blue-700 border-blue-200";
      case "entregado": return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const visibleOrders = orders.filter(o => 
    (activeTab === "pendientes" && o.estado === "pendiente") ||
    (activeTab === "preparando" && o.estado === "preparando") ||
    (activeTab === "listos" && o.estado === "listo")
  );

  // Dashboard Stats
  const deliveredOrders = orders.filter(o => o.estado === "entregado");
  const salesToday = deliveredOrders.reduce((acc, curr) => acc + Number(curr.total), 0);
  const orderCount = deliveredOrders.length;
  const avgTicket = orderCount > 0 ? salesToday / orderCount : 0;

  return (
    <div className="bg-background-soft min-h-screen font-sans text-gray-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header - Flow standard */}
      <div className="bg-primary pt-10 pb-10 px-6 rounded-b-[40px] shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-full">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <span className="font-bold text-xl text-white">Panel de Control</span>
          </div>
          <button onClick={handleLogout} className="bg-white/10 p-2 rounded-full text-white hover:bg-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          {["pendientes", "preparando", "listos"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all capitalize ${
                activeTab === tab ? "bg-white text-slate-900" : "bg-white/10 text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-8 max-w-4xl mx-auto">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 font-medium text-sm">Ventas del Día</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">$ {salesToday.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/restomanager" className="text-blue-brand font-bold text-sm flex items-center bg-blue-50 px-3 py-1.5 rounded-full">
              Ver Menú <ArrowLeft className="w-4 h-4 rotate-180 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold mb-1">Pedidos Entregados</span>
              <span className="font-bold text-lg">{orderCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold mb-1">Ticket Promedio</span>
              <span className="font-bold text-lg">${avgTicket.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4 capitalize">Pedidos {activeTab}</h2>
          
          <div className="flex flex-col gap-4">
            {visibleOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-100 shadow-sm flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 mb-2 text-gray-300" />
                <p className="font-medium">No hay pedidos en esta sección.</p>
              </div>
            ) : (
              visibleOrders.map(order => {
                const date = new Date(order.created_at);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-bold text-lg text-black">#{order.id} - {order.cliente_nombre}</div>
                      <span className="text-sm font-bold text-gray-500">{timeString}</span>
                    </div>
                    <div className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {order.items}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xl">${Number(order.total).toFixed(2)}</span>
                      
                      <div className="flex gap-2">
                        {activeTab === "pendientes" && (
                          <button 
                            disabled={isUpdating === order.id}
                            onClick={() => changeStatus(order.id, "preparando")} 
                            className="bg-blue-brand text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-brand-hover disabled:opacity-50"
                          >
                            {isUpdating === order.id ? '...' : 'Preparar'}
                          </button>
                        )}
                        {activeTab === "preparando" && (
                          <button 
                            disabled={isUpdating === order.id}
                            onClick={() => changeStatus(order.id, "listo")} 
                            className="bg-blue-brand text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-brand-hover disabled:opacity-50"
                          >
                            {isUpdating === order.id ? '...' : 'Terminado'}
                          </button>
                        )}
                        {activeTab === "listos" && (
                          <button 
                            disabled={isUpdating === order.id}
                            onClick={() => changeStatus(order.id, "entregado")} 
                            className="bg-blue-brand text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-brand-hover disabled:opacity-50"
                          >
                            {isUpdating === order.id ? '...' : 'Entregar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>

      {/* Bottom Navigation */}
      <AdminNav />
    </div>
  );
}
