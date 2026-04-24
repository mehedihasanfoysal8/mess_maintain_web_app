"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PieChart, Loader2 } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 py-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-screen pointer-events-none overflow-hidden flex items-start justify-center z-0">
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-blue-500/20 via-cyan-500/10 to-transparent blur-3xl dark:from-blue-600/20 dark:via-cyan-800/20" />
      </div>

      <div className="w-full max-w-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10">
        <div className="p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2.5 rounded-xl shadow-lg group-hover:shadow-indigo-500/30 transition-all transform group-hover:-translate-y-0.5">
                <PieChart size={24} />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">MessMaintain</span>
            </Link>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 dark:text-white mb-2 tracking-tight">Create an account</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm md:text-base">Join to manage your shared living space automatically.</p>
          
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm mb-6 text-center border border-rose-100 dark:border-rose-800/50">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address *</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address (Optional)</label>
                <input
                  type="text"
                  name="address"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="City, Country"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 mt-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Create free account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Log in securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
