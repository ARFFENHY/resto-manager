"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Store, Smartphone, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

const screenshots = [
  {
    url: "/pos-caja.png",
    title: "Control Total de Mesa",
    desc: "Gestiona tu salón con un mapa interactivo y cobra al instante."
  },
  {
    url: "/kds-kitchen.png",
    title: "Monitor de Cocina (KDS)",
    desc: "Optimiza la producción con tickets en tiempo real y estados de preparación."
  },
  {
    url: "/menu-qr.png",
    title: "Menú Digital QR",
    desc: "Tus clientes piden desde su móvil directamente a tu WhatsApp."
  }
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#f8fafc] relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-primary sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
            O
          </div>
          <span className="font-bold text-xl tracking-tight text-white uppercase italic">RestoManager</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/admin" className="text-sm font-bold bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            Panel Administrativo
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="bg-primary px-6 pt-20 pb-32 flex flex-col items-center text-center relative">
          <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
          <div className="relative z-10 max-w-4xl flex flex-col items-center">
            <span className="inline-block py-2 px-5 rounded-full bg-white/10 text-emerald-400 text-[10px] font-black mb-8 uppercase tracking-[0.3em] border border-white/10">
              #1 POS & KDS para Restaurantes
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
              EL CEREBRO DE <br/> TU RESTAURANTE
            </h1>
            <p className="text-lg md:text-2xl text-white/60 mb-12 max-w-2xl font-medium leading-relaxed">
              Sistema integral de Caja, Cocina y Menú Digital. <br className="hidden md:block"/> 
              Sin comisiones, directo a tu WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/admin" className="bg-emerald-500 text-white px-10 py-5 rounded-full font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-emerald-500/40 uppercase tracking-widest text-sm">
                Crear mi cuenta <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Carousel App Showcase */}
        <section className="relative -mt-20 z-20 px-6 max-w-6xl mx-auto w-full">
          <div className="bg-slate-900 rounded-[48px] p-4 md:p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10">
            <div className="relative aspect-video rounded-[32px] overflow-hidden group">
              {screenshots.map((s, i) => (
                <div 
                  key={i} 
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
                >
                  <img src={s.url} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                    <h3 className="text-white text-3xl md:text-5xl font-black mb-2 tracking-tighter uppercase">{s.title}</h3>
                    <p className="text-white/60 text-lg md:text-xl font-medium max-w-xl">{s.desc}</p>
                  </div>
                </div>
              ))}
              
              {/* Controls */}
              <button 
                onClick={() => setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="text-white w-8 h-8"/>
              </button>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev + 1) % screenshots.length)}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="text-white w-8 h-8"/>
              </button>

              {/* Dots */}
              <div className="absolute bottom-8 right-12 flex gap-3">
                {screenshots.map((_, i) => (
                  <div key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all cursor-pointer ${i === currentSlide ? 'w-10 bg-emerald-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
                  <Store className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Gestión de Caja</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Mapa interactivo de mesas, control de apertura/cierre y reportes detallados de ventas en tiempo real.
                </p>
              </div>

              <div className="space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Monitor KDS</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Digitaliza tu cocina. Los platos aparecen al instante y los cocineros gestionan el flujo de producción.
                </p>
              </div>

              <div className="space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">WhatsApp Pedidos</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Tus clientes escanean el QR, arman su carrito y envían el pedido detallado por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-20 px-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
            O
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 uppercase italic">RestoManager</span>
        </div>
        <p className="text-slate-400 font-medium mb-12 max-w-sm">
          La solución integral para modernizar tu operativa gastronómica sin complicaciones.
        </p>
        <div className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} RestoManager • Sistema POS & KDS
        </div>
      </footer>
    </div>
  );
}

const ChefHat = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 9.18 0A4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/></svg>
);
