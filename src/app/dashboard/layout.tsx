"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Receipt, Utensils, Settings, LogOut, Loader2, Menu, X, PlusCircle, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [hasMess, setHasMess] = useState<boolean | null>(null); // null = not fetched yet
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user and mess status in parallel
        const [userRes, dashRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/dashboard")
        ]);

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        setUser(userData.user);

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          // If mess is null, user is not part of any mess
          setHasMess(!!dashData.mess);
        } else {
          setHasMess(false);
        }
      } catch (err) {
        console.error("Failed to fetch layout data", err);
        setHasMess(false);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router, pathname]); // Re-check on pathname change so after creating/joining mess sidebar updates

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={40} />
      </div>
    );
  }

  // Sidebar items shown only when user HAS a mess
  const messMenuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Meals", href: "/dashboard/meals", icon: <Utensils size={20} /> },
    { name: "Expenses", href: "/dashboard/expenses", icon: <Receipt size={20} /> },
    { name: "Members", href: "/dashboard/members", icon: <Users size={20} /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  // Items shown only when user does NOT have a mess
  const noMessMenuItems = [
    { name: "Create Mess", href: "/dashboard/create-mess", icon: <PlusCircle size={20} />, color: "text-indigo-600 dark:text-indigo-400" },
    { name: "Join Mess", href: "/dashboard/join-mess", icon: <UserPlus size={20} />, color: "text-emerald-600 dark:text-emerald-400" },
  ];

  const allMenuItems = [...messMenuItems, ...noMessMenuItems];
  const currentItem = allMenuItems.find(i => i.href === pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 z-20 md:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            <LayoutDashboard /> MessMaintain
          </div>
          <button className="md:hidden text-slate-500 dark:text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 overflow-y-auto">
          {hasMess ? (
            // ── User HAS a mess: show full navigation ──
            <nav className="space-y-1">
              {messMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    pathname === item.href 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </nav>
          ) : (
            // ── User has NO mess: show only Create/Join options ──
            <div>
              <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Get Started
              </p>
              <nav className="space-y-2">
                <Link
                  href="/dashboard/create-mess"
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium border ${
                    pathname === "/dashboard/create-mess"
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                      : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-indigo-100 dark:border-indigo-900/50"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <PlusCircle size={20} /> Create Mess
                </Link>
                <Link
                  href="/dashboard/join-mess"
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium border ${
                    pathname === "/dashboard/join-mess"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/50"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <UserPlus size={20} /> Join Mess
                </Link>
              </nav>

              <div className="mt-6 mx-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/50">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  You are not part of any mess yet. Create or join a mess to unlock all features.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button className="md:hidden mr-4 text-slate-600 dark:text-slate-400" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden md:block">
              {currentItem?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
