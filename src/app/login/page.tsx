"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        const data = await res.json();
        setError(data.details ? `${data.error}: ${data.details}` : data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-soft flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-primary rounded-b-[40px] z-0"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center font-bold text-blue-brand text-2xl shadow-sm mb-4">
            O
          </div>
          <h1 className="text-2xl font-extrabold text-white">Iniciar Sesión</h1>
          <p className="text-white/70 font-medium text-sm mt-1">Accede a tu panel de restaurante</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/10 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white/80 ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/20 transition-all font-medium text-white placeholder:text-gray-500"
              placeholder="tu@restaurante.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white/80 ml-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/20 transition-all font-medium text-white placeholder:text-gray-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 bg-blue-brand text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-brand/30 hover:bg-blue-brand-hover active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? "Verificando..." : (
              <>Ingresar <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/50 font-medium mt-8">
          ¿No tienes cuenta? <a href="#" className="text-blue-brand font-bold hover:underline">Regístrate</a>
        </p>
      </div>
    </div>
  );
}
