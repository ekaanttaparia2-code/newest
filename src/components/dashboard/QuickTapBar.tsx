import React, { useState } from 'react';
import { Zap, Check, AlertCircle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { soundFx } from '../../lib/soundFx';
import confetti from 'canvas-confetti';
import type { Account, Category } from '../../db/types';

interface QuickTapBarProps {
  accounts?: Account[];
  categories?: Category[];
  onQuickLog: (data: {
    amount: number;
    notes: string;
    categoryId: string;
    accountId: string;
  }) => Promise<any>;
}

export const QuickTapBar: React.FC<QuickTapBarProps> = ({
  accounts = [],
  categories = [],
  onQuickLog
}) => {
  const { symbol } = useCurrency();
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState<boolean>(false);

  // Dynamic account resolvers
  const cashAccount = accounts.find(a => a.type === 'cash') || accounts[0];
  const checkingAccount = accounts.find(a => a.type === 'checking' || a.type === 'savings') || accounts[0];
  const creditAccount = accounts.find(a => a.type === 'credit') || accounts.find(a => a.type === 'checking') || accounts[0];

  // Dynamic category resolvers
  const findCatId = (id: string, nameRegex: RegExp): string => {
    const directMatch = categories.find(c => c.id === id);
    if (directMatch) return directMatch.id;
    const nameMatch = categories.find(c => c.type === 'expense' && nameRegex.test(c.name));
    if (nameMatch) return nameMatch.id;
    const firstExpense = categories.find(c => c.type === 'expense');
    return firstExpense?.id || categories[0]?.id || '';
  };

  const foodCatId = findCatId('cat-food', /food|dining|snack|restaurant/i);
  const transportCatId = findCatId('cat-transport', /transport|travel|fuel|petrol|auto/i);
  const groceriesCatId = findCatId('cat-groceries', /grocer|kirana|market|blinkit/i);
  const entertainmentCatId = findCatId('cat-entertainment', /entertainment|movie|ott/i);

  const quickItems = [
    { label: 'Chai & Snacks', emoji: '☕', amount: 20, categoryId: foodCatId, account: cashAccount },
    { label: 'Auto / Metro', emoji: '🛺', amount: 80, categoryId: transportCatId, account: cashAccount },
    { label: 'Swiggy / Meal', emoji: '🍔', amount: 350, categoryId: foodCatId, account: checkingAccount },
    { label: 'Kirana / Blinkit', emoji: '🛒', amount: 850, categoryId: groceriesCatId, account: creditAccount },
    { label: 'Petrol Refill', emoji: '⛽', amount: 500, categoryId: transportCatId, account: checkingAccount },
    { label: 'Movie Ticket', emoji: '🍿', amount: 350, categoryId: entertainmentCatId, account: creditAccount },
  ];

  const handleTap = async (item: typeof quickItems[0]) => {
    if (isLogging) return;
    if (!item.account) {
      setActiveToast('Please add an account first!');
      setTimeout(() => setActiveToast(null), 2500);
      return;
    }

    setIsLogging(true);
    try {
      soundFx.playCashChime();
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#10b981', '#f59e0b', '#3b82f6']
      });

      await onQuickLog({
        amount: item.amount,
        notes: `${item.emoji} ${item.label}`,
        categoryId: item.categoryId,
        accountId: item.account.id
      });

      setActiveToast(`Logged ${symbol}${item.amount} (${item.account.name.split(' ')[0]})`);
      setTimeout(() => setActiveToast(null), 2500);
    } catch (err: any) {
      setActiveToast(err?.message || 'Failed to log');
      setTimeout(() => setActiveToast(null), 3000);
    } finally {
      setIsLogging(false);
    }
  };

  const hasNoAccounts = accounts.length === 0;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 20px',
        marginBottom: '20px',
        background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 19, 31, 0.9) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
            <Zap size={14} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Instant 1-Tap Log Bar
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            (Zero-friction quick tap)
          </span>
        </div>

        {activeToast && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-emerald-light)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', padding: '3px 10px', borderRadius: '999px' }}>
            <Check size={13} />
            {activeToast}
          </div>
        )}
      </div>

      {hasNoAccounts ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', padding: '6px 0' }}>
          <AlertCircle size={14} color="var(--accent-amber)" />
          <span>Add an active account to enable 1-tap fast logging.</span>
        </div>
      ) : (
        /* Horizontal Scrollable Quick Chips */
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {quickItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLogging}
              onClick={() => handleTap(item)}
              className="interactive-card"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isLogging ? 'not-allowed' : 'pointer',
                opacity: isLogging ? 0.6 : 1
              }}
              title={item.account ? `Logs to ${item.account.name}` : undefined}
            >
              <span style={{ fontSize: '16px' }}>{item.emoji}</span>
              <span>{item.label}</span>
              <span
                className="font-mono"
                style={{
                  color: 'var(--accent-emerald-light)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                {symbol}{item.amount}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
