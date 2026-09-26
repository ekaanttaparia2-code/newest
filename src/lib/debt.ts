import { round2 } from './finance';

export interface DebtLine {
  id: string;
  name: string;
  balance: number;
  annualRatePct: number;
  minimumPayment: number;
}

export interface PayoffMonth {
  month: number;
  totalBalance: number;
  totalPaid: number;
  totalInterest: number;
  perDebt: Record<string, { interest: number; payment: number; balance: number }>;
}

export interface PayoffPlan {
  strategy: 'snowball' | 'avalanche';
  months: number;
  totalInterest: number;
  totalPaid: number;
  schedule: PayoffMonth[];
  order: string[];
  payoffDateISO: string;
}

export type PayoffResult =
  | { success: true; plan: PayoffPlan }
  | { success: false; error: 'BUDGET_BELOW_MINIMUMS'; shortfall: number }
  | { success: false; error: 'NO_DEBTS' };

/**
 * Simulates debt payoff using either Snowball (lowest balance first) or Avalanche (highest APR first).
 */
export function simulatePayoff(
  debts: DebtLine[],
  monthlyBudget: number,
  strategy: 'snowball' | 'avalanche'
): PayoffResult {
  // Filter active debts with balance > 0
  const activeDebts = debts.filter(d => d.balance > 0);
  if (activeDebts.length === 0) {
    return { success: false, error: 'NO_DEBTS' };
  }

  // Calculate sum of minimum payments required
  const totalMinRequired = activeDebts.reduce((acc, d) => acc + d.minimumPayment, 0);
  if (monthlyBudget < totalMinRequired) {
    return {
      success: false,
      error: 'BUDGET_BELOW_MINIMUMS',
      shortfall: round2(totalMinRequired - monthlyBudget)
    };
  }

  // Clone debt records for mutation in simulation
  const workingDebts = activeDebts.map(d => ({
    ...d,
    currentBalance: round2(d.balance)
  }));

  // Determine payoff priority order
  const sortedOrder = [...workingDebts].sort((a, b) => {
    if (strategy === 'snowball') {
      // Ascending balance
      if (a.currentBalance !== b.currentBalance) return a.currentBalance - b.currentBalance;
      return b.annualRatePct - a.annualRatePct;
    } else {
      // Descending APR rate
      if (b.annualRatePct !== a.annualRatePct) return b.annualRatePct - a.annualRatePct;
      return a.currentBalance - b.currentBalance;
    }
  }).map(d => d.id);

  const schedule: PayoffMonth[] = [];
  let cumTotalInterest = 0;
  let cumTotalPaid = 0;
  let currentMonth = 0;
  const MAX_MONTHS = 600; // 50-year limit guard

  while (currentMonth < MAX_MONTHS) {
    const remainingDebts = workingDebts.filter(d => d.currentBalance > 0.01);
    if (remainingDebts.length === 0) break;

    currentMonth++;
    let monthPaid = 0;
    let monthInterestAccrued = 0;
    const perDebtRecord: Record<string, { interest: number; payment: number; balance: number }> = {};

    // 1. Accrue monthly interest on each remaining debt
    for (const debt of remainingDebts) {
      const monthlyRate = debt.annualRatePct / 100 / 12;
      const interest = round2(debt.currentBalance * monthlyRate);
      debt.currentBalance = round2(debt.currentBalance + interest);
      monthInterestAccrued = round2(monthInterestAccrued + interest);
      perDebtRecord[debt.id] = { interest, payment: 0, balance: debt.currentBalance };
    }
    cumTotalInterest = round2(cumTotalInterest + monthInterestAccrued);

    // 2. Pay minimums across all active debts
    let availableBudget = monthlyBudget;
    for (const debt of remainingDebts) {
      const minDue = Math.min(debt.minimumPayment, debt.currentBalance);
      debt.currentBalance = round2(debt.currentBalance - minDue);
      availableBudget = round2(availableBudget - minDue);
      monthPaid = round2(monthPaid + minDue);
      perDebtRecord[debt.id].payment = minDue;
      perDebtRecord[debt.id].balance = debt.currentBalance;
    }

    // 3. Apply surplus budget to the target debt in priority order
    for (const targetId of sortedOrder) {
      if (availableBudget <= 0.01) break;
      const targetDebt = workingDebts.find(d => d.id === targetId && d.currentBalance > 0.01);
      if (!targetDebt) continue;

      const extraPayment = Math.min(availableBudget, targetDebt.currentBalance);
      targetDebt.currentBalance = round2(targetDebt.currentBalance - extraPayment);
      availableBudget = round2(availableBudget - extraPayment);
      monthPaid = round2(monthPaid + extraPayment);
      perDebtRecord[targetDebt.id].payment = round2(perDebtRecord[targetDebt.id].payment + extraPayment);
      perDebtRecord[targetDebt.id].balance = targetDebt.currentBalance;
    }

    cumTotalPaid = round2(cumTotalPaid + monthPaid);
    const endOfMonthBalance = round2(workingDebts.reduce((sum, d) => sum + Math.max(0, d.currentBalance), 0));

    schedule.push({
      month: currentMonth,
      totalBalance: endOfMonthBalance,
      totalPaid: cumTotalPaid,
      totalInterest: cumTotalInterest,
      perDebt: perDebtRecord
    });
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + currentMonth);

  return {
    success: true,
    plan: {
      strategy,
      months: currentMonth,
      totalInterest: round2(cumTotalInterest),
      totalPaid: round2(cumTotalPaid),
      schedule,
      order: sortedOrder,
      payoffDateISO: payoffDate.toISOString()
    }
  };
}
