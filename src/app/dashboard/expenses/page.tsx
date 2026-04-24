"use client";

import { useState, useEffect } from "react";
import { Plus, Receipt, Filter, Loader2 } from "lucide-react";

export default function ExpensesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    targetUserId: "",
    type: "Deposit",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        setMembers(data.members || []);
        setIsManager(data.isManager);
        if (data.members && data.members.length > 0) {
          setFormData(prev => ({ ...prev, targetUserId: data.members[0]._id }));
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add expense");
      }

      setShowAddForm(false);
      fetchData(); // refresh list
      setFormData(prev => ({ ...prev, amount: "", description: "" }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="text-indigo-600 dark:text-indigo-400" /> Expense Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track all your mess expenses and deposits</p>
        </div>
        {isManager && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Transaction
          </button>
        )}
      </div>

      {showAddForm && isManager && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">New Transaction</h3>
          {error && <div className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Member</label>
              <select 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                value={formData.targetUserId}
                onChange={e => setFormData({...formData, targetUserId: e.target.value})}
                required
              >
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (৳)</label>
              <input 
                type="number" 
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" 
                placeholder="0.00" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input 
                type="date" 
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input 
                type="text" 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" 
                placeholder="Optional"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No transactions found.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{expense.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{expense.userName}</td>
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
                    <td className={`px-6 py-4 font-semibold ${expense.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                      {expense.type === 'Deposit' ? '+' : ''}৳{expense.amount}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{expense.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
