import Dexie, { type Table } from 'dexie';
import type { Account, Transaction, Category, Budget, Subscription, SyncQueueItem } from './types';
import { DEFAULT_CATEGORIES } from './defaultData';

export class PocketTrackDatabase extends Dexie {
  accounts!: Table<Account, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, string>;
  subscriptions!: Table<Subscription, string>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('PocketTrackDB');

    this.version(1).stores({
      accounts: 'id, type, isArchived, currency, createdAt',
      transactions: 'id, accountId, toAccountId, categoryId, type, date, syncStatus, createdAt',
      categories: 'id, type, isDefault',
      budgets: 'id, categoryId, month',
      subscriptions: 'id, accountId, categoryId, isActive',
      sync_queue: '++id, tableName, action, recordId, status, timestamp'
    });
  }

  async seedInitialDataIfNeeded() {
    const categoriesCount = await this.categories.count();
    if (categoriesCount === 0) {
      await this.categories.bulkAdd(DEFAULT_CATEGORIES as Category[]);
    }

    const accountsCount = await this.accounts.count();
    if (accountsCount === 0) {
      // Create a single clean starting account with zero fake transactions
      await this.accounts.add({
        id: 'acc-primary',
        name: 'UPI Wallet & Cash',
        type: 'cash',
        currency: 'INR',
        balance: 2000.00,
        color: '#10b981',
        icon: 'Wallet',
        institution: 'UPI / Cash',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Initializes a completely clean vault with the user's custom details and zero transactions.
   */
  async initializeCleanVault(userName: string, accountName: string, startingBalance: number) {
    const categoriesCount = await this.categories.count();
    if (categoriesCount === 0) {
      await this.categories.bulkAdd(DEFAULT_CATEGORIES as Category[]);
    }

    // Completely clear transactions and existing accounts
    await this.transactions.clear();
    await this.accounts.clear();

    const primaryAccount: Account = {
      id: 'acc-primary',
      name: accountName || 'Primary Account',
      type: accountName.toLowerCase().includes('card') ? 'credit' : 'checking',
      currency: 'INR',
      balance: startingBalance,
      color: '#10b981',
      icon: 'Building2',
      institution: accountName || 'UPI / Bank',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.accounts.add(primaryAccount);
    localStorage.setItem('pockettrack_username', userName);
    localStorage.setItem('pockettrack_stage', 'app');
  }

  /**
   * Clears all transactions and restores accounts to clean initial state.
   */
  async resetToCleanVault() {
    await this.transactions.clear();
    await this.accounts.clear();
    await this.accounts.add({
      id: 'acc-primary',
      name: 'UPI Wallet & Cash',
      type: 'cash',
      currency: 'INR',
      balance: 2000.00,
      color: '#10b981',
      icon: 'Wallet',
      institution: 'UPI / Cash',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

export const db = new PocketTrackDatabase();

db.seedInitialDataIfNeeded().catch(err => {
  console.error('Error seeding initial PocketTrack data:', err);
});

