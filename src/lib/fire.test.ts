import { calculateRunway, calculateFire } from './fire';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${msg}`);
  }
  console.log(`[PASS] ${msg}`);
}

console.log('--- Testing FIRE & Emergency Runway Engine ---');

// 1. Runway Calculation Tests
const rZero = calculateRunway(100000, 0);
assert(rZero.runwayMonths === 999, 'Runway with 0 burn is infinite');
assert(rZero.status === 'fortress', 'Status is fortress for 0 burn');

const rCrit = calculateRunway(50000, 30000);
assert(rCrit.runwayMonths === 1.67, 'Runway 50k / 30k = 1.67 months');
assert(rCrit.status === 'critical', '1.67 months is marked as critical (< 3 mo)');

const rStrong = calculateRunway(240000, 30000);
assert(rStrong.runwayMonths === 8, 'Runway 240k / 30k = 8 months');
assert(rStrong.status === 'strong', '8 months is strong (6-12 mo)');

const rFortress = calculateRunway(500000, 30000);
assert(rFortress.runwayMonths === 16.67, 'Runway 500k / 30k = 16.67 months');
assert(rFortress.status === 'fortress', '16.67 months is fortress (12+ mo)');

// 2. FIRE Target Calculation Tests
const fire1 = calculateFire({
  currentLiquidAssets: 200000,
  currentInvestments: 800000,
  monthlyIncome: 100000,
  monthlyBurn: 40000,
  safeWithdrawalRate: 0.04, // 4% SWR (25x)
  annualReturnRate: 0.12,
  inflationRate: 0.06
});

assert(fire1.annualExpenses === 480000, 'Annual expenses 40k * 12 = 4,80,000');
assert(fire1.standardFiNumber === 12000000, 'Standard FI (25x) = 1,20,00,000 (1.2 Cr)');
assert(fire1.leanFiNumber === 9000000, 'Lean FI (75%) = 90,00,000');
assert(fire1.fatFiNumber === 18000000, 'Fat FI (150%) = 1,80,00,000');
assert(fire1.currentNetWorth === 1000000, 'Net worth = 2L + 8L = 10L');
assert(fire1.monthlySavings === 60000, 'Monthly savings = 100k - 40k = 60k');
assert(fire1.savingsRatePct === 60, 'Savings rate = 60%');
assert(fire1.percentToFi === 8.33, 'Progress to FI is 10L / 120L = 8.33%');
assert(fire1.yearsToFi !== null && fire1.yearsToFi > 0 && fire1.yearsToFi < 15, `Years to FI is reasonable: ${fire1.yearsToFi} yrs`);
assert(fire1.projection.length === 31, 'Projection covers 30 years (31 data points)');
assert(fire1.projection[0].projectedWealth === 1000000, 'Year 0 wealth equals starting net worth');

console.log('>>> ALL FIRE & RUNWAY TESTS PASSED! <<<');
