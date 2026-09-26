import { parseNaturalLanguageInput } from './nlpParser';
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from '../db/defaultData';

const categories = DEFAULT_CATEGORIES as any;
const accounts = DEFAULT_ACCOUNTS as any;

const testCases = [
  {
    input: 'Spent 20 rupees on chai with cash',
    expectedAmount: 20,
    expectedType: 'expense',
    expectedCategory: 'cat-food'
  },
  {
    input: 'Paid 650 for Swiggy with credit card',
    expectedAmount: 650,
    expectedType: 'expense',
    expectedCategory: 'cat-food'
  },
  {
    input: 'Received 85000 salary into savings',
    expectedAmount: 85000,
    expectedType: 'income',
    expectedCategory: 'cat-salary'
  },
  {
    input: 'Spent 1.5 lakh on bike',
    expectedAmount: 150000,
    expectedType: 'expense'
  },
  {
    input: 'Transferred 15k from checking to savings',
    expectedAmount: 15000,
    expectedType: 'transfer'
  },
  {
    input: '₹450 for Blinkit groceries',
    expectedAmount: 450,
    expectedType: 'expense',
    expectedCategory: 'cat-groceries'
  },
  {
    input: 'Spent 1,200 on groceries',
    expectedAmount: 1200,
    expectedType: 'expense',
    expectedCategory: 'cat-groceries'
  },
  {
    input: 'Paid 1,250.50 for medicines',
    expectedAmount: 1250.50,
    expectedType: 'expense',
    expectedCategory: 'cat-health'
  },
  {
    input: 'transferred 5000 from checking to savings',
    expectedAmount: 5000,
    expectedType: 'transfer',
    expectedAccount: 'acc-checking',
    expectedToAccount: 'acc-savings'
  },
  {
    input: 'moved 2000 to savings from checking',
    expectedAmount: 2000,
    expectedType: 'transfer',
    expectedAccount: 'acc-checking',
    expectedToAccount: 'acc-savings'
  },
  {
    input: 'Spent 1.2 crore on flat',
    expectedAmount: 12000000,
    expectedType: 'expense',
    expectedCategory: 'cat-housing'
  }
];

let allPassed = true;

for (const tc of testCases) {
  const res = parseNaturalLanguageInput(tc.input, categories, accounts);
  const amountOk = res.amount === tc.expectedAmount;
  const typeOk = res.type === tc.expectedType;
  const catOk = !tc.expectedCategory || res.categoryId === tc.expectedCategory;
  const accOk = !(tc as any).expectedAccount || res.accountId === (tc as any).expectedAccount;
  const toAccOk = !(tc as any).expectedToAccount || res.toAccountId === (tc as any).expectedToAccount;

  if (amountOk && typeOk && catOk && accOk && toAccOk) {
    console.log(`[PASS] "${tc.input}" -> Amount: ₹${res.amount}, Type: ${res.type}, Category: ${res.categoryName || res.categoryId || 'N/A'}`);
  } else {
    console.error(`[FAIL] "${tc.input}" -> Result:`, res);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n>>> ALL INDIAN RUPEE & NLP TESTS PASSED! <<<');
} else {
  throw new Error('Some tests failed');
}
