import type { Category, Account } from './types';

export const DEFAULT_CATEGORIES: Omit<Category, 'userId'>[] = [
  // Expenses (Needs / Wants / Savings 50-30-20 model)
  { id: 'cat-housing', name: 'House Rent & Maintenance', type: 'expense', icon: 'Home', color: '#3b82f6', budgetLimit: 25000, group: 'needs', isDefault: true },
  { id: 'cat-groceries', name: 'Groceries & Kirana (Blinkit)', type: 'expense', icon: 'ShoppingCart', color: '#10b981', budgetLimit: 10000, group: 'needs', isDefault: true },
  { id: 'cat-utilities', name: 'Bills, Electricity & Wifi', type: 'expense', icon: 'Zap', color: '#06b6d4', budgetLimit: 3500, group: 'needs', isDefault: true },
  { id: 'cat-health', name: 'Health & Pharmacy', type: 'expense', icon: 'HeartPulse', color: '#ef4444', budgetLimit: 3000, group: 'needs', isDefault: true },
  { id: 'cat-transport', name: 'Transport, Cab & Petrol', type: 'expense', icon: 'Car', color: '#8b5cf6', budgetLimit: 6000, group: 'needs', isDefault: true },
  { id: 'cat-food', name: 'Food & Dining (Swiggy/Chai)', type: 'expense', icon: 'Utensils', color: '#f59e0b', budgetLimit: 12000, group: 'wants', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment & Outings', type: 'expense', icon: 'Film', color: '#ec4899', budgetLimit: 2500, group: 'wants', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping & E-Commerce', type: 'expense', icon: 'ShoppingBag', color: '#f97316', budgetLimit: 8000, group: 'wants', isDefault: true },
  { id: 'cat-tech', name: 'Subscriptions & OTT', type: 'expense', icon: 'Cpu', color: '#6366f1', budgetLimit: 1500, group: 'wants', isDefault: true },
  { id: 'cat-investments-out', name: 'Monthly SIP & Mutual Funds', type: 'expense', icon: 'TrendingUp', color: '#14b8a6', budgetLimit: 20000, group: 'savings', isDefault: true },


  // Income
  { id: 'cat-salary', name: 'Salary & Monthly Payroll', type: 'income', icon: 'Briefcase', color: '#10b981', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance & Consulting', type: 'income', icon: 'Laptop', color: '#06b6d4', isDefault: true },
  { id: 'cat-investments', name: 'Dividends & Stock Profits', type: 'income', icon: 'TrendingUp', color: '#8b5cf6', isDefault: true },
  { id: 'cat-cashback', name: 'Cashback & Rewards', type: 'income', icon: 'Gift', color: '#ec4899', isDefault: true },
  { id: 'cat-other-income', name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#64748b', isDefault: true }
];

export const DEFAULT_ACCOUNTS: Omit<Account, 'userId'>[] = [
  {
    id: 'acc-checking',
    name: 'HDFC Salary Account',
    type: 'checking',
    currency: 'INR',
    balance: 58400.00,
    color: '#3b82f6',
    icon: 'Building2',
    institution: 'HDFC Bank',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-savings',
    name: 'SBI Savings & FD',
    type: 'savings',
    currency: 'INR',
    balance: 245000.00,
    color: '#10b981',
    icon: 'Vault',
    institution: 'State Bank of India',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-credit',
    name: 'ICICI Coral Card',
    type: 'credit',
    currency: 'INR',
    balance: -12450.00,
    color: '#f43f5e',
    icon: 'CreditCard',
    institution: 'ICICI Bank',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-cash',
    name: 'UPI Wallet & Cash',
    type: 'cash',
    currency: 'INR',
    balance: 3500.00,
    color: '#f59e0b',
    icon: 'Banknote',
    institution: 'UPI / Cash',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
