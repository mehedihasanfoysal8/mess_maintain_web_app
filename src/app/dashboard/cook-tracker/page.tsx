"use client";

import { useState, useEffect, useMemo } from "react";
import { ChefHat, DollarSign, Loader2, Utensils, PiggyBank, Receipt, CalendarDays, Check, X, User, Phone, FileText, CheckCircle2 } from "lucide-react";
import MonthDropdown from "@/components/MonthDropdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CookTrackerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [updatingMeal, setUpdatingMeal] = useState("");

  // States
  const [cookName, setCookName] = useState("");
  const [cookPhone, setCookPhone] = useState("");
  const [salary, setSalary] = useState<number>(0);
  const [tempSalary, setTempSalary] = useState<string>("");
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [meals, setMeals] = useState<any[]>([]);
  const [isManager, setIsManager] = useState(false);

  // Month filter
  const [selectedMonth, setSelectedMonth] = useState("");
  const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);

  useEffect(() => {
    const now = new Date();
    const currentMonthStr = `${monthsArr[now.getMonth()]} ${now.getFullYear()}`;
    setSelectedMonth(currentMonthStr);
  }, []);

  const fetchData = async (month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cook-tracker?month=${encodeURIComponent(month)}`);
      if (res.ok) {
        const data = await res.json();
        setIsManager(data.isManager);
        setCookName(data.cookName || "");
        setCookPhone(data.cookPhone || "");
        setSalary(data.salary);
        setTempSalary(data.salary.toString());
        setIsPaid(data.isPaid);
        setNotes(data.notes || "");
        setMeals(data.meals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) fetchData(selectedMonth);
  }, [selectedMonth]);

  const handleSettingsSave = async (updates: any) => {
    setUpdatingSettings(true);
    try {
      const res = await fetch("/api/cook-tracker/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, ...updates }),
      });
      if (!res.ok) throw new Error("Failed to update");

      // Update local state based on what was saved
      if (updates.salary !== undefined) setSalary(updates.salary);
      if (updates.isPaid !== undefined) setIsPaid(updates.isPaid);
      if (updates.cookName !== undefined) setCookName(updates.cookName);
      if (updates.cookPhone !== undefined) setCookPhone(updates.cookPhone);
      if (updates.notes !== undefined) setNotes(updates.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const onSalaryBlur = () => {
    const numSalary = Number(tempSalary);
    if (isNaN(numSalary) || numSalary < 0) {
      setTempSalary(salary.toString());
      return;
    }
    if (numSalary !== salary) {
      handleSettingsSave({ salary: numSalary });
    }
  };

  const togglePaidStatus = () => {
    const newState = !isPaid;
    setIsPaid(newState);
    handleSettingsSave({ isPaid: newState });
  };

  const handleMealToggle = async (date: string, field: 'afternoonCooked' | 'nightCooked', currentValue: boolean) => {
    setUpdatingMeal(date);
    try {
      const existingMeal = meals.find(m => m.date === date) || { date, afternoonCooked: true, nightCooked: true };
      const payload = {
        month: selectedMonth,
        date,
        afternoonCooked: field === 'afternoonCooked' ? !currentValue : existingMeal.afternoonCooked,
        nightCooked: field === 'nightCooked' ? !currentValue : existingMeal.nightCooked,
      };

      const res = await fetch("/api/cook-tracker", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMeals(prev => {
          const index = prev.findIndex(m => m.date === date);
          if (index > -1) {
            const newMeals = [...prev];
            newMeals[index] = payload;
            return newMeals;
          }
          return [...prev, payload];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingMeal("");
    }
  };

  // Calculations & Absences
  const { totalMeals, costPerMeal, missedMeals, totalSaved, finalPayment, daysData, absencesList } = useMemo(() => {
    let tDays = 30;
    let monthNum = 1;
    let yearNum = currentYear;

    if (selectedMonth) {
      const [m, y] = selectedMonth.split(" ");
      monthNum = monthsArr.indexOf(m) + 1;
      yearNum = parseInt(y);
      if (monthNum > 0 && yearNum) tDays = new Date(yearNum, monthNum, 0).getDate();
    }

    const tMeals = tDays * 2;
    const cpm = tMeals > 0 ? salary / tMeals : 0;
    let mMeals = 0;
    const dData = [];
    const absList: string[] = [];

    for (let i = 1; i <= tDays; i++) {
      const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const existing = meals.find(m => m.date === dateStr);

      const afternoonCooked = existing ? existing.afternoonCooked : true;
      const nightCooked = existing ? existing.nightCooked : true;

      const displayDate = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!afternoonCooked && !nightCooked) {
        mMeals += 2;
        absList.push(`${displayDate} (দুপুর ও রাত)`);
      } else if (!afternoonCooked) {
        mMeals += 1;
        absList.push(`${displayDate} (দুপুর)`);
      } else if (!nightCooked) {
        mMeals += 1;
        absList.push(`${displayDate} (রাত)`);
      }

      dData.push({ date: dateStr, dayNumber: i, afternoonCooked, nightCooked });
    }

    return {
      totalMeals: tMeals,
      costPerMeal: cpm,
      missedMeals: mMeals,
      totalSaved: mMeals * cpm,
      finalPayment: salary - (mMeals * cpm),
      daysData: dData,
      absencesList: absList
    };
  }, [selectedMonth, salary, meals, currentYear, monthsArr]);

  if (loading && !salary) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={40} />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading cook tracker...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none">
              <ChefHat className="text-white" size={24} />
            </div>
            Cooking Tracker
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Manage cook profile, track meals, and calculate payments.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Month:</span>
            <div className="relative w-48 bg-indigo-600 dark:bg-indigo-700 rounded-xl">
              <MonthDropdown selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} monthsArr={monthsArr} yearOptions={yearOptions} width="w-full" />
            </div>
          </div>
          
          <button 
            onClick={togglePaidStatus}
            disabled={!isManager || updatingSettings}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center border",
              isManager && "active:scale-95 cursor-pointer hover:opacity-90",
              !isManager && "cursor-default opacity-80",
              isPaid 
                ? "bg-emerald-500 text-white border-emerald-600" 
                : "bg-indigo-600 text-white border-indigo-700"
            )}
          >
            {isPaid ? <><CheckCircle2 size={18} /> Salary Paid</> : <><Receipt size={18} /> Mark as Paid</>}
          </button>
        </div>
      </div>

      {/* Top Section: Profile & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Cook Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
            <User className="text-indigo-500" size={20} /> Cook Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Rahima Khala"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium disabled:opacity-70"
                value={cookName}
                onChange={e => setCookName(e.target.value)}
                onBlur={() => handleSettingsSave({ cookName })}
                onKeyDown={e => e.key === 'Enter' && handleSettingsSave({ cookName })}
                disabled={!isManager || updatingSettings}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium disabled:opacity-70"
                  value={cookPhone}
                  onChange={e => setCookPhone(e.target.value)}
                  onBlur={() => handleSettingsSave({ cookPhone })}
                  onKeyDown={e => e.key === 'Enter' && handleSettingsSave({ cookPhone })}
                  disabled={!isManager || updatingSettings}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes / Advance Tracker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
            <FileText className="text-indigo-500" size={20} /> Remarks & Notes
          </h3>
          <textarea
            placeholder={isManager ? "Write down if she took an advance, or asked for leave next week..." : "No remarks."}
            className="w-full flex-1 min-h-[80px] bg-amber-50/50 dark:bg-amber-900/10 text-slate-900 dark:text-white p-3 rounded-xl border border-amber-200 dark:border-amber-900/30 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm resize-none disabled:opacity-70"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => handleSettingsSave({ notes })}
            disabled={!isManager}
          />
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Monthly Salary Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-slate-100 dark:text-slate-800/50 group-hover:scale-110 transition-transform">
            <DollarSign size={80} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <DollarSign size={16} /> Monthly Salary
            </p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-2xl font-black text-slate-800 dark:text-white">৳</span>
              <input
                type="number"
                className={cn(
                  "w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-2xl font-black px-3 py-1 rounded-xl outline-none border transition-all disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:px-0",
                  updatingSettings ? "border-indigo-400 opacity-50" : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                )}
                value={tempSalary}
                onChange={e => setTempSalary(e.target.value)}
                onBlur={onSalaryBlur}
                onKeyDown={e => e.key === 'Enter' && onSalaryBlur()}
                disabled={!isManager || updatingSettings}
              />
            </div>
          </div>
        </div>

        {/* Cost Per Meal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-slate-100 dark:text-slate-800/50 group-hover:scale-110 transition-transform">
            <Utensils size={80} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Utensils size={16} /> Cost Per Meal
            </p>
            <div className="mt-auto">
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                ৳{costPerMeal.toFixed(2)}
              </p>
              <p className="text-xs font-bold text-slate-400 mt-1">Based on {totalMeals} meals</p>
            </div>
          </div>
        </div>

        {/* Total Saved */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-slate-100 dark:text-slate-800/50 group-hover:scale-110 transition-transform">
            <PiggyBank size={80} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <PiggyBank size={16} /> Total Deduction
            </p>
            <div className="mt-auto flex justify-between items-end">
              <p className="text-2xl font-black text-emerald-500">
                ৳{totalSaved.toFixed(2)}
              </p>
              <p className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {missedMeals} meals missed
              </p>
            </div>
          </div>
        </div>

        {/* Final Payment */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-slate-100 dark:text-slate-800/50 group-hover:scale-110 transition-transform">
            <Receipt size={80} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Receipt size={16} /> Final Payment
            </p>
            <div className="mt-auto">
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                ৳{finalPayment.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Absences & Daily Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

        {/* Absences Summary Banner */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarDays className="text-indigo-500" size={20} /> Absences Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">A quick view of the meals missed this month.</p>
          </div>

          <div className="flex-1 w-full sm:w-auto max-h-24 overflow-y-auto no-scrollbar pr-2">
            {absencesList.length === 0 ? (
              <div className="bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> No absences recorded this month! 🎉
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                {absencesList.map((absence, i) => (
                  <span key={i} className="bg-rose-100/50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 px-3 py-1 rounded-lg text-xs font-bold border border-rose-200/50 dark:border-rose-800/30">
                    {absence}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 bg-slate-50/30 dark:bg-slate-900/50">
          {daysData.map((day) => {
            const isLoading = updatingMeal === day.date;
            return (
              <div
                key={day.date}
                className={cn(
                  "border rounded-xl p-4 transition-all relative overflow-hidden",
                  (!day.afternoonCooked || !day.nightCooked)
                    ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-800/50"
                )}
              >
                {(!day.afternoonCooked || !day.nightCooked) && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500 flex items-center justify-center rounded-bl-xl text-white font-black text-xs">
                    -
                  </div>
                )}

                <div className="flex justify-between items-center mb-3">
                  <span className="font-black text-slate-700 dark:text-slate-200 text-lg">
                    {day.dayNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {new Date(day.date).toLocaleDateString('bn-BD', { weekday: 'short' })}
                  </span>
                </div>

                <div className="space-y-2 relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                      <Loader2 className="animate-spin text-indigo-500" size={20} />
                    </div>
                  )}

                  <button
                    onClick={() => handleMealToggle(day.date, 'afternoonCooked', day.afternoonCooked)}
                    disabled={!isManager || isLoading}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all border",
                      isManager && !isLoading && "hover:opacity-90 active:scale-95",
                      !isManager && "cursor-default",
                      day.afternoonCooked
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                        : "bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-200 dark:shadow-none"
                    )}
                  >
                    <span>☀️ দুপুর</span>
                    {day.afternoonCooked ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                  </button>

                  <button
                    onClick={() => handleMealToggle(day.date, 'nightCooked', day.nightCooked)}
                    disabled={!isManager || isLoading}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all border",
                      isManager && !isLoading && "hover:opacity-90 active:scale-95",
                      !isManager && "cursor-default",
                      day.nightCooked
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                        : "bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-200 dark:shadow-none"
                    )}
                  >
                    <span>🌙 রাত</span>
                    {day.nightCooked ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
