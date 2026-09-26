import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Account, AccountType } from '../db/types';

export function useAccounts() {
  const accounts = useLiveQuery(async () => {
    const all = await db.accounts.toArray();
    return all.filter(acc => !acc.isArchived);
  }) || [];

  const round2 = (n: number) => Math.round(n * 100) / 100;

  // Assets: Liquid and investment accounts with positive balance
  const totalAssets = round2(
    accounts
      .filter(acc => acc.type !== 'credit' && acc.balance > 0)
      .reduce((sum, acc) => sum + acc.balance, 0)
  );

  // Liabilities: Credit card balances + negative balances on checking/cash
  const totalLiabilities = round2(
    accounts
      .filter(acc => acc.type === 'credit' || acc.balance < 0)
      .reduce((sum, acc) => sum + Math.abs(acc.balance), 0)
  );

  // Net Worth = Total Assets - Total Liabilities
  const netWorth = round2(totalAssets - totalLiabilities);

  const addAccount = async (accountData: {
    name: string;
    type: AccountType;
    balance: number;
    currency?: string;
    color?: string;
    icon?: string;
    institution?: string;
  }) => {
    const id = `acc-${Date.now()}`;
    // Credit accounts store balance as negative liability
    const rawBalance = accountData.balance || 0;
    const initialBalance = accountData.type === 'credit'
      ? -Math.abs(rawBalance)
      : rawBalance;

    const newAccount: Account = {
      id,
      name: accountData.name,
      type: accountData.type,
      balance: round2(initialBalance),
      currency: accountData.currency || 'INR',
      color: accountData.color || (accountData.type === 'credit' ? '#f43f5e' : '#3b82f6'),
      icon: accountData.icon || (accountData.type === 'credit' ? 'CreditCard' : 'Building2'),
      institution: accountData.institution || '',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.accounts.add(newAccount);
    return newAccount;
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    await db.accounts.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteAccount = async (id: string) => {
    // Soft delete / archive
    await db.accounts.update(id, {
      isArchived: true,
      updatedAt: new Date().toISOString()
    });
  };

  return {
    accounts,
    netWorth,
    totalAssets,
    totalLiabilities,
    addAccount,
    updateAccount,
    deleteAccount
  };
}
