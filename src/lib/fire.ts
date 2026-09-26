import { round2 } from './finance';

export interface FireInputs {
  currentLiquidAssets: number;
  currentInvestments: number;
  monthlyIncome: number;
  monthlyBurn: number;
  safeWithdrawalRate?: number; // e.g., 0.04 (4%)
  annualReturnRate?: number;    // e.g., 0.11 (11% nominal)
  inflationRate?: number;       // e.g., 0.06 (6% inflation)
}

export type RunwayStatus = 'critical' | 'fair' | 'strong' | 'fortress';

export interface RunwayResult {
  runwayMonths: number;
  status: RunwayStatus;
  label: string;
  badgeColor: string;
  monthlyBurn: number;
  liquidAssets: number;
}

export interface FireMilestone {
  label: string;
  description: string;
  targetAmount: number;
  percentAchieved: number;
  multiplier: number;
}

export interface FireProjectionPoint {
  year: number;
  age?: number;
  projectedWealth: number;
  fiTarget: number;
  investedCapital: number;
}

export interface FireResult {
  runway: RunwayResult;
  monthlySavings: number;
  savingsRatePct: number;
  annualExpenses: number;
  standardFiNumber: number;
  leanFiNumber: number;
  fatFiNumber: number;
  currentNetWorth: number;
  percentToFi: number;
  yearsToFi: number | null; // null if negative savings rate and wealth < target
  projection: FireProjectionPoint[];
}

/**
 * Calculates emergency runway based on liquid cash/bank balances and monthly expense burn.
 */
export function calculateRunway(liquidAssets: number, monthlyBurn: number): RunwayResult {
  const safeBurn = Math.max(0, monthlyBurn);
  const safeLiquid = Math.max(0, liquidAssets);

  if (safeBurn <= 0) {
    return {
      runwayMonths: 999,
      status: 'fortress',
      label: 'Infinite Runway (No Monthly Burn)',
      badgeColor: '#10B981',
      monthlyBurn: 0,
      liquidAssets: round2(safeLiquid)
    };
  }

  const runwayMonths = round2(safeLiquid / safeBurn);

  let status: RunwayStatus = 'critical';
  let label = 'Critical (< 3 Months)';
  let badgeColor = '#EF4444';

  if (runwayMonths >= 12) {
    status = 'fortress';
    label = 'Fortress Grade (12+ Months)';
    badgeColor = '#10B981';
  } else if (runwayMonths >= 6) {
    status = 'strong';
    label = 'Strong Runway (6-12 Months)';
    badgeColor = '#3B82F6';
  } else if (runwayMonths >= 3) {
    status = 'fair';
    label = 'Fair (3-6 Months)';
    badgeColor = '#F59E0B';
  }

  return {
    runwayMonths,
    status,
    label,
    badgeColor,
    monthlyBurn: round2(safeBurn),
    liquidAssets: round2(safeLiquid)
  };
}

/**
 * Calculates Financial Independence milestones, years to FI, and 30-year projections.
 */
export function calculateFire(inputs: FireInputs): FireResult {
  const swr = inputs.safeWithdrawalRate ?? 0.04;
  const nominalReturn = inputs.annualReturnRate ?? 0.11;
  const inflation = inputs.inflationRate ?? 0.06;

  // Real annualized rate of return (Fisher equation): (1 + r) / (1 + i) - 1
  const realReturnRate = Math.max(0.001, (1 + nominalReturn) / (1 + inflation) - 1);
  const monthlyRealRate = Math.pow(1 + realReturnRate, 1 / 12) - 1;

  const monthlyBurn = Math.max(0, inputs.monthlyBurn);
  const monthlyIncome = Math.max(0, inputs.monthlyIncome);
  const monthlySavings = round2(monthlyIncome - monthlyBurn);
  const savingsRatePct = monthlyIncome > 0 ? round2((Math.max(0, monthlySavings) / monthlyIncome) * 100) : 0;

  const annualExpenses = round2(monthlyBurn * 12);
  const standardFiNumber = swr > 0 ? round2(annualExpenses / swr) : 0;
  const leanFiNumber = round2(standardFiNumber * 0.75);
  const fatFiNumber = round2(standardFiNumber * 1.5);

  const currentLiquid = Math.max(0, inputs.currentLiquidAssets);
  const currentInvestments = Math.max(0, inputs.currentInvestments);
  const currentNetWorth = round2(currentLiquid + currentInvestments);

  const runway = calculateRunway(currentLiquid, monthlyBurn);

  const percentToFi = standardFiNumber > 0
    ? Math.min(100, round2((currentNetWorth / standardFiNumber) * 100))
    : 100;

  // Solve for years to FI using monthly compound simulation up to 40 years (480 months)
  let monthsToReach = 0;
  let simulatedNetWorth = currentNetWorth;
  let yearsToFi: number | null = null;

  if (currentNetWorth >= standardFiNumber) {
    yearsToFi = 0;
  } else {
    for (let m = 1; m <= 480; m++) {
      // Net worth grows by real monthly return, plus monthly savings added at end of month
      simulatedNetWorth = simulatedNetWorth * (1 + monthlyRealRate) + monthlySavings;
      if (simulatedNetWorth >= standardFiNumber) {
        monthsToReach = m;
        yearsToFi = round2(monthsToReach / 12);
        break;
      }
      if (simulatedNetWorth <= 0 && monthlySavings <= 0) {
        break;
      }
    }
  }

  // Generate 30-year projection trajectory
  const projection: FireProjectionPoint[] = [];
  let wealth = currentNetWorth;
  let invested = currentNetWorth;

  for (let y = 0; y <= 30; y++) {
    projection.push({
      year: y,
      projectedWealth: round2(wealth),
      fiTarget: standardFiNumber,
      investedCapital: round2(invested)
    });

    // Advance 1 year (12 months)
    for (let m = 0; m < 12; m++) {
      wealth = wealth * (1 + monthlyRealRate) + monthlySavings;
      invested += Math.max(0, monthlySavings);
      if (wealth < 0) wealth = 0;
    }
  }

  return {
    runway,
    monthlySavings,
    savingsRatePct,
    annualExpenses,
    standardFiNumber,
    leanFiNumber,
    fatFiNumber,
    currentNetWorth,
    percentToFi,
    yearsToFi,
    projection
  };
}
