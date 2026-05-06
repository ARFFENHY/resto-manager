"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { 
  Settings, 
  Trash2, 
  X,
  Move,
  Store,
  Phone,
  MapPin,
  Image as ImageIcon,
  Save,
  Layout,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";

type Mesa = { id: number; numero_o_nombre: string; pos_x: number; pos_y: number; };
type RestaurantConfig = {
  nombre: string;
  whatsapp: string;
  logo_url: string;
  direccion: string;
  color_primario: string;
  slug: string;
};

export default function AdminConfig() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"mesas" | "local">("local");
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [config, setConfig] = useState<RestaurantConfig>({
    nombre: "",
    whatsapp: "",
    logo_url: "",
    direccion: "",
    color_primario: "#10b981",
    slug: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingMesa, setIsAddingMesa] = useState(false);
  const [newMesaName, setNewMesaName] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [resMesas, resConfig] = await Promise.all([
        fetch('/api/admin/mesas'),
        fetch('/api/admin/configuracion')
      ]);
      
      if (resMesas.ok) setMesas(await resMesas.json());
      if (resConfig.ok) setConfig(await resConfig.json());
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setConfig({ ...config, logo_url: data.url });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/configuracion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert("Configuración guardada correctamente");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCatalogLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/${config.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMesaName) return;
    setIsAddingMesa(true);
    try {
      const res = await fetch('/api/admin/mesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_o_nombre: newMesaName })
      });
      if (res.ok) {
        fetchData();
        setNewMesaName("");
      }
    } catch (error) { console.error(error); } finally { setIsAddingMesa(false); }
  };

  const handleDeleteMesa = async (id: number) => {
    if (!confirm("¿Eliminar mesa?")) return;
    try {
      const res = await fetch(`/api/admin/mesas/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  const handleCopyLink = (id: number, mesaName: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/${config.slug}?mesa=${encodeURIComponent(mesaName)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const catalogUrl = typeof window !== 'undefined' ? `${window.location.origin}/${config.slug}` : '';

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32 font-sans text-slate-900">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-12 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col gap-2">
           <h1 className="font-black text-4xl text-white tracking-tighter uppercase flex items-center gap-3">
             <Settings className="w-10 h-10 text-emerald-400"/> Configuración
           </h1>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Personaliza tu marca y salón</p>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex gap-2 bg-white/5 p-1.5 rounded-3xl w-fit backdrop-blur-md border border-white/10">
          <button 
            onClick={() => setActiveTab("local")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "local" ? "bg-white text-slate-900 shadow-lg" : "text-white/60 hover:text-white"}`}
          >
            <Store className="w-4 h-4"/> Mi Local
          </button>
          <button 
            onClick={() => setActiveTab("mesas")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "mesas" ? "bg-white text-slate-900 shadow-lg" : "text-white/60 hover:text-white"}`}
          >
            <Layout className="w-4 h-4"/> Salón
          </button>
        </div>
      </div>

      <main className="p-6 max-w-4xl mx-auto -mt-8 relative z-20">
        
        {activeTab === "local" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Catalog Link Banner */}
            <div className="bg-emerald-500 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-500/20 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Tu Catálogo Digital</span>
                <p className="text-xl font-bold tracking-tight truncate max-w-[300px] md:max-w-md">{catalogUrl}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={handleCopyCatalogLink}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-emerald-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95"
                >
                  {copiedLink ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                  {copiedLink ? "COPIADO" : "COPIAR LINK"}
                </button>
                <a 
                  href={`/${config.slug}`} target="_blank"
                  className="flex items-center justify-center bg-emerald-600/50 text-white p-4 rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 border border-white/20"
                >
                  <ExternalLink className="w-5 h-5"/>
                </a>
              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex flex-col items-center">
              <div className="w-32 h-32 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-4 group relative cursor-pointer hover:border-emerald-500 transition-all">
                <input 
                  type="file" accept="image/*" onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {config.logo_url ? (
                  <img src={config.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Plus className="text-white w-8 h-8"/>
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haz clic para subir tu logo</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSaveConfig} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Nombre del Negocio</label>
                  <div className="relative">
                    <Store className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5"/>
                    <input 
                      type="text" value={config.nombre} onChange={e => setConfig({...config, nombre: e.target.value})}
                      placeholder="Ej: RestoManager"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[24px] pl-14 pr-6 py-5 font-black text-lg outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">WhatsApp (Pedidos)</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5"/>
                    <input 
                      type="text" value={config.whatsapp} onChange={e => setConfig({...config, whatsapp: e.target.value})}
                      placeholder="Ej: 5491112345678"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[24px] pl-14 pr-6 py-5 font-black text-lg outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium px-4">Código de país + número (sin el +)</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Dirección</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5"/>
                    <input 
                      type="text" value={config.direccion} onChange={e => setConfig({...config, direccion: e.target.value})}
                      placeholder="Ej: Av. Córdoba 1234, CABA"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[24px] pl-14 pr-6 py-5 font-black text-lg outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" disabled={isSaving}
                className="w-full bg-emerald-500 text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : <><Save className="w-5 h-5"/> Guardar Cambios</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Map Editor content same as before but uses config.slug for links */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-black text-sm uppercase tracking-widest text-slate-500">Diseño del Mapa</h2>
                  <button 
                    onClick={() => setIsLocked(!isLocked)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${isLocked ? 'bg-slate-100 text-slate-500' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
                  >
                    {isLocked ? 'CANDADO CERRADO' : 'MODO EDICIÓN'}
                  </button>
                </div>
                <div className="text-[10px] font-black text-slate-400">TIP: Arrastra las mesas para ubicarlas</div>
              </div>

              <div 
                ref={mapRef} 
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  if (draggingId === null || !mapRef.current || isLocked) return;
                  const rect = mapRef.current.getBoundingClientRect();
                  const x = Math.max(0, Math.min(e.clientX - rect.left - 40, rect.width - 80));
                  const y = Math.max(0, Math.min(e.clientY - rect.top - 40, rect.height - 80));
                  fetch(`/api/admin/mesas/${draggingId}`, { 
                    method: 'PATCH', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ pos_x: Math.round(x), pos_y: Math.round(y) }) 
                  }).then(() => fetchData());
                  setDraggingId(null);
                }}
                className={`w-full h-[500px] bg-white rounded-[48px] border-2 shadow-inner relative overflow-hidden transition-all ${isLocked ? 'border-slate-50' : 'border-dashed border-emerald-200 bg-emerald-50/5'}`}
                style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 0)', backgroundSize: '32px 32px' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-slate-300 font-bold">Cargando salón...</div>
                ) : (
                  mesas.map(mesa => (
                    <div 
                      key={mesa.id}
                      draggable={!isLocked}
                      onDragStart={() => setDraggingId(mesa.id)}
                      style={{ left: `${mesa.pos_x}px`, top: `${mesa.pos_y}px`, position: 'absolute' }}
                      className={`w-[80px] h-[80px] rounded-[28px] border-2 flex flex-col items-center justify-center shadow-sm group transition-all ${isLocked ? 'border-slate-100 bg-white opacity-80' : 'border-emerald-500 bg-white cursor-move scale-105 shadow-xl shadow-emerald-500/10'}`}
                    >
                      <span className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Mesa</span>
                      <span className="text-2xl font-black text-slate-900 leading-none">{mesa.numero_o_nombre}</span>
                      
                      {!isLocked && (
                        <div className="absolute -top-3 -right-3 flex gap-2">
                           <button onClick={() => handleDeleteMesa(mesa.id)} className="p-2 bg-white text-rose-500 rounded-full shadow-lg border border-rose-100 hover:bg-rose-50 transition-all"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      )}
                      
                      {isLocked && (
                        <button onClick={() => handleCopyLink(mesa.id, mesa.numero_o_nombre)} className={`absolute -bottom-2 p-1.5 rounded-lg shadow-md transition-all text-[10px] font-black ${copiedId === mesa.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-100 hover:text-emerald-600'}`}>
                          {copiedId === mesa.id ? '¡COPIADO!' : 'QR'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Add Mesa Form same as before */}
            <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h2 className="font-black text-sm uppercase tracking-widest text-slate-500 mb-6 px-4">Agregar Nueva Mesa</h2>
              <form onSubmit={handleAddMesa} className="flex gap-4">
                <input 
                  type="text" value={newMesaName} onChange={e => setNewMesaName(e.target.value)}
                  placeholder="Nombre (Ej: 10, VIP, Terraza...)"
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-5 font-black text-lg outline-none focus:border-emerald-500 transition-all"
                />
                <button 
                  type="submit" disabled={isAddingMesa || !newMesaName}
                  className="bg-slate-900 text-white px-10 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                >
                  Crear
                </button>
              </form>
            </section>
          </div>
        )}

        <button 
          onClick={() => router.push('/admin/caja')}
          className="mt-12 w-full py-6 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center gap-3"
        >
          <Move className="w-4 h-4"/> Volver al Panel de Caja
        </button>
      </main>

      <AdminNav />
    </div>
  );
}

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);


