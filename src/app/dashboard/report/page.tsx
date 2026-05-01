"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, FileText, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [reportData, setReportData] = useState<any>(null);

  const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i); // From last year to 4 years ahead

  useEffect(() => {
    const now = new Date();
    const currentMonthStr = `${monthsArr[now.getMonth()]} ${now.getFullYear()}`;
    setSelectedMonth(currentMonthStr);
  }, []);

  const fetchReport = async () => {
    if (!selectedMonth) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/report?month=${encodeURIComponent(selectedMonth)}`);
      if (!res.ok) throw new Error("Failed to fetch report data");
      const data = await res.json();
      if (!data.mess) {
        alert("No mess data found");
        setReportData(null);
        return;
      }
      setReportData(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      fetchReport();
    }
  }, [selectedMonth]);

  const generatePDF = () => {
    if (!reportData) return;
    const data = reportData;
    const doc = new jsPDF("p", "pt", "a4");

    // -- PAGE 1: OVERVIEW & MEMBER SUMMARY --
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Mess Maintain", doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Current Month Details", doc.internal.pageSize.getWidth() / 2, 60, { align: "center" });
    doc.setFontSize(16);
    doc.text(data.mess.activeMonth, doc.internal.pageSize.getWidth() / 2, 80, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Mess Name: ${data.mess.name}`, 40, 120);
    doc.setFont("helvetica", "normal");
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Date : ${today}`, doc.internal.pageSize.getWidth() - 40, 120, { align: "right" });
    doc.rect(40, 130, 200, 20);
    doc.text(`Current Balance: ${data.summary.currentBalance.toFixed(2)} tk`, 45, 144);

    let startY = 165;
    const leftColX = 40;
    const rightColX = 300;

    doc.text(`Total Meal: ${data.summary.totalMeal}`, leftColX, startY);
    doc.text(`Total Meal Cost: ${data.summary.totalMealCost.toFixed(2)} tk`, rightColX, startY);
    startY += 20;
    doc.text(`Total Deposit: ${data.summary.totalDeposit.toFixed(2)} tk`, leftColX, startY);
    doc.text(`Total Individual Cost: ${data.summary.totalIndividualCost.toFixed(2)} tk`, rightColX, startY);
    startY += 20;
    doc.text(`Total Cost: ${data.summary.totalCost.toFixed(2)} tk`, leftColX, startY);
    doc.text(`Total Shared Cost: ${data.summary.totalSharedCost.toFixed(2)} tk`, rightColX, startY);
    startY += 20;
    doc.text(`Total Meal Rate: ${data.summary.totalMealRate.toFixed(2)} tk`, rightColX, startY);

    startY += 40;
    doc.setFont("helvetica", "bold");
    doc.text("Member Summary Info", 40, startY);

    const memberTableBody = data.memberSummaries.map((m: any) => [
      m.name, m.meals, m.deposit.toFixed(2), m.mealCost.toFixed(2), m.individualCost.toFixed(2), m.sharedCost.toFixed(2), m.balance.toFixed(2)
    ]);
    memberTableBody.push([
      { content: 'TOTAL', styles: { fontStyle: 'bold' } },
      { content: data.summary.totalMeal.toString(), styles: { fontStyle: 'bold' } },
      { content: data.summary.totalDeposit.toFixed(2), styles: { fontStyle: 'bold' } },
      { content: data.summary.totalMealCost.toFixed(2), styles: { fontStyle: 'bold' } },
      { content: data.summary.totalIndividualCost.toFixed(2), styles: { fontStyle: 'bold' } },
      { content: data.summary.totalSharedCost.toFixed(2), styles: { fontStyle: 'bold' } },
      { content: data.summary.currentBalance.toFixed(2), styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
      startY: startY + 10,
      head: [['Name', 'Meals', 'Deposit', 'Meal Cost', 'Individual', 'Shared Cost', 'Balance']],
      body: memberTableBody,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center' },
      styles: { fontSize: 10, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.5 },
      margin: { top: 30, left: 40, right: 40 }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text("visit MessMaintain.com", 40, doc.internal.pageSize.getHeight() - 20);
      doc.text(new Date().toLocaleString(), doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 20, { align: "right" });
    }

    // -- PAGE 2: MEAL TABLE --
    doc.addPage("a4", "landscape");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Meal Table :", 40, 40);
    const mealHead = ['Name'];
    for (let i = 1; i <= 31; i++) mealHead.push(i.toString());
    mealHead.push('Total');
    const mealBody = data.memberSummaries.map((m: any) => {
      const row = [m.name];
      for (let i = 1; i <= 31; i++) {
        row.push(m.dailyMeals[i] !== undefined ? m.dailyMeals[i].toString() : '0');
      }
      row.push(m.meals.toString());
      return row;
    });
    mealBody.push([
      { content: 'Total Mess Meals', colSpan: 32, styles: { halign: 'center', fontStyle: 'bold' } },
      { content: data.summary.totalMeal.toString(), styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
      startY: 55,
      head: [mealHead],
      body: mealBody,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center' },
      styles: { fontSize: 8, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.5 },
      margin: { left: 20, right: 20 }
    });

    // -- PAGE 3: EXPENSES TABLES --
    doc.addPage("a4", "portrait");
    let expStartY = 40;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Meal/Bazar Cost Table :", 40, expStartY);
    const bazarBody = data.expensesByType['Bazar/Meal Cost'].map((e: any) => [e.name, e.date.split('T')[0], e.amount.toFixed(2), e.remarks]);
    bazarBody.push([
      { content: 'Total Meal Cost', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: data.summary.totalMealCost.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: '-', styles: { halign: 'center' } }
    ]);
    autoTable(doc, {
      startY: expStartY + 15, head: [['Name', 'Date', 'Amount', 'Bazar Details']], body: bazarBody, theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { fontSize: 10, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.5 },
    });

    // @ts-ignore
    expStartY = doc.lastAutoTable.finalY + 30;
    doc.setFont("helvetica", "bold");
    doc.text("Deposit Table :", 40, expStartY);
    const depositBody = data.expensesByType['Deposit'].map((e: any) => [e.name, e.date.split('T')[0], e.amount.toFixed(2), e.remarks]);
    depositBody.push([
      { content: 'Total Deposit', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: data.summary.totalDeposit.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: '', styles: { halign: 'center' } }
    ]);
    autoTable(doc, {
      startY: expStartY + 15, head: [['Name', 'Date', 'Amount', 'Remarks']], body: depositBody, theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { fontSize: 10, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.5 },
    });

    // @ts-ignore
    if (doc.lastAutoTable.finalY > doc.internal.pageSize.getHeight() - 200) { doc.addPage("a4", "portrait"); expStartY = 40; } else { expStartY = doc.lastAutoTable.finalY + 30; }
    doc.setFont("helvetica", "bold");
    doc.text("Individual Cost Table :", 40, expStartY);
    const individualBody = data.expensesByType['Individual Cost'].map((e: any) => [e.name, e.date.split('T')[0], e.amount.toFixed(2), e.remarks]);
    individualBody.push([
      { content: 'Total Individual Cost', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: data.summary.totalIndividualCost.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: '-', styles: { halign: 'center' } }
    ]);
    autoTable(doc, {
      startY: expStartY + 15, head: [['Name', 'Date', 'Amount', 'Cost Details']], body: individualBody, theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { fontSize: 10, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.5 },
    });

    // @ts-ignore
    expStartY = doc.lastAutoTable.finalY + 30;
    doc.setFont("helvetica", "bold");
    doc.text("Shared Cost Table :", 40, expStartY);
    const sharedBody = data.expensesByType['Shared Cost'].map((e: any) => [e.date.split('T')[0], e.amount.toFixed(2), e.remarks]);
    sharedBody.push([
      { content: 'Total', styles: { halign: 'center', fontStyle: 'bold' } },
      { content: data.summary.totalSharedCost.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: '-', styles: { halign: 'center' } }
    ]);
    autoTable(doc, {
      startY: expStartY + 15, head: [['Date', 'Amount', 'Cost Details']], body: sharedBody, theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { fontSize: 10, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.5 },
    });

    const newPageCount = doc.getNumberOfPages();
    for (let i = 2; i <= newPageCount; i++) {
      doc.setPage(i); doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("visit MessMaintain.com", 40, doc.internal.pageSize.getHeight() - 20); doc.text(new Date().toLocaleString(), doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 20, { align: "right" });
    }

    doc.save(`Mess_Report_${data.mess.activeMonth.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl">
            <FileText className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Monthly Report</h1>
            <p className="text-slate-500 dark:text-slate-400">View your full mess report or download it as a PDF.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-end bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Select Month
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
              >
                {yearOptions.map(y => monthsArr.map(m => (
                  <option key={`${m} ${y}`} value={`${m} ${y}`}>{m} {y}</option>
                )))}
              </select>
            </div>
          </div>

          <button
            onClick={generatePDF}
            disabled={!reportData}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Download size={20} /> Download Report PDF
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      )}

      {reportData && !loading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-8 space-y-12">

          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Mess Maintain</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Current Month Details</p>
            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{reportData.mess.activeMonth}</h2>
          </div>

          {/* Overview Stats */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="space-y-2">
              <p className="font-bold text-slate-800 dark:text-white text-lg">Mess Name: <span className="text-indigo-600 dark:text-indigo-400">{reportData.mess.name}</span></p>
              <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-4 py-2 rounded-lg font-bold inline-block border border-indigo-200 dark:border-indigo-800">
                Current Balance: ৳{reportData.summary.currentBalance.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm md:text-base text-slate-700 dark:text-slate-300 w-full md:w-auto">
              <p className="flex justify-between sm:block">Total Meal: <span className="font-bold text-slate-900 dark:text-white">{reportData.summary.totalMeal}</span></p>
              <p className="flex justify-between sm:block">Total Meal Cost: <span className="font-bold text-slate-900 dark:text-white">৳{reportData.summary.totalMealCost.toFixed(2)}</span></p>
              <p className="flex justify-between sm:block">Total Deposit: <span className="font-bold text-slate-900 dark:text-white">৳{reportData.summary.totalDeposit.toFixed(2)}</span></p>
              <p className="flex justify-between sm:block">Total Individual Cost: <span className="font-bold text-slate-900 dark:text-white">৳{reportData.summary.totalIndividualCost.toFixed(2)}</span></p>
              <p className="flex justify-between sm:block">Total Cost: <span className="font-bold text-slate-900 dark:text-white">৳{reportData.summary.totalCost.toFixed(2)}</span></p>
              <p className="flex justify-between sm:block">Total Shared Cost: <span className="font-bold text-slate-900 dark:text-white">৳{reportData.summary.totalSharedCost.toFixed(2)}</span></p>
              <p className="sm:col-span-2 text-right border-t border-slate-200 dark:border-slate-700 mt-2 pt-2 flex justify-between sm:justify-end gap-2">
                <span>Total Meal Rate:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">৳{reportData.summary.totalMealRate.toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Member Summary Info */}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Member Summary Info</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="w-full text-center text-sm border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <th className="p-3 border border-slate-200 dark:border-slate-700">Name</th>
                    <th className="p-3 border border-slate-200 dark:border-slate-700">Meals</th>
                    <th className="p-3 border border-slate-200 dark:border-slate-700">Deposit</th>
                    <th className="p-3 border border-slate-200 dark:border-slate-700">Meal Cost</th>
                    <th className="p-3 border border-slate-200 dark:border-slate-700">Individual</th>
                    <th className="p-3 border border-slate-200 dark:border-slate-700">Shared Cost</th>
                    <th className="p-3 border border-slate-200 dark:border-slate-700">Balance</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-slate-400">
                  {reportData.memberSummaries.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-white">{m.name}</td>
                      <td className="p-3 border border-slate-200 dark:border-slate-700">{m.meals}</td>
                      <td className="p-3 border border-slate-200 dark:border-slate-700">{m.deposit.toFixed(2)}</td>
                      <td className="p-3 border border-slate-200 dark:border-slate-700">{m.mealCost.toFixed(2)}</td>
                      <td className="p-3 border border-slate-200 dark:border-slate-700">{m.individualCost.toFixed(2)}</td>
                      <td className="p-3 border border-slate-200 dark:border-slate-700">{m.sharedCost.toFixed(2)}</td>
                      <td className={`p-3 border border-slate-200 dark:border-slate-700 font-bold ${m.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{m.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white">
                    <td className="p-3 border border-slate-200 dark:border-slate-700">TOTAL</td>
                    <td className="p-3 border border-slate-200 dark:border-slate-700">{reportData.summary.totalMeal}</td>
                    <td className="p-3 border border-slate-200 dark:border-slate-700">{reportData.summary.totalDeposit.toFixed(2)}</td>
                    <td className="p-3 border border-slate-200 dark:border-slate-700">{reportData.summary.totalMealCost.toFixed(2)}</td>
                    <td className="p-3 border border-slate-200 dark:border-slate-700">{reportData.summary.totalIndividualCost.toFixed(2)}</td>
                    <td className="p-3 border border-slate-200 dark:border-slate-700">{reportData.summary.totalSharedCost.toFixed(2)}</td>
                    <td className="p-3 border border-slate-200 dark:border-slate-700">{reportData.summary.currentBalance.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Meal Table */}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 text-center md:text-left">Meal Table</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="w-full text-center text-xs border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <th className="p-2 border border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-100 dark:bg-slate-800">Name</th>
                    {Array.from({ length: 31 }, (_, i) => (
                      <th key={i} className="p-2 border border-slate-200 dark:border-slate-700 w-8">{i + 1}</th>
                    ))}
                    <th className="p-2 border border-slate-200 dark:border-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-slate-400">
                  {reportData.memberSummaries.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-white sticky left-0 bg-white dark:bg-slate-900">{m.name}</td>
                      {Array.from({ length: 31 }, (_, i) => (
                        <td key={i} className="p-2 border border-slate-200 dark:border-slate-700">
                          {m.dailyMeals[i + 1] || '0'}
                        </td>
                      ))}
                      <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold bg-slate-50 dark:bg-slate-800">{m.meals}</td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-50 dark:bg-indigo-900/30 font-bold text-slate-800 dark:text-white">
                    <td colSpan={32} className="p-3 border border-slate-200 dark:border-slate-700 text-center">Total Mess Meals</td>
                    <td className="p-3 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">{reportData.summary.totalMeal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Meal/Bazar Cost Table */}
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Meal/Bazar Cost Table</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                <table className="w-full text-center text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Name</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Date</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Amount</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700 w-1/2">Bazar Details</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    {reportData.expensesByType['Bazar/Meal Cost'].map((e: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 border border-slate-200 dark:border-slate-700">{e.name}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 whitespace-nowrap">{e.date.split('T')[0]}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-medium">{e.amount.toFixed(2)}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-left">{e.remarks}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white">
                      <td colSpan={2} className="p-2 border border-slate-200 dark:border-slate-700 text-right">Total Meal Cost</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-amber-600">{reportData.summary.totalMealCost.toFixed(2)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deposit Table */}
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Deposit Table</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                <table className="w-full text-center text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Name</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Date</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Amount</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700 w-1/2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    {reportData.expensesByType['Deposit'].map((e: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 border border-slate-200 dark:border-slate-700">{e.name}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 whitespace-nowrap">{e.date.split('T')[0]}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-medium">{e.amount.toFixed(2)}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-left">{e.remarks}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white">
                      <td colSpan={2} className="p-2 border border-slate-200 dark:border-slate-700 text-right">Total Deposit</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-emerald-600">{reportData.summary.totalDeposit.toFixed(2)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Cost Table */}
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Individual Cost Table</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                <table className="w-full text-center text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Name</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Date</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Amount</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700 w-1/2">Cost Details</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    {reportData.expensesByType['Individual Cost'].map((e: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 border border-slate-200 dark:border-slate-700">{e.name}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 whitespace-nowrap">{e.date.split('T')[0]}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-medium">{e.amount.toFixed(2)}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-left">{e.remarks}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white">
                      <td colSpan={2} className="p-2 border border-slate-200 dark:border-slate-700 text-right">Total Individual Cost</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-purple-600">{reportData.summary.totalIndividualCost.toFixed(2)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shared Cost Table */}
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Shared Cost Table</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                <table className="w-full text-center text-sm border-collapse min-w-[450px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Date</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700">Amount</th>
                      <th className="p-2 border border-slate-200 dark:border-slate-700 w-1/2">Cost Details</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    {reportData.expensesByType['Shared Cost'].map((e: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 whitespace-nowrap">{e.date.split('T')[0]}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-medium">{e.amount.toFixed(2)}</td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-left">{e.remarks}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white">
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-right">Total</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-blue-600">{reportData.summary.totalSharedCost.toFixed(2)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
