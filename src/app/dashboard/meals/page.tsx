"use client";

import { useState, useEffect, useCallback } from "react";
import { Utensils, CalendarDays, Loader2, Save, Minus, Plus, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

// ─── Types ───────────────────────────────
interface Member { _id: string; name: string; }
interface MealEntry { breakfast: number; lunch: number; dinner: number; }
type DailyState = Record<string, MealEntry>;

// ─── Compact +/- Counter ─────────────────
function Counter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 0.5))}
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-all text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 active:scale-90"
      >
        <Minus size={14} />
      </button>
      <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
        value > 0
          ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
          : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700"
      }`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 0.5)}
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-all text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-90"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────
export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Utensils className="text-indigo-600 dark:text-indigo-400" /> Meals Management
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track daily meals and view monthly summaries</p>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 inline-flex gap-1">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-5 py-2 text-sm font-medium rounded-xl transition-all ${
            activeTab === "daily" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >Daily Entry</button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-5 py-2 text-sm font-medium rounded-xl transition-all ${
            activeTab === "monthly" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >Monthly Summary</button>
      </div>

      {activeTab === "daily" ? <DailyEntry today={today} /> : <MonthlySummary />}
    </div>
  );
}

// ─── Daily Entry ─────────────────────────
function DailyEntry({ today }: { today: string }) {
  const [date, setDate] = useState(today);
  const [members, setMembers] = useState<Member[]>([]);
  const [meals, setMeals] = useState<DailyState>({});
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals?date=${date}`);
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members || []);
      setIsManager(data.isManager);
      const init: DailyState = {};
      data.members.forEach((m: Member) => { init[m._id] = { breakfast: 0, lunch: 0, dinner: 0 }; });
      // DO NOT populate with existing meals. The user wants this to be a purely additive ledger that always starts at 0.
      setMeals(init);
    } finally { setLoading(false); }
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const update = (userId: string, field: keyof MealEntry, value: number) => {
    setMeals(prev => ({ ...prev, [userId]: { ...prev[userId], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true); setMessage("");
    try {
      const mealData = Object.keys(meals).map(uid => ({
        userId: uid,
        breakfast: meals[uid].breakfast,
        lunch: meals[uid].lunch,
        dinner: meals[uid].dinner,
      }));
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, mealData }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setMessage("✓ Meals saved!");
      // Reset all to 0
      const cleared: DailyState = {};
      members.forEach(m => { cleared[m._id] = { breakfast: 0, lunch: 0, dinner: 0 }; });
      setMeals(cleared);
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage("✗ " + err.message);
    } finally { setSaving(false); }
  };

  const colTotal = (f: keyof MealEntry) => members.reduce((s, m) => s + (meals[m._id]?.[f] || 0), 0);
  const grandTotal = colTotal("breakfast") + colTotal("lunch") + colTotal("dinner");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <CalendarDays size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="font-bold text-slate-800 dark:text-white bg-transparent border-b-2 border-indigo-400 dark:border-indigo-500 focus:outline-none px-1 text-base" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {message && <span className={`text-sm font-medium ${message.startsWith("✓") ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{message}</span>}
          {isManager && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-sm ml-auto sm:ml-0">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Meals
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} /></div>
      ) : members.length === 0 ? (
        <div className="p-16 text-center text-slate-500 dark:text-slate-400">No members found.</div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-indigo-50 dark:bg-indigo-900/30 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">Member Name</th>
                  <th className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200 text-center">🌅 Breakfast</th>
                  <th className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200 text-center">☀️ Lunch</th>
                  <th className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200 text-center">🌙 Dinner</th>
                  <th className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map(member => {
                  const e = meals[member._id] || { breakfast: 0, lunch: 0, dinner: 0 };
                  const t = e.breakfast + e.lunch + e.dinner;
                  return (
                    <tr key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          {member.name}
                        </div>
                      </td>
                      <td className="px-4 py-4"><Counter value={e.breakfast} onChange={v => update(member._id, "breakfast", v)} /></td>
                      <td className="px-4 py-4"><Counter value={e.lunch} onChange={v => update(member._id, "lunch", v)} /></td>
                      <td className="px-4 py-4"><Counter value={e.dinner} onChange={v => update(member._id, "dinner", v)} /></td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center h-9 min-w-[36px] rounded-xl text-sm font-bold ${t > 0 ? "bg-indigo-600 dark:bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>{t}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800 dark:bg-slate-950 text-white font-bold border-t-2 border-slate-300 dark:border-slate-600">
                  <td className="px-6 py-4 text-sm">Daily Totals</td>
                  <td className="px-4 py-4 text-center text-indigo-300">{colTotal("breakfast")}</td>
                  <td className="px-4 py-4 text-center text-indigo-300">{colTotal("lunch")}</td>
                  <td className="px-4 py-4 text-center text-indigo-300">{colTotal("dinner")}</td>
                  <td className="px-4 py-4 text-center text-lg text-indigo-300">{grandTotal}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {members.map(member => {
              const e = meals[member._id] || { breakfast: 0, lunch: 0, dinner: 0 };
              const t = e.breakfast + e.lunch + e.dinner;
              return (
                <div key={member._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-white text-sm">{member.name}</span>
                    </div>
                    <span className={`inline-flex items-center justify-center h-8 min-w-[32px] rounded-xl text-sm font-bold ${t > 0 ? "bg-indigo-600 dark:bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>{t}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl py-2.5">
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">🌅 Breakfast</p>
                      <Counter value={e.breakfast} onChange={v => update(member._id, "breakfast", v)} />
                    </div>
                    <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl py-2.5">
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">☀️ Lunch</p>
                      <Counter value={e.lunch} onChange={v => update(member._id, "lunch", v)} />
                    </div>
                    <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl py-2.5">
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">🌙 Dinner</p>
                      <Counter value={e.dinner} onChange={v => update(member._id, "dinner", v)} />
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Mobile total */}
            <div className="p-4 bg-slate-800 dark:bg-slate-950">
              <div className="flex justify-between items-center text-white text-sm">
                <span className="font-bold">Daily Totals</span>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-300 text-xs">B:{colTotal("breakfast")}</span>
                  <span className="text-indigo-300 text-xs">L:{colTotal("lunch")}</span>
                  <span className="text-indigo-300 text-xs">D:{colTotal("dinner")}</span>
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold">{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Monthly Summary Grid ────────────────
function MonthlySummary() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const fetchMonthly = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals/monthly?year=${year}&month=${month}`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { fetchMonthly(); }, [fetchMonthly]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"><ChevronLeft size={18} /></button>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white min-w-[160px] sm:min-w-[200px] text-center">
            Monthly Meal Grid — {MONTHS[month - 1]} {year}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"><ChevronRight size={18} /></button>
        </div>
        <button onClick={fetchMonthly} className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
          <RefreshCw size={16} /> Refresh Chart
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} /></div>
      ) : !data ? (
        <div className="p-16 text-center text-slate-500 dark:text-slate-400">Failed to load data.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse min-w-full">
              <thead>
                <tr className="bg-indigo-600 dark:bg-indigo-700 text-white">
                  <th className="px-3 sm:px-4 py-3 text-left font-bold min-w-[100px] sm:min-w-[140px] border-r border-indigo-500 sticky left-0 bg-indigo-600 dark:bg-indigo-700 z-10">Member Name</th>
                  {Array.from({ length: data.daysInMonth }, (_, i) => i + 1).map(day => (
                    <th key={day} className="px-1 sm:px-2 py-3 text-center font-bold min-w-[28px] sm:min-w-[36px] border-r border-indigo-500/50">{day}</th>
                  ))}
                  <th className="px-3 sm:px-4 py-3 text-right font-bold min-w-[50px] sm:min-w-[60px] border-l border-indigo-500 sticky right-0 bg-indigo-600 dark:bg-indigo-700 z-10">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.members.map((member: any, idx: number) => {
                  const mg = data.grid?.[member._id] || {};
                  const mt: number = Object.values(mg).reduce((a: number, b: any) => a + Number(b), 0);
                  const bg = idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/40";
                  return (
                    <tr key={member._id} className={`${bg} hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors`}>
                      <td className={`px-3 sm:px-4 py-3 font-semibold text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-700 sticky left-0 z-10 text-xs sm:text-sm ${bg}`}>
                        {member.name}
                      </td>
                      {Array.from({ length: data.daysInMonth }, (_, i) => i + 1).map(day => {
                        const val = mg[String(day)] || mg[day] || 0;
                        return (
                          <td key={day} className="px-1 sm:px-2 py-3 text-center border-r border-slate-100 dark:border-slate-800">
                            {val > 0 ? <span className="font-bold text-indigo-700 dark:text-indigo-400">{val}</span> : <span className="text-slate-300 dark:text-slate-700"></span>}
                          </td>
                        );
                      })}
                      <td className={`px-3 sm:px-4 py-3 text-right font-bold text-indigo-700 dark:text-indigo-400 border-l border-slate-200 dark:border-slate-700 sticky right-0 z-10 ${bg}`}>{mt}</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-800 dark:bg-slate-950 text-white font-bold border-t-2 border-slate-400 dark:border-slate-600">
                  <td className="px-3 sm:px-4 py-3 sticky left-0 bg-slate-800 dark:bg-slate-950 z-10 text-xs sm:text-sm whitespace-nowrap">Total Mess Meals</td>
                  {Array.from({ length: data.daysInMonth }, (_, i) => i + 1).map(day => {
                    const val = data.dailyTotals?.[String(day)] || data.dailyTotals?.[day] || 0;
                    return (
                      <td key={day} className="px-1 sm:px-2 py-3 text-center border-r border-slate-700">
                        {val > 0 ? <span className="text-indigo-300">{val}</span> : <span className="text-slate-600">0</span>}
                      </td>
                    );
                  })}
                  <td className="px-3 sm:px-4 py-3 text-right text-indigo-300 sticky right-0 bg-slate-800 dark:bg-slate-950 z-10">{data.overallTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span>*Cell values = total meals (Breakfast+Lunch+Dinner) for that day.</span>
            <span className="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Overall Mess Total: {data.overallTotal}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
