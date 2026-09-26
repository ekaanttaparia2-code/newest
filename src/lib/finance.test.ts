import { calculateRealValue, simulateSip } from './finance';

console.log('--- Testing Finance & SIP Engine ---');

// 1. Test Fisher Deflation
const nominal = 100000;
const inflation = 6;
const years = 10;
const real = calculateRealValue(nominal, inflation, years);
const expectedReal = Math.round(100000 / Math.pow(1.06, 10)); // 55839
if (real === expectedReal) {
  console.log(`[PASS] calculateRealValue: ₹1,00,000 at 6% over 10 yrs = ₹${real}`);
} else {
  throw new Error(`[FAIL] calculateRealValue: Expected ${expectedReal}, got ${real}`);
}

// 2. Test Zero Inflation Edge Case
const realZero = calculateRealValue(50000, 0, 5);
if (realZero === 50000) {
  console.log(`[PASS] calculateRealValue (0% inflation): ₹${realZero}`);
} else {
  throw new Error(`[FAIL] calculateRealValue 0%: Expected 50000, got ${realZero}`);
}

// 3. Test Standard SIP Simulation (10k/mo, 12% return, 10 years, 6% inflation, 0% step-up)
const result = simulateSip({
  initialMonthlyDeposit: 10000,
  annualReturnRate: 12,
  years: 10,
  annualInflationRate: 6,
  annualStepUpPercent: 0,
  isAnnuityDue: false
});

if (result.totalNominalInvested === 1200000) {
  console.log(`[PASS] simulateSip: 10-yr invested capital = ₹${result.totalNominalInvested}`);
} else {
  throw new Error(`[FAIL] Expected 1200000 invested, got ${result.totalNominalInvested}`);
}

if (result.finalNominalWealth > 2200000 && result.finalNominalWealth < 2400000) {
  console.log(`[PASS] simulateSip: Nominal wealth = ₹${result.finalNominalWealth}`);
} else {
  throw new Error(`[FAIL] Unexpected nominal wealth: ${result.finalNominalWealth}`);
}

if (result.finalRealWealth < result.finalNominalWealth && result.finalRealWealth > 1100000) {
  console.log(`[PASS] simulateSip: Real purchasing power = ₹${result.finalRealWealth} (Retains ${result.purchasingPowerRetainedPercent}%)`);
} else {
  throw new Error(`[FAIL] Unexpected real wealth: ${result.finalRealWealth}`);
}

// 4. Test Step-Up SIP (10k/mo with 10% annual hike)
const stepUpResult = simulateSip({
  initialMonthlyDeposit: 10000,
  annualReturnRate: 12,
  years: 2,
  annualInflationRate: 6,
  annualStepUpPercent: 10,
  isAnnuityDue: false
});

if (stepUpResult.totalNominalInvested === 252000) {
  console.log(`[PASS] simulateSip Step-Up: 2-yr invested capital = ₹${stepUpResult.totalNominalInvested}`);
} else {
  throw new Error(`[FAIL] Expected 252000 invested with step-up, got ${stepUpResult.totalNominalInvested}`);
}

console.log('>>> ALL FINANCIAL SIMULATOR TESTS PASSED! <<<');
