"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2 } from "lucide-react";

export default function CreateMess() {
  const [formData, setFormData] = useState({
    name: "",
    initialMonth: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/mess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create mess");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-8">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl">
            <PlusCircle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create New Mess</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Set up a new workspace for your members.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-100 dark:border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mess Name *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="e.g. Dream House Mess"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Initial Month *</label>
            <input
              type="text"
              name="initialMonth"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="e.g. April 2026"
              value={formData.initialMonth}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mess Password *</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Share this password with others so they can join.</p>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Mess"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
