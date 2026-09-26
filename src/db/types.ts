export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment';

export interface Account {
  id: string;
  userId?: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  color: string;
  icon: string;
  institution?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  userId?: string;
  accountId: string;
  toAccountId?: string; // For transfers
  categoryId?: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  syncStatus?: 'synced' | 'pending' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  budgetLimit?: number; // Monthly limit in default currency
  group?: 'needs' | 'wants' | 'savings'; // 50-30-20 envelope model
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  userId?: string;
  categoryId: string;
  month: string; // YYYY-MM
  amountLimit: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId?: string;
  name: string;
  amount: number;
  categoryId?: string;
  accountId?: string;
  frequency: 'monthly' | 'yearly' | 'weekly';
  billingDay: number; // Day of month 1-31
  nextDueDate: string;
  isActive: boolean;
  icon?: string;
}

export interface SyncQueueItem {
  id?: number;
  tableName: 'accounts' | 'transactions' | 'categories' | 'budgets' | 'subscriptions';
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  payload: any;
  timestamp: string;
  status: 'pending' | 'failed';
  retryCount: number;
}
