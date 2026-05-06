"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChefHat, Wallet, Menu, Settings } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50 flex justify-between items-center px-6 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <Link href="/admin" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/admin' ? 'text-blue-brand' : 'text-gray-400 hover:text-gray-600'}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-bold">Inicio</span>
      </Link>
      
      <Link href="/cocina" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/cocina' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
        <ChefHat className="w-6 h-6" />
        <span className="text-[10px] font-bold">Cocina</span>
      </Link>
      
      <Link href="/admin/caja" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/admin/caja' ? 'text-blue-brand' : 'text-gray-400 hover:text-gray-600'}`}>
        <Wallet className="w-6 h-6" />
        <span className="text-[10px] font-bold">Caja</span>
      </Link>

      <Link href="/admin/menu" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/admin/menu' ? 'text-blue-brand' : 'text-gray-400 hover:text-gray-600'}`}>
        <Menu className="w-6 h-6" />
        <span className="text-[10px] font-bold">Menú</span>
      </Link>
      
      <Link href="/admin/configuracion" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/admin/configuracion' ? 'text-blue-brand' : 'text-gray-400 hover:text-gray-600'}`}>
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-bold">Ajustes</span>
      </Link>
    </nav>
  );
}
