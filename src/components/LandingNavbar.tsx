"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Loader2, ChevronDown, User, Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function LandingNavbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsDropdownOpen(false);
    router.refresh();
  };

  return (
    <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between relative z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-2 sm:p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
          <LayoutDashboard size={20} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
          MessMaintain
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-6">
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 mr-2">
          <Link href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it works</Link>
          <Link href="contact" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</Link>
        </div>

        <ThemeToggle />

        <div className="flex items-center gap-2 sm:gap-4 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-6">
          {loading ? (
            <div className="w-10 flex justify-center">
              <Loader2 size={18} className="animate-spin text-slate-400" />
            </div>
          ) : user ? (
            /* Logged In State with Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-md border-2 border-white dark:border-slate-900">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-0.5">Logged in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">Hi Sir, {user.name}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <LayoutDashboard size={16} />
                    </div>
                    Go to Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                      <LogOut size={16} />
                    </div>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest State */
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login" className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 sm:px-0">
                Log in
              </Link>
              <Link href="/register" className="text-xs sm:text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:scale-105 transition-all shadow-lg active:scale-95">
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
