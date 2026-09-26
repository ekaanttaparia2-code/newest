import type { Account, Category, TransactionType } from '../db/types';

export interface ParsedVoiceTransaction {
  amount?: number;
  type: TransactionType;
  categoryId?: string;
  categoryName?: string;
  accountId?: string;
  accountName?: string;
  toAccountId?: string;
  toAccountName?: string;
  notes: string;
  confidence: number;
}

// Spoken numbers
const WORD_TO_NUMBER: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  lakh: 100000, lac: 100000, crore: 10000000, crores: 10000000
};

export function parseNaturalLanguageInput(
  rawInput: string,
  categories: Category[],
  accounts: Account[]
): ParsedVoiceTransaction {
  const text = rawInput.trim();
  const lowerText = text.toLowerCase();
  // Strip commas inside numbers (e.g., "1,200" -> "1200", "1,250.50" -> "1250.50")
  const normalizedText = lowerText.replace(/(\d+),(\d{2,3})/g, '$1$2');

  // 1. Detect Transaction Type
  let type: TransactionType = 'expense';
  if (
    lowerText.includes('transfer') ||
    lowerText.includes('moved') ||
    (lowerText.includes('from') && lowerText.includes('to') && (lowerText.includes('savings') || lowerText.includes('checking') || lowerText.includes('fd')))
  ) {
    type = 'transfer';
  } else if (
    lowerText.includes('received') ||
    lowerText.includes('got paid') ||
    lowerText.includes('earned') ||
    lowerText.includes('deposit') ||
    lowerText.includes('credited') ||
    lowerText.includes('salary') ||
    lowerText.includes('income') ||
    lowerText.includes('cashback') ||
    lowerText.includes('dividend')
  ) {
    type = 'income';
  }

  // 2. Extract Amount (Handles ₹, Rs, INR, k, lakh, crore, decimals, commas)
  let amount: number | undefined;

  const croreMatch = normalizedText.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/i);
  const lakhMatch = normalizedText.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)\b/i);
  const kMatch = normalizedText.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  const standardNumericMatch = normalizedText.match(/(?:[₹$€£]|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)(?:\s*(?:rupees|rupee|rs|bucks|dollars|inr))?/i);

  if (croreMatch && croreMatch[1]) {
    amount = parseFloat(croreMatch[1]) * 10000000;
  } else if (lakhMatch && lakhMatch[1]) {
    amount = parseFloat(lakhMatch[1]) * 100000;
  } else if (kMatch && kMatch[1]) {
    amount = parseFloat(kMatch[1]) * 1000;
  } else if (standardNumericMatch && standardNumericMatch[1]) {
    amount = parseFloat(standardNumericMatch[1]);
  } else {
    // Word-based parsing
    const words = lowerText.split(/\s+/);
    let totalWordSum = 0;
    let currentPart = 0;
    let foundNumber = false;

    for (const w of words) {
      const cleanW = w.replace(/[^a-z]/g, '');
      if (WORD_TO_NUMBER[cleanW] !== undefined) {
        foundNumber = true;
        const val = WORD_TO_NUMBER[cleanW];
        if (val === 100) {
          currentPart = (currentPart || 1) * 100;
        } else if (val === 1000) {
          totalWordSum += (currentPart || 1) * 1000;
          currentPart = 0;
        } else if (val === 100000) {
          totalWordSum += (currentPart || 1) * 100000;
          currentPart = 0;
        } else if (val === 10000000) {
          totalWordSum += (currentPart || 1) * 10000000;
          currentPart = 0;
        } else {
          currentPart += val;
        }
      } else if (foundNumber && (cleanW === 'rupees' || cleanW === 'rupee' || cleanW === 'rs' || cleanW === 'dollars')) {
        break;
      }
    }
    totalWordSum += currentPart;
    if (foundNumber && totalWordSum > 0) {
      amount = totalWordSum;
    }
  }

  // 3. Match Account (including UPI, GPay, PhonePe, Paytm, HDFC, SBI, ICICI, etc.)
  let matchedAccount: Account | undefined;
  let matchedToAccount: Account | undefined;

  // Find all accounts mentioned in sentence with their character position
  const accountHits = accounts.flatMap(acc => {
    const accName = acc.name.toLowerCase();
    const accType = acc.type.toLowerCase();
    const indices: { account: Account; index: number }[] = [];
    const nameIdx = lowerText.indexOf(accName);
    if (nameIdx !== -1) indices.push({ account: acc, index: nameIdx });
    const typeIdx = lowerText.indexOf(accType);
    if (typeIdx !== -1 && !indices.some(i => i.account.id === acc.id)) {
      indices.push({ account: acc, index: typeIdx });
    }
    return indices;
  }).sort((a, b) => a.index - b.index);

  if (type === 'transfer' && accountHits.length >= 2) {
    const fromIdx = lowerText.indexOf('from ');
    const toIdx = lowerText.indexOf('to ');
    if (fromIdx !== -1 && toIdx !== -1) {
      if (fromIdx < toIdx) {
        // "from X to Y"
        const sourceHit = accountHits.find(h => h.index > fromIdx && h.index < toIdx);
        const destHit = accountHits.find(h => h.index > toIdx);
        if (sourceHit && destHit && sourceHit.account.id !== destHit.account.id) {
          matchedAccount = sourceHit.account;
          matchedToAccount = destHit.account;
        }
      } else {
        // "to Y from X"
        const destHit = accountHits.find(h => h.index > toIdx && h.index < fromIdx);
        const sourceHit = accountHits.find(h => h.index > fromIdx);
        if (sourceHit && destHit && sourceHit.account.id !== destHit.account.id) {
          matchedAccount = sourceHit.account;
          matchedToAccount = destHit.account;
        }
      }
    }
    if (!matchedAccount || !matchedToAccount) {
      matchedAccount = accountHits[0]?.account;
      matchedToAccount = accountHits.find(h => h.account.id !== matchedAccount?.id)?.account;
    }
  } else if (accountHits.length > 0) {
    matchedAccount = accountHits[0].account;
  }

  // Common aliases
  if (!matchedAccount) {
    if (lowerText.includes('upi') || lowerText.includes('gpay') || lowerText.includes('phonepe') || lowerText.includes('paytm')) {
      matchedAccount = accounts.find(a => a.type === 'checking') || accounts.find(a => a.type === 'cash');
    } else if (lowerText.includes('card') || lowerText.includes('credit')) {
      matchedAccount = accounts.find(a => a.type === 'credit');
    } else if (lowerText.includes('cash') || lowerText.includes('wallet')) {
      matchedAccount = accounts.find(a => a.type === 'cash');
    } else if (lowerText.includes('savings') || lowerText.includes('fd')) {
      matchedAccount = accounts.find(a => a.type === 'savings');
    } else if (lowerText.includes('bank') || lowerText.includes('checking') || lowerText.includes('salary')) {
      matchedAccount = accounts.find(a => a.type === 'checking');
    }
  }

  if (!matchedAccount && accounts.length > 0) {
    matchedAccount = accounts.find(a => a.type === 'checking') || accounts[0];
  }

  // 4. Match Category (including Indian categories: Chai, Kirana, Swiggy, Zomato, Auto, Metro, Petrol)
  let matchedCategory: Category | undefined;
  const filteredCategories = categories.filter(c => c.type === type);

  const keywordCategoryMap: Record<string, string[]> = {
    'cat-food': ['chai', 'coffee', 'tea', 'lunch', 'dinner', 'breakfast', 'swiggy', 'zomato', 'restaurant', 'cafe', 'biryani', 'pizza', 'snacks', 'eating', 'food'],
    'cat-groceries': ['kirana', 'blinkit', 'zepto', 'instamart', 'groceries', 'vegetables', 'sabzi', 'milk', 'fruit', 'supermarket', 'd mart', 'ration'],
    'cat-housing': ['rent', 'maintenance', 'flat', 'apartment', 'house rent'],
    'cat-transport': ['auto', 'rickshaw', 'cab', 'uber', 'ola', 'rapido', 'metro', 'petrol', 'fuel', 'diesel', 'toll', 'bus', 'train', 'irctc'],
    'cat-utilities': ['electricity bill', 'water bill', 'mobile bill', 'cylinder', 'gas', 'recharge', 'wifi', 'broadband', 'airtel', 'jio', 'electricity'],
    'cat-entertainment': ['movie', 'bookmyshow', 'pvr', 'theatre', 'gaming', 'concert', 'outing'],
    'cat-tech': ['netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'chatgpt', 'software'],
    'cat-health': ['apollo', 'pharmacy', 'medicines', 'medicine', 'doctor', 'clinic', 'hospital', 'gym', 'cult', 'medical', 'consultation'],
    'cat-shopping': ['amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'electronics', 'mall', 'shopping'],
    'cat-salary': ['salary', 'paycheck', 'bonus', 'stipend', 'incentive'],
    'cat-freelance': ['client', 'freelance', 'project', 'consulting', 'gig'],
    'cat-cashback': ['cashback', 'reward', 'refund'],
    'cat-investments': ['sip', 'mutual fund', 'zerodha', 'groww', 'stocks', 'dividend', 'fd interest', 'crypto']
  };

  // Direct name match
  for (const cat of filteredCategories) {
    if (lowerText.includes(cat.name.toLowerCase())) {
      matchedCategory = cat;
      break;
    }
  }

  // Keyword match (longest-phrase first)
  if (!matchedCategory) {
    const allKeyPairs: { catId: string; kw: string }[] = [];
    for (const [catId, keywords] of Object.entries(keywordCategoryMap)) {
      for (const kw of keywords) {
        allKeyPairs.push({ catId, kw });
      }
    }
    allKeyPairs.sort((a, b) => b.kw.length - a.kw.length);

    for (const { catId, kw } of allKeyPairs) {
      if (new RegExp(`\\b${kw}\\b`, 'i').test(lowerText)) {
        matchedCategory = categories.find(c => c.id === catId);
        if (matchedCategory) break;
      }
    }
  }

  if (!matchedCategory && type !== 'transfer') {
    matchedCategory = type === 'expense'
      ? categories.find(c => c.id === 'cat-food') || filteredCategories[0]
      : categories.find(c => c.id === 'cat-salary') || filteredCategories[0];
  }

  // 5. Clean Description / Notes
  let notes = text;
  notes = notes
    .replace(/^(?:please\s+)?(?:can\s+you\s+)?(?:log|add|record|spent|i\s+spent|paid|bought|received|credited)\s+/i, '')
    .replace(/(?:from|with|using|into|to|via)\s+(?:my\s+)?(?:upi|gpay|phonepe|paytm|checking|savings|card|credit\s+card|cash|wallet)\b/gi, '')
    .replace(/(?:for|of)?\s*(?:[₹$€£]|rs\.?|inr)?\s*\d+(?:\.\d{1,2})?(?:\s*(?:rupees|rupee|rs|bucks|dollars|cents|k|lakh|lakhs))?/gi, '')
    .trim();

  if (notes.length > 0) {
    notes = notes.charAt(0).toUpperCase() + notes.slice(1);
  } else {
    notes = matchedCategory ? matchedCategory.name : 'Quick Log';
  }

  return {
    amount: amount ? Math.round(amount * 100) / 100 : undefined,
    type,
    categoryId: matchedCategory?.id,
    categoryName: matchedCategory?.name,
    accountId: matchedAccount?.id,
    accountName: matchedAccount?.name,
    toAccountId: matchedToAccount?.id,
    toAccountName: matchedToAccount?.name,
    notes,
    confidence: amount !== undefined ? 0.95 : 0.6
  };
}
