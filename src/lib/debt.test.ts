import { simulatePayoff, type DebtLine } from './debt';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
  console.log(`[PASS] ${msg}`);
}

console.log('--- Testing Debt Payoff Engine ---');

// 1. Single Debt Test
const singleDebt: DebtLine[] = [
  { id: 'card1', name: 'Credit Card', balance: 100000, annualRatePct: 42, minimumPayment: 5000 }
];
const singleRes = simulatePayoff(singleDebt, 10000, 'snowball');
assert(singleRes.success === true, 'Single debt payoff succeeds');
if (singleRes.success) {
  assert(singleRes.plan.months > 0 && singleRes.plan.months < 24, `Single debt finishes in ${singleRes.plan.months} months`);
  assert(singleRes.plan.totalInterest > 0, `Total interest accrued is ₹${singleRes.plan.totalInterest}`);
  assert(singleRes.plan.totalPaid > 100000, `Total paid ₹${singleRes.plan.totalPaid} covers principal + interest`);
}

// 2. Budget Below Minimums Test
const shortfallRes = simulatePayoff(singleDebt, 3000, 'snowball');
assert(shortfallRes.success === false, 'Budget below minimum is rejected');
if (!shortfallRes.success && shortfallRes.error === 'BUDGET_BELOW_MINIMUMS') {
  assert(shortfallRes.shortfall === 2000, `Correct shortfall detected: ₹${shortfallRes.shortfall}`);
}

// 3. Avalanche vs Snowball Comparison Test
const multiDebts: DebtLine[] = [
  { id: 'card', name: 'HDFC Card', balance: 50000, annualRatePct: 42, minimumPayment: 2500 },
  { id: 'loan', name: 'Personal Loan', balance: 200000, annualRatePct: 14, minimumPayment: 7000 }
];
const budget = 15000;

const snowballRes = simulatePayoff(multiDebts, budget, 'snowball');
const avalancheRes = simulatePayoff(multiDebts, budget, 'avalanche');

assert(snowballRes.success === true && avalancheRes.success === true, 'Both strategies simulate successfully');

if (snowballRes.success && avalancheRes.success) {
  console.log(`Snowball: ${snowballRes.plan.months} months, Total Interest: ₹${snowballRes.plan.totalInterest}`);
  console.log(`Avalanche: ${avalancheRes.plan.months} months, Total Interest: ₹${avalancheRes.plan.totalInterest}`);

  // Avalanche mathematically saves more interest than Snowball
  assert(
    avalancheRes.plan.totalInterest <= snowballRes.plan.totalInterest,
    `Avalanche interest (₹${avalancheRes.plan.totalInterest}) is <= Snowball interest (₹${snowballRes.plan.totalInterest})`
  );

  // Snowball eliminates the smaller balance (card) first
  assert(snowballRes.plan.order[0] === 'card', 'Snowball prioritizes card (smaller balance) first');
  // Avalanche prioritizes highest APR (card @ 42%) first
  assert(avalancheRes.plan.order[0] === 'card', 'Avalanche prioritizes card (highest APR) first');
}

console.log('>>> ALL DEBT PAYOFF TESTS PASSED! <<<');
