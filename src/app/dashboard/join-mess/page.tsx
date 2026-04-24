"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Clock, XCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function JoinMess() {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/mess/join/status");
        if (res.ok) {
          const data = await res.json();
          setRequestStatus(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setStatusLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mess/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send join request");
      // Re-check status
      const statusRes = await fetch("/api/mess/join/status");
      if (statusRes.ok) setRequestStatus(await statusRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="max-w-xl mx-auto mt-10 flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
      </div>
    );
  }

  // ── Already member ──
  if (requestStatus?.status === 'member') {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800 overflow-hidden p-8 text-center">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Already a Member!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            You are already a member of <span className="font-semibold text-slate-700 dark:text-slate-200">{requestStatus.messName}</span>.
          </p>
          <button onClick={() => router.push('/dashboard')} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Pending request ──
  if (requestStatus?.status === 'pending') {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800 overflow-hidden p-8 text-center">
          <div className="relative bg-amber-100 dark:bg-amber-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-amber-600 dark:text-amber-400" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Request Pending</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            Your join request to <span className="font-semibold text-slate-700 dark:text-slate-200">{requestStatus.messName}</span> has been sent successfully.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-xl px-4 py-3 mb-6">
            ⏳ Waiting for the mess manager to approve your request. You'll get access once approved.
          </p>
          <button 
            onClick={async () => {
              setStatusLoading(true);
              const res = await fetch("/api/mess/join/status");
              if (res.ok) setRequestStatus(await res.json());
              setStatusLoading(false);
            }}
            className="flex items-center gap-2 mx-auto text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <RefreshCw size={16} /> Check for updates
          </button>
        </div>
      </div>
    );
  }

  // ── Rejected request ──
  if (requestStatus?.status === 'rejected') {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-800 overflow-hidden p-8 text-center">
          <div className="bg-rose-100 dark:bg-rose-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Request Rejected</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your request to join <span className="font-semibold text-slate-700 dark:text-slate-200">{requestStatus.messName}</span> was rejected. Try joining another mess.
          </p>
        </div>
      </div>
    );
  }

  // ── No request yet — show join form ──
  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-8">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl">
            <UserPlus size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Join Existing Mess</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter details provided by your mess manager.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-100 dark:border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mess Name *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="e.g. Dream House Mess"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mess Password *</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 dark:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Join Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
