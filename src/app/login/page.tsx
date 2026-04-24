"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PieChart, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-screen pointer-events-none overflow-hidden flex items-start justify-center z-0">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent blur-3xl dark:from-indigo-600/20 dark:via-purple-800/20" />
      </div>

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10">
        <div className="p-8 md:p-10">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2.5 rounded-xl shadow-lg group-hover:shadow-indigo-500/30 transition-all transform group-hover:-translate-y-0.5">
                <PieChart size={24} />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">MessMaintain</span>
            </Link>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 dark:text-white mb-2 tracking-tight">Welcome back</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm md:text-base">Log in to manage your mess dashboard.</p>
          
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm mb-6 text-center border border-rose-100 dark:border-rose-800/50">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Link href="#" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Forgot password?</Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Log in to Dashboard"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
