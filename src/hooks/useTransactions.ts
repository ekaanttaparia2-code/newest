import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Transaction, TransactionType } from '../db/types';

export interface TransactionFilter {
  searchQuery?: string;
  type?: TransactionType | 'all';
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export function useTransactions(filter?: TransactionFilter) {
  const transactions = useLiveQuery(async () => {
    let collection = db.transactions.orderBy('date').reverse();
    let results = await collection.toArray();

    if (filter) {
      if (filter.type && filter.type !== 'all') {
        results = results.filter(t => t.type === filter.type);
      }
      if (filter.accountId) {
        results = results.filter(t => t.accountId === filter.accountId || t.toAccountId === filter.accountId);
      }
      if (filter.categoryId) {
        results = results.filter(t => t.categoryId === filter.categoryId);
      }
      if (filter.startDate) {
        results = results.filter(t => new Date(t.date) >= new Date(filter.startDate!));
      }
      if (filter.endDate) {
        results = results.filter(t => new Date(t.date) <= new Date(filter.endDate!));
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        results = results.filter(t => 
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q))) ||
          t.amount.toString().includes(q)
        );
      }
    }

    return results;
  }, [filter?.searchQuery, filter?.type, filter?.accountId, filter?.categoryId, filter?.startDate, filter?.endDate]) || [];

  const addTransaction = async (data: {
    accountId: string;
    toAccountId?: string;
    categoryId?: string;
    amount: number;
    type: TransactionType;
    date?: string;
    notes?: string;
    tags?: string[];
    receiptUrl?: string;
  }) => {
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const sanitizedAmount = round2(data.amount);

    if (isNaN(sanitizedAmount) || sanitizedAmount <= 0) {
      throw new Error('Transaction amount must be a positive number');
    }

    if (data.type === 'transfer') {
      if (!data.toAccountId) {
        throw new Error('Transfer requires a destination account');
      }
      if (data.toAccountId === data.accountId) {
        throw new Error('Source and destination accounts must be different');
      }
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      amount: sanitizedAmount,
      type: data.type,
      accountId: data.accountId,
      toAccountId: data.type === 'transfer' ? data.toAccountId : undefined,
      categoryId: data.type !== 'transfer' ? data.categoryId : undefined,
      date: data.date || new Date().toISOString(),
      notes: data.notes || '',
      tags: data.tags || [],
      receiptUrl: data.receiptUrl,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Atomic transaction for database balance updates
    await db.transaction('rw', [db.transactions, db.accounts, db.sync_queue], async () => {
      const sourceAccount = await db.accounts.get(data.accountId);
      if (!sourceAccount) {
        throw new Error(`Source account "${data.accountId}" not found`);
      }

      if (data.type === 'transfer') {
        const destAccount = await db.accounts.get(data.toAccountId!);
        if (!destAccount) {
          throw new Error(`Destination account "${data.toAccountId}" not found`);
        }

        await db.accounts.update(data.accountId, {
          balance: round2(sourceAccount.balance - sanitizedAmount),
          updatedAt: new Date().toISOString()
        });

        await db.accounts.update(data.toAccountId!, {
          balance: round2(destAccount.balance + sanitizedAmount),
          updatedAt: new Date().toISOString()
        });
      } else {
        let newBalance = sourceAccount.balance;
        if (data.type === 'expense') {
          newBalance = round2(newBalance - sanitizedAmount);
        } else if (data.type === 'income') {
          newBalance = round2(newBalance + sanitizedAmount);
        }
        await db.accounts.update(data.accountId, {
          balance: newBalance,
          updatedAt: new Date().toISOString()
        });
      }

      await db.transactions.add(newTx);

      await db.sync_queue.add({
        tableName: 'transactions',
        action: 'INSERT',
        recordId: newTx.id,
        payload: newTx,
        timestamp: new Date().toISOString(),
        status: 'pending',
        retryCount: 0
      });
    });

    return newTx;
  };

  const deleteTransaction = async (id: string) => {
    const tx = await db.transactions.get(id);
    if (!tx) return;

    const round2 = (n: number) => Math.round(n * 100) / 100;

    await db.transaction('rw', [db.transactions, db.accounts, db.sync_queue], async () => {
      // Revert account balance effects
      const sourceAccount = await db.accounts.get(tx.accountId);
      if (sourceAccount) {
        let restoredBalance = sourceAccount.balance;
        if (tx.type === 'expense') {
          restoredBalance = round2(restoredBalance + tx.amount);
        } else if (tx.type === 'income') {
          restoredBalance = round2(restoredBalance - tx.amount);
        } else if (tx.type === 'transfer') {
          restoredBalance = round2(restoredBalance + tx.amount);
          if (tx.toAccountId) {
            const destAccount = await db.accounts.get(tx.toAccountId);
            if (destAccount) {
              await db.accounts.update(tx.toAccountId, {
                balance: round2(destAccount.balance - tx.amount),
                updatedAt: new Date().toISOString()
              });
            }
          }
        }
        await db.accounts.update(tx.accountId, {
          balance: restoredBalance,
          updatedAt: new Date().toISOString()
        });
      }

      await db.transactions.delete(id);

      await db.sync_queue.add({
        tableName: 'transactions',
        action: 'DELETE',
        recordId: id,
        payload: { id },
        timestamp: new Date().toISOString(),
        status: 'pending',
        retryCount: 0
      });
    });
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction
  };
}
