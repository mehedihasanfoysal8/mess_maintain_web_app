import mongoose from 'mongoose';
import Mess from '@/models/Mess';
import Meal from '@/models/Meal';
import Expense from '@/models/Expense';

export function parseMonthString(monthString: string): Date | null {
  if (!monthString) return null;
  const parts = monthString.trim().split(/\s+/);
  if (parts.length >= 2) {
    const monthName = parts[0];
    const yearName = parts[1];
    const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthNum = monthsArr.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (monthNum >= 0) {
      return new Date(parseInt(yearName), monthNum, 1);
    }
  }
  // Fallback for "21/8/2006"
  if (monthString.includes('/')) {
    const parts = monthString.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, 1);
    }
  }
  return null;
}

export function isUserActiveInMonth(userSettings: any, targetMonth: string): boolean {
  if (!userSettings || !userSettings.activePeriods || userSettings.activePeriods.length === 0) {
    return true; // Default to true for backward compatibility
  }
  
  const targetDate = parseMonthString(targetMonth);
  if (!targetDate) return true;

  for (const period of userSettings.activePeriods) {
    const startDate = parseMonthString(period.startMonth);
    const endDate = period.endMonth ? parseMonthString(period.endMonth) : null;
    
    if (!startDate) continue;
    
    // Active if targetDate >= startDate AND (endDate is null OR targetDate < endDate)
    if (targetDate >= startDate) {
      if (!endDate || targetDate < endDate) {
        return true;
      }
    }
  }
  
  return false;
}

export function getMonthsBetween(startMonthStr: string, endMonthStr: string): string[] {
  const start = parseMonthString(startMonthStr);
  const end = parseMonthString(endMonthStr);
  if (!start || !end || start > end) return [];
  
  const months = [];
  const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  let current = new Date(start);
  while (current <= end) {
    months.push(`${monthsArr[current.getMonth()]} ${current.getFullYear()}`);
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

export async function calculatePreviousBalances(messId: string, currentMonth: string, initialMonth: string) {
  // We want balances up to the month BEFORE currentMonth
  const targetDate = parseMonthString(currentMonth);
  if (!targetDate) return {};

  targetDate.setMonth(targetDate.getMonth() - 1);
  const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const previousMonthStr = `${monthsArr[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

  const monthsToProcess = getMonthsBetween(initialMonth, previousMonthStr);
  if (monthsToProcess.length === 0) return {};

  const messObjectId = new mongoose.Types.ObjectId(messId);
  const mess = await Mess.findById(messObjectId).lean();
  if (!mess) return {};

  const meals = await Meal.find({ messId: messObjectId, month: { $in: monthsToProcess } }).lean();
  const expenses = await Expense.find({ messId: messObjectId, month: { $in: monthsToProcess } }).lean();

  const userBalances: Record<string, number> = {};

  // Initialize balances for all ever-members
  mess.members.forEach((m: any) => {
    userBalances[m.toString()] = 0;
  });

  for (const month of monthsToProcess) {
    const monthMeals = meals.filter((m: any) => m.month === month);
    const monthExpenses = expenses.filter((e: any) => e.month === month);

    let messMealCost = 0;
    let totalSharedCost = 0;
    let totalMeals = 0;

    const memberStats: Record<string, any> = {};

    const activeMembersCount = mess.members.filter((memberId: any) => {
      const uIdStr = memberId.toString();
      const settings = mess.memberSettings?.find((s: any) => s.userId.toString() === uIdStr);
      return isUserActiveInMonth(settings, month);
    }).length;

    monthExpenses.forEach((exp: any) => {
      if (exp.type === 'Bazar/Meal Cost') messMealCost += exp.amount;
      else if (exp.type === 'Shared Cost') totalSharedCost += exp.amount;
      
      const uId = exp.userId.toString();
      if (!memberStats[uId]) memberStats[uId] = { meals: 0, deposit: 0, individualCost: 0 };
      
      if (exp.type === 'Deposit') memberStats[uId].deposit += exp.amount;
      else if (exp.type === 'Individual Cost') memberStats[uId].individualCost += exp.amount;
    });

    monthMeals.forEach((m: any) => {
      const uId = m.userId.toString();
      if (!memberStats[uId]) memberStats[uId] = { meals: 0, deposit: 0, individualCost: 0 };
      
      const mealCount = Math.max((m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0), m.mealCount || 0);
      memberStats[uId].meals += mealCount;
      totalMeals += mealCount;
    });

    const mealRate = totalMeals > 0 ? (messMealCost / totalMeals) : 0;
    const sharedCostPerPerson = activeMembersCount > 0 ? (totalSharedCost / activeMembersCount) : 0;

    mess.members.forEach((memberId: any) => {
      const uId = memberId.toString();
      const settings = mess.memberSettings?.find((s: any) => s.userId.toString() === uId);
      const isActive = isUserActiveInMonth(settings, month);
      
      const stat = memberStats[uId] || { meals: 0, deposit: 0, individualCost: 0 };
      
      const myMealCost = stat.meals * mealRate;
      const mySharedCost = isActive ? sharedCostPerPerson : 0; // Only pay shared cost if active
      const myTotalCost = myMealCost + mySharedCost + stat.individualCost;
      
      // Add previous balance (already in userBalances), plus this month's deposit, minus this month's cost
      userBalances[uId] = (userBalances[uId] || 0) + stat.deposit - myTotalCost;
    });
  }

  return userBalances;
}
