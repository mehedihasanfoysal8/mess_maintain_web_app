"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Receipt, Search, ChevronLeft, ChevronRight, X, Loader2, Calendar, User, DollarSign, FileText } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Modal Component ───────────────────────────────────────────
function AddExpenseModal({ 
  isOpen, 
  onClose, 
  members, 
  onSubmit, 
  submitting 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  members: any[]; 
  onSubmit: (data: any) => Promise<void>;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState({
    targetUserId: "",
    type: "Deposit",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (members.length > 0 && !formData.targetUserId) {
      setFormData(prev => ({ ...prev, targetUserId: members[0]._id }));
    }
  }, [members]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(formData);
      setFormData({
        targetUserId: members[0]?._id || "",
        type: "Deposit",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: ""
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Plus className="text-indigo-600 dark:text-indigo-400" size={24} /> Add New Expense
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Select Member
              </label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                value={formData.targetUserId}
                onChange={e => setFormData({...formData, targetUserId: e.target.value})}
                required
              >
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <Receipt size={16} className="text-slate-400" /> Type
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Bazar/Meal Cost">Bazar/Meal Cost</option>
                  <option value="Shared Cost">Shared Cost</option>
                  <option value="Individual Cost">Individual Cost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" /> Date
                </label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <DollarSign size={16} className="text-slate-400" /> Amount (৳)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold" 
                  placeholder="0.00" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <FileText size={16} className="text-slate-400" /> Description
              </label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none h-20" 
                placeholder="Brief details about this transaction..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-4 rounded-2xl text-base font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = ["All", "Deposit", "Bazar/Meal Cost", "Individual Cost", "Shared Cost"];

  const fetchData = async () => {
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        setMembers(data.members || []);
        setIsManager(data.isManager);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (formData: any) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add expense");
      
      await fetchData();
    } catch (err: any) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Data
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(exp => {
        const matchesTab = activeTab === "All" || exp.type === activeTab;
        const matchesSearch = 
          exp.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          exp.amount.toString().includes(searchQuery);
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest first
  }, [expenses, activeTab, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on filter/search change
  }, [activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={40} />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <Receipt className="text-white" size={24} />
            </div>
            Expense Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Manage all financial activities of your mess</p>
        </div>
        {isManager && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none active:scale-[0.98]"
          >
            <Plus size={20} className="transition-transform group-hover:rotate-90" /> 
            Add Expenses
          </button>
        )}
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar gap-1 w-full lg:w-auto p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, desc..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-100/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="px-8 py-5">Date & Member</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-8 py-5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                        <Receipt size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No transactions found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((expense) => (
                  <tr key={expense._id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                          {expense.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{expense.userName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} /> {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border",
                        expense.type === 'Deposit' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30',
                        expense.type === 'Bazar/Meal Cost' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30',
                        expense.type === 'Shared Cost' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30',
                        expense.type === 'Individual Cost' && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/30'
                      )}>
                        {expense.type}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className={cn(
                        "text-lg font-black",
                        expense.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      )}>
                        {expense.type === 'Deposit' ? '+' : ''}৳{expense.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate font-medium">
                        {expense.description || <span className="text-slate-300 italic">No description</span>}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredExpenses.length > 0 && (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="text-slate-900 dark:text-white font-bold">{filteredExpenses.length === 0 ? 0 : Math.min(filteredExpenses.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredExpenses.length, currentPage * itemsPerPage)}</span> of <span className="text-slate-900 dark:text-white font-bold">{filteredExpenses.length}</span> transactions
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center gap-2 min-w-[100px] px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-black text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-md active:scale-95"
              >
                <ChevronLeft size={20} strokeWidth={3} /> PREV
              </button>
              <div className="hidden sm:flex items-center gap-1.5">
                {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-11 h-11 rounded-xl text-sm font-black transition-all shadow-md active:scale-95",
                      currentPage === page 
                        ? "bg-indigo-600 text-white shadow-indigo-300 dark:shadow-none" 
                        : "text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center gap-2 min-w-[100px] px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-black text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-md active:scale-95"
              >
                NEXT <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        members={members}
        onSubmit={handleAddExpense}
        submitting={submitting}
      />
    </div>
  );
}
