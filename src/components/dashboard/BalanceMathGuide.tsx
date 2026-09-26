import React, { useState } from 'react';
import { Sparkles, Plus, Minus, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { soundFx } from '../../lib/soundFx';
import type { Account } from '../../db/types';

interface BalanceMathGuideProps {
  primaryAccount?: Account;
  monthlyIncome: number;
  monthlyExpense: number;
  netWorth: number;
  onQuickLog: (data: { amount: number; notes: string; categoryId: string; accountId: string; type: 'income' | 'expense' }) => Promise<void>;
}

export const BalanceMathGuide: React.FC<BalanceMathGuideProps> = ({
  primaryAccount,
  monthlyIncome,
  monthlyExpense,
  netWorth,
  onQuickLog
}) => {
  const { formatAmount } = useCurrency();
  const { language } = useLanguage();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('pockettrack_math_guide_collapsed') !== 'false';
  });
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const toggleCollapse = () => {
    soundFx.playPop();
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('pockettrack_math_guide_collapsed', String(next));
      return next;
    });
  };

  const handleDemoAction = async (
    amount: number,
    type: 'income' | 'expense',
    notes: string,
    categoryId: string
  ) => {
    if (!primaryAccount) return;

    if (type === 'income') {
      soundFx.playCashChime();
      setLastActionMessage(`+${formatAmount(amount)} added! Balance increased.`);
    } else {
      soundFx.playPop();
      setLastActionMessage(`-${formatAmount(amount)} deducted for "${notes}".`);
    }

    await onQuickLog({
      amount,
      type,
      notes,
      categoryId,
      accountId: primaryAccount.id
    });

    setTimeout(() => {
      setLastActionMessage(null);
    }, 4000);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 18px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Top Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Calculator size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span>
                {language === 'hi'
                  ? 'ऑटोमैटिक जोड़ और घटाव'
                  : language === 'hinglish'
                  ? 'Auto Balance Math Guide'
                  : 'Automatic Balance Math'}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--accent-emerald-light)'
                }}
              >
                Live
              </span>
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {language === 'hi'
                ? 'आय जोड़ने पर बैलेंस बढ़ता है, खर्च पर घटता है।'
                : language === 'hinglish'
                ? 'Income par balance badhta hai, kharche par ghatt jata hai.'
                : 'Income increases balance, expenses decrease it.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleCollapse}
          className="btn-secondary"
          style={{ padding: '5px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
        >
          {isCollapsed ? (
            <>
              <span>{language === 'hi' ? 'दिखाएं' : 'Show'}</span>
              <ChevronDown size={13} />
            </>
          ) : (
            <>
              <span>{language === 'hi' ? 'छुपाएं' : 'Hide'}</span>
              <ChevronUp size={13} />
            </>
          )}
        </button>
      </div>

      {/* Expandable Body */}
      {!isCollapsed && (
        <div style={{ marginTop: '16px' }}>
          
          {/* Live Mobile Equation Card */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px',
              boxSizing: 'border-box'
            }}
          >
            {/* 3-Column Base, In, Out row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                textAlign: 'center',
                paddingBottom: '10px',
                borderBottom: '1px dashed var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  {primaryAccount ? primaryAccount.name.split(' ')[0] : 'Account'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                  {formatAmount(primaryAccount?.balance ?? 0)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--accent-emerald-light)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                  + Income
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-emerald-light)', marginTop: '2px' }}>
                  +{formatAmount(monthlyIncome)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--accent-rose-light)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                  - Spent
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-rose-light)', marginTop: '2px' }}>
                  -{formatAmount(monthlyExpense)}
                </div>
              </div>
            </div>

            {/* Bottom Row: Net Result */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {language === 'hi' ? '= शुद्ध कुल संपत्ति' : '= Current Net Balance'}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>
                {formatAmount(netWorth)}
              </span>
            </div>
          </div>

          {/* Feedback Flash Alert */}
          {lastActionMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '12px'
              }}
            >
              <Sparkles size={14} color="var(--accent-emerald-light)" />
              <span>{lastActionMessage}</span>
            </div>
          )}

          {/* Demonstration Action Buttons */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {language === 'hi'
                  ? 'लाइव बैलेंस टेस्ट: बटन दबाकर देखें कि बैलेंस कैसे खुद बदलता है:'
                  : language === 'hinglish'
                  ? 'Live Balance Test: Button tap karke dekhein balance kaise update hota hai:'
                  : 'Live Balance Test: Tap to test balance updates:'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                ⚡ Logs real test entries to {primaryAccount ? primaryAccount.name : 'account'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px'
              }}
            >
              {/* Positive Income additions */}
              <button
                type="button"
                onClick={() => handleDemoAction(500, 'income', 'Freelance Pay', 'cat-salary')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: 'var(--accent-emerald-light)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} />
                <span>+{formatAmount(500)} Income</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAction(1000, 'income', 'Bonus / Gift', 'cat-cashback')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: 'var(--accent-emerald-light)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} />
                <span>+{formatAmount(1000)} Bonus</span>
              </button>

              {/* Negative Expense deductions */}
              <button
                type="button"
                onClick={() => handleDemoAction(20, 'expense', 'Chai & Biscuit', 'cat-food')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  borderRadius: '999px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose-light)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Minus size={13} />
                <span>-{formatAmount(20)} (☕ Chai)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAction(80, 'expense', 'Auto Fare', 'cat-transport')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  borderRadius: '999px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose-light)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Minus size={13} />
                <span>-{formatAmount(80)} (🛺 Auto)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAction(350, 'expense', 'Swiggy Food', 'cat-food')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  borderRadius: '999px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose-light)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  gridColumn: 'span 2'
                }}
              >
                <Minus size={13} />
                <span>-{formatAmount(350)} (🍔 Meal)</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
