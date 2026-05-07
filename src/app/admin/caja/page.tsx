"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { 
  X, CreditCard, Receipt, Plus, ShoppingCart, Printer, ChefHat, Wallet, Calendar, Users, Send, Clock, CheckCircle2, Trash2, AlertTriangle, ChevronRight, TrendingUp, Map as MapIcon, Trash
} from "lucide-react";

type Mesa = { id: number; numero_o_nombre: string; pos_x: number; pos_y: number; };
type Product = { id: number; nombre: string; precio: string; categoria: string; };
type Order = { id: string; cliente_nombre: string; items: string; total: number; estado: string; mesa_nombre: string; created_at: string; updated_at?: string; };
type Caja = { id: number; monto_apertura: string; estado: string; fecha_apertura: string; };

export default function AdminCaja() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCajaModal, setShowCajaModal] = useState(false);
  const [cajaMonto, setCajaMonto] = useState("");
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [tempBasket, setTempBasket] = useState<{product: Product, quantity: number}[]>([]);
  
  // Custom Confirmation State (to avoid browser 'confirm' blocks)
  const [confirmData, setConfirmData] = useState<{type: 'cobrar' | 'anular', id?: string, text: string} | null>(null);

  const fetchData = async () => {
    try {
      const [resMesas, resOrders, resProducts, resCaja] = await Promise.all([
        fetch('/api/admin/mesas'),
        fetch('/api/pedidos'),
        fetch('/api/admin/productos'),
        fetch('/api/admin/caja')
      ]);
      if (resMesas.ok) setMesas(await resMesas.json());
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resProducts.ok) setProducts(await resProducts.json());
      if (resCaja.ok) setCaja((await resCaja.json()).cajaAbierta);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { 
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCajaAction = async () => {
    const action = caja ? 'cerrar' : 'abrir';
    try {
      const res = await fetch('/api/admin/caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, monto: parseFloat(cajaMonto) })
      });
      if (res.ok) { fetchData(); setShowCajaModal(false); setCajaMonto(""); }
    } catch (error) { console.error(error); }
  };

  const printTicket = (mesaName: string, items: string, total: number, isComanda = false) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = `<html><head><title>Ticket</title><style>body { font-family: 'Courier New', Courier, monospace; width: 280px; padding: 20px; } .center { text-align: center; } .bold { font-weight: bold; } .header { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 20px; } .total { border-top: 1px solid #000; padding-top: 10px; font-size: 18px; font-weight: bold; }</style></head><body><div class="header center"><h1>RESTOMANAGER</h1><p>Mesa: ${mesaName}</p><p>${new Date().toLocaleString()}</p></div><div class="center bold">${isComanda ? '*** COMANDA ***' : '*** VENTA ***'}</div><div style="margin: 20px 0;">${items.split(',').map(i => `<div>${i.trim()}</div>`).join('')}</div>${!isComanda ? `<div class="total center">TOTAL: $${total.toFixed(2)}</div>` : ''}<script>window.print(); window.close();</script></body></html>`;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleSendOrder = async () => {
    if (!selectedMesa || tempBasket.length === 0) return;
    const total = tempBasket.reduce((s, i) => s + (parseFloat(i.product.precio) * i.quantity), 0);
    const itemsDescription = tempBasket.map(i => `${i.quantity}x ${i.product.nombre}`).join(', ');
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
        cliente_nombre: `Mesa ${selectedMesa.numero_o_nombre}`, 
        total, slug: "restomanager", 
        origen: 'pos',
        mesa_nombre: selectedMesa.numero_o_nombre, 
        items: tempBasket.map(i => ({ name: i.product.nombre, quantity: i.quantity, price: parseFloat(i.product.precio) })) 
      })
      });
      if (res.ok) { fetchData(); printTicket(selectedMesa.numero_o_nombre, itemsDescription, total, true); setTempBasket([]); setShowProductPicker(false); }
    } catch (error) { console.error(error); }
  };

  const executeAnular = async (id: string) => {
    try {
      await fetch(`/api/pedidos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'anulado' }) });
      fetchData();
      setConfirmData(null);
    } catch (error) { console.error(error); }
  };

  const executeFinalizeAll = async () => {
    if (!caja) return setShowCajaModal(true);
    const activeOrders = orders.filter(o => {
      const oM = (o.mesa_nombre || "").toString().toLowerCase().replace('mesa ', '').trim();
      const sM = (selectedMesa?.numero_o_nombre || "").toString().toLowerCase().replace('mesa ', '').trim();
      return oM === sM && o.estado !== 'listo' && o.estado !== 'anulado';
    });
    const items = activeOrders.map(o => o.items).join(', ');
    const total = activeOrders.reduce((s, o) => s + o.total, 0);
    await Promise.all(activeOrders.map(o => fetch(`/api/pedidos/${o.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'listo' }) })));
    printTicket(selectedMesa!.numero_o_nombre, items, total);
    fetchData();
    setSelectedMesa(null);
    setConfirmData(null);
  };

  const historyRaw = orders.filter(o => o.estado === 'listo' || o.estado === 'anulado');
  const groupedHistory: any[] = [];
  historyRaw.forEach(o => {
    const d = new Date(o.updated_at || o.created_at);
    const dS = d.toLocaleDateString();
    const key = `${o.mesa_nombre}-${dS}`;
    let e = groupedHistory.find(g => `${g.mesa}-${g.date}` === key);
    if (!e) {
      e = { mesa: o.mesa_nombre, items: "", total: 0, time: d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), date: dS, status: 'listo' };
      groupedHistory.push(e);
    }
    e.items += (e.items ? ", " : "") + o.items;
    e.total += o.total;
    if (o.estado === 'anulado') e.status = 'anulado';
  });

  const mesaOrders = orders.filter(o => {
    const oM = (o.mesa_nombre || "").toString().toLowerCase().replace('mesa ', '').trim();
    const sM = (selectedMesa?.numero_o_nombre || "").toString().toLowerCase().replace('mesa ', '').trim();
    return oM === sM && o.estado !== 'listo' && o.estado !== 'anulado';
  });
  const mesaAnulados = orders.filter(o => {
    const oM = (o.mesa_nombre || "").toString().toLowerCase().replace('mesa ', '').trim();
    const sM = (selectedMesa?.numero_o_nombre || "").toString().toLowerCase().replace('mesa ', '').trim();
    return oM === sM && o.estado === 'anulado';
  });
  const tableTotal = mesaOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32 overflow-x-hidden font-sans">
      <AdminNav />
      
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-[40]">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl"><Wallet className="text-white w-6 h-6"/></div>
          <h1 className="font-black text-xl uppercase tracking-tighter">Caja</h1>
        </div>
        <button onClick={() => setShowCajaModal(true)} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase ${caja ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
          {caja ? '🟢 Abierta' : '🔴 Abrir Caja'}
        </button>
      </div>

      <main className="px-2 pb-6 w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Stats & List (Left Column - 2/12) */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-[32px] border shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recaudación</span>
              <p className="text-2xl font-black text-slate-900">${historyRaw.filter(o => o.estado === 'listo').reduce((s,o) => s+o.total, 0).toFixed(2)}</p>
            </div>
            
            <button onClick={() => setShowSalesHistory(true)} className="w-full bg-slate-900 p-6 rounded-[32px] text-white flex items-center justify-between group hover:bg-slate-800 transition-all shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400"><TrendingUp className="w-5 h-5"/></div>
                <p className="font-black text-sm">Historial</p>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </button>

            {/* Mesa Quick List */}
            <div className="bg-white rounded-[32px] border shadow-sm p-5 flex flex-col h-[600px]">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4 px-2">Listado Mesas</h3>
              <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {mesas.sort((a,b) => a.numero_o_nombre.localeCompare(b.numero_o_nombre, undefined, {numeric: true})).map(m => {
                  const activeO = orders.filter(o => (o.mesa_nombre || "").toString().includes(m.numero_o_nombre) && o.estado !== 'listo' && o.estado !== 'anulado');
                  const hasO = activeO.length > 0;
                  const mTotal = activeO.reduce((s,o) => s + o.total, 0);
                  
                  return (
                    <button key={m.id} onClick={() => setSelectedMesa(m)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${hasO ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${hasO ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border'}`}>{m.numero_o_nombre}</div>
                        <span className={`font-black text-[11px] uppercase ${hasO ? 'text-emerald-700' : 'text-slate-600'}`}>Mesa {m.numero_o_nombre}</span>
                      </div>
                      {hasO && <span className="font-black text-emerald-600 text-[10px]">${mTotal.toFixed(2)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mesa Map Area (Middle Column - 7/12) */}
          <div className="md:col-span-7">
            <div className="bg-white p-8 rounded-[48px] border shadow-inner relative h-[750px] overflow-hidden" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 0)', backgroundSize: '40px 40px' }}>
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Mapa Interactivo del Salón</span>
                <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  {mesas.filter(m => orders.some(o => (o.mesa_nombre || "").toString().includes(m.numero_o_nombre) && o.estado !== 'listo' && o.estado !== 'anulado')).length} Mesas Activas
                </span>
              </div>
              
              {mesas.map(m => {
                const hasO = orders.some(o => (o.mesa_nombre || "").toString().includes(m.numero_o_nombre) && o.estado !== 'listo' && o.estado !== 'anulado');
                return (
                  <div key={m.id} onClick={() => setSelectedMesa(m)} style={{ left: `${m.pos_x}px`, top: `${m.pos_y}px`, position: 'absolute' }} className={`w-28 h-28 rounded-[32px] border-4 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xl hover:z-20 ${hasO ? 'bg-emerald-50 border-emerald-500 ring-8 ring-emerald-500/10' : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-blue-200'}`}>
                    <span className="text-[10px] font-black uppercase opacity-20 leading-none mb-1 tracking-widest">Mesa</span>
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{m.numero_o_nombre}</span>
                    {hasO && (
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce-subtle">
                        <ShoppingCart className="w-5 h-5 text-white"/>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Decorative elements */}
              <div className="absolute bottom-10 right-10 flex gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm"><div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-slate-500 uppercase">En Consumo</span></div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm"><div className="w-3 h-3 bg-slate-200 rounded-full"></div><span className="text-[10px] font-black text-slate-500 uppercase">Libre</span></div>
              </div>
            </div>
          </div>

          {/* Incoming Orders (Right Column - 3/12) */}
          <div className="md:col-span-3 space-y-6 min-w-[300px]">
            <div className="bg-blue-600 rounded-[40px] p-6 h-[750px] flex flex-col shadow-2xl relative overflow-hidden border-4 border-white">
               <h2 className="text-white font-black text-2xl mb-4">PANEL DE PEDIDOS ACTIVO</h2>
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
               
               <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl text-blue-400"><Send className="w-5 h-5"/></div>
                    <h3 className="text-white font-black text-xs uppercase tracking-widest">Pedidos App / Web</h3>
                  </div>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] font-black animate-pulse">
                    {orders.filter(o => o.estado === 'pendiente' && !mesas.some(m => (o.mesa_nombre || "").toString().includes(m.numero_o_nombre))).length} NUEVOS
                  </span>
               </div>

               <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar relative z-10">
                  {orders.filter(o => o.estado === 'pendiente' && !mesas.some(m => (o.mesa_nombre || "").toString().includes(m.numero_o_nombre))).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                      <Clock className="w-16 h-16"/>
                      <p className="font-black text-xs uppercase tracking-widest">Esperando pedidos...</p>
                    </div>
                  ) : (
                    orders.filter(o => o.estado === 'pendiente' && !mesas.some(m => (o.mesa_nombre || "").toString().includes(m.numero_o_nombre))).map((o, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl group hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Nuevo Pedido Web</span>
                            <h4 className="text-white font-black text-lg leading-tight mt-1">{o.cliente_nombre}</h4>
                          </div>
                          <p className="text-emerald-400 font-black text-xl tracking-tighter">${o.total.toFixed(2)}</p>
                        </div>
                        
                        <div className="text-white/60 text-xs font-medium mb-4 line-clamp-2 italic">
                          "{o.items}"
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => setConfirmData({type: 'anular', id: o.id, text: '¿Rechazar este pedido?'})}
                            className="flex-1 bg-white/5 text-white/40 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                          >
                            Rechazar
                          </button>
                          <button 
                            onClick={async () => {
                              await fetch(`/api/pedidos/${o.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'confirmado' }) });
                              fetchData();
                            }}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
                          >
                            Autorizar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* POS Modal - Z-100 */}
      {selectedMesa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-slate-200">
            <button onClick={() => { setSelectedMesa(null); setShowProductPicker(false); setTempBasket([]); }} className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-6 h-6"/></button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-slate-900 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl">{selectedMesa.numero_o_nombre}</div>
              <h2 className="font-black text-3xl uppercase tracking-tighter">Mesa {selectedMesa.numero_o_nombre}</h2>
            </div>

            {!showProductPicker ? (
              <div className="space-y-6">
                <button onClick={() => setShowProductPicker(true)} className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all uppercase text-sm tracking-widest"><Plus/> Añadir Pedido</button>
                
                <div className="bg-slate-50 p-6 rounded-3xl border">
                  {mesaOrders.length === 0 && mesaAnulados.length === 0 ? <p className="text-center py-10 font-bold opacity-30">SIN CONSUMO</p> : (
                    <div className="space-y-6">
                      {mesaOrders.map((o, i) => (
                        <div key={i} className="flex justify-between items-center border-b pb-4 last:border-0">
                          <div><p className="font-black text-lg">{o.items}</p><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                          <button onClick={() => setConfirmData({type: 'anular', id: o.id, text: `¿Anular ${o.items}?`})} className="text-rose-500 p-2 hover:bg-rose-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                        </div>
                      ))}
                      <div className="pt-6 mt-4 border-t-2 border-dashed border-slate-300">
                        <div className="flex justify-between items-end mb-8">
                          <div><span className="text-slate-400 text-[10px] font-black uppercase">Total Mesa</span><p className="text-5xl font-black text-slate-900 tracking-tighter">${tableTotal.toFixed(2)}</p></div>
                        </div>
                        <button onClick={() => setConfirmData({type: 'cobrar', text: `¿Finalizar y cobrar $${tableTotal.toFixed(2)}?`})} className="w-full bg-emerald-500 text-white font-black py-6 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-sm tracking-widest">Finalizar y Cobrar</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button onClick={() => setShowProductPicker(false)} className="text-blue-600 font-black text-xs uppercase flex items-center gap-2"><ChevronRight className="rotate-180"/> Volver</button>
                <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2">
                  {products.map(p => (
                    <button key={p.id} onClick={() => setTempBasket([...tempBasket, {product: p, quantity: 1}])} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl hover:bg-blue-50 border transition-all text-left">
                      <div><p className="font-black text-slate-800">{p.nombre}</p><span className="text-[9px] text-slate-400 font-bold uppercase">{p.categoria}</span></div>
                      <span className="font-black text-blue-600">${parseFloat(p.precio).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
                {tempBasket.length > 0 && <button onClick={handleSendOrder} className="w-full bg-orange-500 text-white font-black py-6 rounded-2xl shadow-xl uppercase">Mandar a Cocina ({tempBasket.length})</button>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal - Z-200 (Ensures visibility and clicks) */}
      {confirmData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl border-4 border-slate-900 animate-in zoom-in-95 duration-200">
             <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmData.type === 'anular' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {confirmData.type === 'anular' ? <Trash className="w-10 h-10"/> : <CreditCard className="w-10 h-10"/>}
             </div>
             <h3 className="font-black text-2xl mb-8 leading-tight">{confirmData.text}</h3>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setConfirmData(null)} className="py-4 rounded-2xl bg-slate-100 font-black text-slate-500 uppercase text-xs">Cancelar</button>
                <button onClick={confirmData.type === 'anular' ? () => executeAnular(confirmData.id!) : executeFinalizeAll} className={`py-4 rounded-2xl font-black text-white uppercase text-xs shadow-lg ${confirmData.type === 'anular' ? 'bg-rose-600' : 'bg-emerald-600'}`}>Confirmar</button>
             </div>
          </div>
        </div>
      )}

      {/* Historial Modal - Z-150 */}
      {showSalesHistory && (
        <div className="fixed inset-0 z-[150] bg-[#020617] p-8 overflow-y-auto text-white">
          <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
            <h2 className="font-black text-3xl uppercase tracking-tighter">Historial Ventas</h2>
            <button onClick={() => setShowSalesHistory(false)} className="bg-white/10 p-3 rounded-full"><X/></button>
          </div>
          <div className="max-w-4xl mx-auto space-y-4 pb-20">
            {groupedHistory.reverse().map((e, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
                <div>
                   <div className="flex items-center gap-2 mb-2"><span className="bg-white text-black px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">Mesa {e.mesa}</span></div>
                   <p className="font-black text-lg">{e.items}</p>
                   <span className="text-[9px] text-slate-500 font-bold uppercase">{e.date} • {e.time}</span>
                </div>
                <div className="text-right">
                   <p className="text-[40px] font-black text-emerald-400 tracking-tighter leading-none">${e.total.toFixed(2)}</p>
                   <button onClick={() => printTicket(e.mesa, e.items, e.total)} className="mt-2 text-[8px] font-black uppercase bg-white/10 px-3 py-1 rounded-lg">Imprimir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caja Modal - Z-110 */}
      {showCajaModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 p-4">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 text-center shadow-2xl">
            <h2 className="font-black text-3xl mb-8">{caja ? 'Cerrar Caja' : 'Abrir Caja'}</h2>
            <input type="number" value={cajaMonto} onChange={e => setCajaMonto(e.target.value)} className="w-full bg-slate-50 border rounded-3xl px-6 py-6 text-center text-4xl font-black mb-8" placeholder="0.00" />
            <button onClick={handleCajaAction} className={`w-full font-black py-5 rounded-3xl text-white uppercase ${caja ? 'bg-rose-500' : 'bg-emerald-500'}`}>{caja ? 'Cerrar' : 'Abrir'}</button>
            <button onClick={() => setShowCajaModal(false)} className="mt-4 text-slate-400 font-bold text-xs">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
