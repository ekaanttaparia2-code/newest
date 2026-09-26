import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncedAt: Date | null;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => {
    const saved = localStorage.getItem('pockettrack_last_sync');
    return saved ? new Date(saved) : null;
  });

  const checkPendingCount = useCallback(async () => {
    try {
      const count = await db.transactions.where('syncStatus').equals('pending').count();
      setPendingSyncCount(count);
    } catch {
      // Ignore initial count errors before db initializes
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (user) {
          // Push pending local transactions to Supabase
          const pendingTransactions = await db.transactions
            .where('syncStatus')
            .equals('pending')
            .toArray();

          for (const tx of pendingTransactions) {
            const { error } = await supabase.from('transactions').upsert({
              id: tx.id,
              user_id: user.id,
              account_id: tx.accountId,
              to_account_id: tx.toAccountId,
              category_id: tx.categoryId,
              amount: tx.amount,
              type: tx.type,
              date: tx.date,
              notes: tx.notes,
              tags: tx.tags,
              receipt_url: tx.receiptUrl,
              created_at: tx.createdAt,
              updated_at: tx.updatedAt
            });

            if (!error) {
              await db.transactions.update(tx.id, { syncStatus: 'synced' });
            }
          }
        }
      }

      const now = new Date();
      setLastSyncedAt(now);
      localStorage.setItem('pockettrack_last_sync', now.toISOString());
      await checkPendingCount();
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, checkPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkPendingCount, 5000);
    checkPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkPendingCount, triggerSync]);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingSyncCount,
        lastSyncedAt,
        triggerSync
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
