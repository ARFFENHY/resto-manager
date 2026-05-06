"use client";

import { useState, useEffect } from "react";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  UtensilsCrossed, 
  Bell, 
  History, 
  ArrowLeft,
  Timer,
  User,
  LayoutGrid,
  Trash2,
  PieChart
} from "lucide-react";

type Order = {
  id: string;
  cliente_nombre: string;
  items: string;
  estado: string;
  mesa_nombre: string;
  mozo_nombre: string;
  created_at: string;
};

type GroupedMesa = {
  mesa_nombre: string;
  orders: Order[];
  all_items: string;
  is_preparing: boolean;
  min_created_at: string;
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (res.ok) setOrders(await res.json());
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const updateTableStatus = async (mesaName: string, newStatus: string) => {
    const tableOrders = orders.filter(o => o.mesa_nombre === mesaName && o.estado !== 'listo');
    setOrders(prev => prev.map(o => (o.mesa_nombre === mesaName && o.estado !== 'listo') ? { ...o, estado: newStatus } : o));
    try {
      await Promise.all(tableOrders.map(o => 
        fetch(`/api/pedidos/${o.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: newStatus })
        })
      ));
    } catch (error) { console.error(error); fetchOrders(); }
  };

  const activeOrders = orders.filter(o => o.estado === 'pendiente' || o.estado === 'preparando');
  const groupedMesas: GroupedMesa[] = [];
  activeOrders.forEach(order => {
    let group = groupedMesas.find(g => g.mesa_nombre === order.mesa_nombre);
    if (!group) {
      group = { mesa_nombre: order.mesa_nombre, orders: [], all_items: "", is_preparing: false, min_created_at: order.created_at };
      groupedMesas.push(group);
    }
    group.orders.push(order);
    group.all_items += (group.all_items ? ", " : "") + order.items;
    if (order.estado === 'preparando') group.is_preparing = true;
    if (new Date(order.created_at) < new Date(group.min_created_at)) group.min_created_at = order.created_at;
  });

  // History grouped by mesa
  const historyRaw = orders.filter(o => o.estado === 'listo');
  const groupedHistory: GroupedMesa[] = [];
  historyRaw.forEach(order => {
    let group = groupedHistory.find(g => g.mesa_nombre === order.mesa_nombre && g.min_created_at.split('T')[0] === order.created_at.split('T')[0]);
    if (!group) {
      group = { mesa_nombre: order.mesa_nombre, orders: [], all_items: "", is_preparing: false, min_created_at: order.created_at };
      groupedHistory.push(group);
    }
    group.orders.push(order);
    group.all_items += (group.all_items ? ", " : "") + order.items;
  });

  // Global counts for the day
  const itemCounts: Record<string, number> = {};
  historyRaw.forEach(o => {
    o.items.split(',').forEach(i => {
      const parts = i.trim().split('x ');
      const qty = parts.length > 1 ? parseInt(parts[0]) : 1;
      const name = parts.length > 1 ? parts[1] : parts[0];
      itemCounts[name] = (itemCounts[name] || 0) + qty;
    });
  });

  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 p-6 font-sans">
      <header className="flex justify-between items-start mb-10 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="bg-orange-500 p-5 rounded-[28px] shadow-[0_0_50px_-12px_rgba(249,115,22,0.5)]">
            <ChefHat className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
              {showHistory ? 'Cierre de Producción' : 'Comandas por Mesa'}
            </h1>
            <p className="text-orange-500 font-black text-[11px] tracking-[0.4em] uppercase mt-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping"></span> 
              Monitor KDS de Alta Eficiencia
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <button 
             onClick={() => setShowHistory(!showHistory)}
             className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${showHistory ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'}`}
           >
             {showHistory ? <ArrowLeft className="w-5 h-5"/> : <PieChart className="w-5 h-5 text-orange-500"/>}
             {showHistory ? 'Volver al Monitor' : 'Producción Hoy'}
           </button>
           {!showHistory && (
             <div className="text-right border-l border-white/10 pl-8">
                <p className="text-6xl font-black leading-none text-orange-500">{groupedMesas.length}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Mesas Pendientes</p>
             </div>
           )}
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-20 w-20 border-t-4 border-orange-500"></div></div>
      ) : showHistory ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Summary Stats */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                 <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-8">Resumen de Producción</h3>
                 <div className="space-y-4">
                    {Object.entries(itemCounts).map(([name, qty]) => (
                       <div key={name} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                          <span className="font-bold text-slate-300">{name}</span>
                          <span className="bg-orange-500 text-white font-black px-3 py-1 rounded-lg text-lg leading-none">{qty}</span>
                       </div>
                    ))}
                    {Object.keys(itemCounts).length === 0 && <p className="text-slate-600 font-bold py-10 text-center">Sin actividad registrada</p>}
                 </div>
                 <button className="w-full mt-10 bg-rose-500/10 text-rose-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest text-[10px]">
                    <Trash2 className="w-4 h-4"/> Limpiar Jornada
                 </button>
              </div>
           </div>

           {/* History List Grouped by Mesa */}
           <div className="lg:col-span-2 space-y-4">
              <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-6">Detalle por Mesas Servidas</h3>
              {groupedHistory.reverse().map((group, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[40px] flex justify-between items-center group hover:bg-white/10 transition-all border-l-4 border-l-emerald-500">
                   <div className="flex items-center gap-8">
                      <div className="text-6xl font-black text-white/10 group-hover:text-emerald-500/20 transition-colors">{group.mesa_nombre}</div>
                      <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mesa {group.mesa_nombre}</p>
                         <p className="text-xl font-bold text-slate-100">{group.all_items}</p>
                         <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-tighter">Completado por {group.orders[0].mozo_nombre || 'Sistema'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <Clock className="w-4 h-4 text-slate-700 ml-auto mb-2"/>
                      <p className="font-black text-slate-400">{new Date(group.min_created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                   </div>
                </div>
              ))}
              {groupedHistory.length === 0 && <p className="text-center py-20 text-slate-700 font-black uppercase tracking-widest">El historial aparecerá aquí al cerrar mesas</p>}
           </div>
        </div>
      ) : groupedMesas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-48 opacity-10">
          <UtensilsCrossed className="w-40 h-40 mb-10" />
          <p className="text-5xl font-black uppercase tracking-[0.2em] text-center">COCINA<br/>DESPEJADA</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {groupedMesas.map((group) => (
            <div 
              key={group.mesa_nombre} 
              className={`rounded-[48px] overflow-hidden border-4 transition-all duration-700 relative flex flex-col ${group.is_preparing ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_60px_-15px_rgba(249,115,22,0.3)] scale-105 z-10' : 'border-white/5 bg-white/5'}`}
            >
              <div className="p-10 flex-1 flex flex-col">
                <div className="mb-10 flex justify-between items-start">
                  <div className="bg-slate-900 w-24 h-24 rounded-[32px] flex items-center justify-center text-white font-black text-6xl shadow-2xl border border-white/5">{group.mesa_nombre}</div>
                  {group.is_preparing && (
                    <div className="flex flex-col items-end gap-1">
                      <Timer className="w-8 h-8 text-orange-500 animate-spin-slow" />
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">En Fuego</span>
                    </div>
                  )}
                </div>

                <div className="bg-black/60 rounded-[40px] p-8 mb-10 border border-white/5 shadow-inner flex-1 flex items-center">
                  <p className="text-3xl font-black text-white leading-tight tracking-tight">
                    {group.all_items}
                  </p>
                </div>

                <div className="space-y-4 mb-10 border-l-2 border-white/10 pl-6">
                   {group.orders.map(o => (
                      <div key={o.id} className="text-[11px] font-bold text-slate-500 flex justify-between">
                         <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-700"/> {new Date(o.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                         <span className="uppercase tracking-widest">{o.mozo_nombre || 'Sistema'}</span>
                      </div>
                   ))}
                </div>

                <div className="mt-auto">
                  {!group.is_preparing ? (
                    <button 
                      onClick={() => updateTableStatus(group.mesa_nombre, 'preparando')}
                      className="w-full bg-white text-slate-900 font-black py-7 rounded-[32px] shadow-2xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs active:scale-95"
                    >
                      <Bell className="w-6 h-6"/> EMPEZAR PREPARACIÓN
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateTableStatus(group.mesa_nombre, 'listo')}
                      className="w-full bg-emerald-500 text-white font-black py-7 rounded-[32px] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs active:scale-95"
                    >
                      <CheckCircle2 className="w-7 h-7"/> FINALIZAR Y ENTREGAR
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </div>
  );
}
