"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, UserPlus, AlertCircle, Loader2, ChevronLeft, ChevronRight, PieChart as PieChartIcon, BarChart2, List, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export default function DashboardIndex() {
  const [data, setData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("");
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const now = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthStr = `${months[now.getMonth()]} ${now.getFullYear()}`;
    setSelectedMonth(currentMonthStr);
  }, []);

  const fetchData = async (month: string) => {
    setLoading(true);
    try {
      const [dashRes, expRes] = await Promise.all([
        fetch(`/api/dashboard?month=${encodeURIComponent(month)}`),
        fetch("/api/expenses")
      ]);
      
      if (dashRes.ok) {
        const dashJson = await dashRes.json();
        setData(dashJson);
      }
      if (expRes.ok) {
        const expJson = await expRes.json();
        setExpenses(expJson.expenses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      fetchData(selectedMonth);
    }
  }, [selectedMonth]);

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
      </div>
    );
  }

  if (!data?.mess && !loading) {
    return (
      <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center text-center py-20">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-6">
          <AlertCircle size={48} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Welcome to MessMaintain!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-10 text-lg">
          It looks like you aren't part of any mess yet. You can either create a new mess as a manager, or join an existing one as a member.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/dashboard/create-mess" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all text-left block">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 w-14 h-14 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <PlusCircle size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Create New Mess</h3>
            <p className="text-slate-500 dark:text-slate-400">Set up a new shared space, invite members, and start tracking expenses automatically.</p>
          </Link>
          
          <Link href="/dashboard/join-mess" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all text-left block">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 w-14 h-14 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <UserPlus size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Join Existing Mess</h3>
            <p className="text-slate-500 dark:text-slate-400">Already have a mess? Enter the name and password provided by your manager to join.</p>
          </Link>
        </div>
      </div>
    );
  }

  const { mess, personal, summary } = data || { mess: {}, personal: {}, summary: {} };

  // Months for selector
  const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i); // From last year to 4 years ahead

  // Pie Chart Data
  const pieData = [
    { name: 'Bazar/Meal Cost', value: summary?.messMealCost || 0 },
    { name: 'Shared Cost', value: summary?.totalSharedCost || 0 },
    { name: 'Individual Cost', value: summary?.messIndividualCost || 0 },
  ].filter(d => d.value > 0);
  const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

  // Bar Chart Data (Grouping expenses by date)
  const groupedByDate = expenses.reduce((acc: any, exp: any) => {
    const d = exp.date.split('T')[0];
    if (!acc[d]) acc[d] = { date: d, Cost: 0, Deposit: 0 };
    if (exp.type === 'Deposit') {
      acc[d].Deposit += exp.amount;
    } else {
      acc[d].Cost += exp.amount;
    }
    return acc;
  }, {});
  
  const barData = Object.values(groupedByDate)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-15);

  // Sorting and Pagination Logic
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = sortedExpenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Mess Overview Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-700 dark:to-violet-800 rounded-[2rem] p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-indigo-100 dark:text-indigo-200 font-bold uppercase tracking-widest text-xs bg-white/10 px-3 py-1 rounded-full">Active Mess</p>
            {loading && <Loader2 className="animate-spin text-white/50" size={16} />}
          </div>
          <h2 className="text-4xl font-black">{mess.name}</h2>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl border border-white/10">
              <p className="text-sm text-indigo-100 font-medium">Viewing:</p>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-bold text-white outline-none border-none cursor-pointer focus:ring-0 appearance-none pr-6 relative"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1rem' }}
              >
                {yearOptions.map(y => monthsArr.map(m => (
                  <option key={`${m} ${y}`} value={`${m} ${y}`} className="text-slate-900">{m} {y}</option>
                )))}
              </select>
            </div>
            
            {mess.activeMonth !== selectedMonth && (
              <p className="text-xs text-indigo-200/80 italic">Default mess month: {mess.activeMonth}</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 md:mt-0 flex gap-6 bg-white/10 dark:bg-black/20 p-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-inner relative z-10">
          <div className="text-center px-2">
            <p className="text-xs text-indigo-200 mb-2 font-bold uppercase tracking-tighter">Your Role</p>
            <p className="text-xl font-black">{mess.role}</p>
          </div>
          <div className="w-px bg-white/20"></div>
          <div className="text-center px-2">
            <p className="text-xs text-indigo-200 mb-2 font-bold uppercase tracking-tighter">Members</p>
            <p className="text-xl font-black">{mess.membersCount}</p>
          </div>
        </div>
      </div>

      {/* Personal Stats */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" /> Personal Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="My Deposit" value={`৳${personal.myDeposit}`} bg="bg-blue-50 dark:bg-blue-900/20" color="text-blue-700 dark:text-blue-400" borderColor="border-blue-100 dark:border-blue-800/50" />
          <StatCard title="My Meals" value={`${personal.myMeals}`} bg="bg-emerald-50 dark:bg-emerald-900/20" color="text-emerald-700 dark:text-emerald-400" borderColor="border-emerald-100 dark:border-emerald-800/50" />
          <StatCard title="Meal Rate" value={`৳${personal.mealRate}`} bg="bg-amber-50 dark:bg-amber-900/20" color="text-amber-700 dark:text-amber-400" borderColor="border-amber-100 dark:border-amber-800/50" />
          <StatCard title="Balance" value={`${personal.balance >= 0 ? '+' : ''}৳${personal.balance}`} bg={personal.balance >= 0 ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-rose-50 dark:bg-rose-900/20"} color={personal.balance >= 0 ? "text-indigo-700 dark:text-indigo-400" : "text-rose-700 dark:text-rose-400"} borderColor={personal.balance >= 0 ? "border-indigo-100 dark:border-indigo-800/50" : "border-rose-100 dark:border-rose-800/50"} />
        </div>
      </div>

      {/* Mess Summary Statistics */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mess Summary</h3>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            <SummaryItem label="Total Meals" value={`${summary.totalMeals}`} />
            <SummaryItem label="Total Deposits" value={`৳${summary.totalDeposits}`} color="text-emerald-600 dark:text-emerald-400" />
            <SummaryItem label="Mess Meal Cost" value={`৳${summary.messMealCost}`} color="text-rose-600 dark:text-rose-400" />
            <SummaryItem label="Total Shared Cost" value={`৳${summary.totalSharedCost}`} color="text-rose-600 dark:text-rose-400" />
            
            <div className="hidden md:block col-span-4 h-px bg-slate-100 dark:bg-slate-800"></div>
            
            <SummaryItem label="Individual Cost" value={`৳${summary.messIndividualCost}`} color="text-rose-600 dark:text-rose-400" />
            <SummaryItem label="Total All Cost" value={`৳${summary.totalAllCost}`} color="text-indigo-600 dark:text-indigo-400" />
            <SummaryItem label="Mess Balance" value={`${summary.messBalance >= 0 ? '+' : ''}৳${summary.messBalance}`} color={summary.messBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
            <SummaryItem label="Total Members" value={`${summary.totalMembers}`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <PieChartIcon size={20} className="text-indigo-600 dark:text-indigo-400" /> Cost Breakdown
          </h3>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `৳${value}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                No cost data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Overview Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-indigo-600 dark:text-indigo-400" /> Activity Overview
          </h3>
          <div className="h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val}`} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Deposit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Cost" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                No activity data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions with Pagination */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <List size={20} className="text-indigo-600 dark:text-indigo-400" /> Recent Transactions
          </h3>
          <Link href="/dashboard/expenses" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No transactions found.</td>
                </tr>
              ) : (
                paginatedExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{expense.date.split('T')[0]}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{expense.userName || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border
                        ${expense.type === 'Deposit' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : ''}
                        ${expense.type === 'Bazar/Meal Cost' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/50' : ''}
                        ${expense.type === 'Shared Cost' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' : ''}
                        ${expense.type === 'Individual Cost' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800/50' : ''}
                      `}>
                        {expense.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-semibold text-right ${expense.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                      {expense.type === 'Deposit' ? '+' : ''}৳{expense.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-800 dark:text-white">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-medium text-slate-800 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, expenses.length)}</span> of <span className="font-medium text-slate-800 dark:text-white">{expenses.length}</span> transactions
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, color = "text-slate-800 dark:text-white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatCard({ title, value, bg, color, borderColor }: { title: string, value: string, bg: string, color: string, borderColor: string }) {
  return (
    <div className={`${bg} p-6 rounded-2xl border ${borderColor} shadow-sm transition-all hover:scale-[1.02]`}>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
