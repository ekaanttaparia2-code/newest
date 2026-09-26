/**
 * Pure Financial Math & Wealth Simulator Engine
 * Standards:
 * - Indian Mutual Fund / SIP standard: Monthly compounding
 * - Fisher equation deflation for real purchasing power: Real FV = Nominal FV / (1 + i)^n
 * - Step-Up SIP: Monthly investment increases by stepUpPercent at the end of each 12-month period
 */

export interface SipYearData {
  year: number;
  yearLabel: string;
  monthlyDeposit: number;
  nominalInvested: number;
  nominalWealth: number;
  nominalReturns: number;
  realWealth: number; // Inflation-adjusted (purchasing power in today's money)
  realReturns: number;
}

export interface SipSimulationResult {
  totalNominalInvested: number;
  finalNominalWealth: number;
  finalNominalReturns: number;
  finalRealWealth: number;
  finalRealReturns: number;
  purchasingPowerRetainedPercent: number;
  wealthMultiplier: string;
  chartData: SipYearData[];
}

/**
 * Calculates real (inflation-adjusted) value of a future nominal amount using Fisher deflation.
 * @param nominalAmount The future nominal value in currency
 * @param annualInflationRate Annual inflation rate as percentage (e.g., 6 for 6%)
 * @param years Number of years in the future
 */
export function calculateRealValue(
  nominalAmount: number,
  annualInflationRate: number,
  years: number
): number {
  if (annualInflationRate <= 0 || years <= 0) return nominalAmount;
  const inflationFactor = Math.pow(1 + annualInflationRate / 100, years);
  return Math.round(nominalAmount / inflationFactor);
}

/**
 * Runs a comprehensive SIP simulation supporting monthly compounding, annual Step-Up %, and inflation adjustment.
 */
export function simulateSip({
  initialMonthlyDeposit,
  annualReturnRate,
  years,
  annualInflationRate = 6,
  annualStepUpPercent = 0,
  isAnnuityDue = false // false = End of month (standard Indian SIP), true = Start of month
}: {
  initialMonthlyDeposit: number;
  annualReturnRate: number;
  years: number;
  annualInflationRate?: number;
  annualStepUpPercent?: number;
  isAnnuityDue?: boolean;
}): SipSimulationResult {
  const monthlyRate = annualReturnRate / 100 / 12;
  const totalMonths = years * 12;

  let currentMonthlyDeposit = initialMonthlyDeposit;
  let totalInvested = 0;
  let totalWealth = 0;

  const chartData: SipYearData[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Apply step-up at the start of each new year (from month 13, 25, etc.)
    if (annualStepUpPercent > 0 && m > 1 && (m - 1) % 12 === 0) {
      currentMonthlyDeposit = Math.round(currentMonthlyDeposit * (1 + annualStepUpPercent / 100));
    }

    totalInvested += currentMonthlyDeposit;

    if (isAnnuityDue) {
      // Start of month: deposit earns returns this month
      totalWealth = (totalWealth + currentMonthlyDeposit) * (1 + monthlyRate);
    } else {
      // End of month (standard Indian SIP convention): interest on previous balance + deposit added at end
      totalWealth = totalWealth * (1 + monthlyRate) + currentMonthlyDeposit;
    }

    // Capture checkpoint at each year-end
    if (m % 12 === 0) {
      const yr = m / 12;
      const roundedInvested = Math.round(totalInvested);
      const roundedWealth = Math.round(totalWealth);
      const roundedReturns = Math.max(0, roundedWealth - roundedInvested);
      const realWealth = calculateRealValue(roundedWealth, annualInflationRate, yr);
      const realReturns = Math.max(0, realWealth - roundedInvested);

      chartData.push({
        year: yr,
        yearLabel: `Yr ${yr}`,
        monthlyDeposit: currentMonthlyDeposit,
        nominalInvested: roundedInvested,
        nominalWealth: roundedWealth,
        nominalReturns: roundedReturns,
        realWealth,
        realReturns
      });
    }
  }

  const finalNominalWealth = Math.round(totalWealth);
  const totalNominalInvested = Math.round(totalInvested);
  const finalNominalReturns = Math.max(0, finalNominalWealth - totalNominalInvested);
  const finalRealWealth = calculateRealValue(finalNominalWealth, annualInflationRate, years);
  const finalRealReturns = Math.max(0, finalRealWealth - totalNominalInvested);
  const purchasingPowerRetainedPercent = finalNominalWealth > 0
    ? Math.round((finalRealWealth / finalNominalWealth) * 100)
    : 100;
  const wealthMultiplier = totalNominalInvested > 0
    ? (finalNominalWealth / totalNominalInvested).toFixed(1)
    : '1.0';

  return {
    totalNominalInvested,
    finalNominalWealth,
    finalNominalReturns,
    finalRealWealth,
    finalRealReturns,
    purchasingPowerRetainedPercent,
    wealthMultiplier,
    chartData
  };
}

export const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

