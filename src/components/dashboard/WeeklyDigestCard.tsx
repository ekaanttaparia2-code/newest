import React, { useState, useMemo } from 'react';
import type { Transaction, Category, Account } from '../../db/types';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { Sparkles, Copy, Check, Newspaper, ChevronRight } from 'lucide-react';
import { calculateRunway } from '../../lib/fire';

interface WeeklyDigestCardProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onExploreInsights?: () => void;
}

export const WeeklyDigestCard: React.FC<WeeklyDigestCardProps> = ({
  transactions,
  categories,
  accounts,
  onExploreInsights
}) => {
  const { formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();
  const [copied, setCopied] = useState<boolean>(false);

  const digest = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);

    let thisWeekSpend = 0;
    let lastWeekSpend = 0;
    const catSpendMap: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      const tDate = new Date(t.date);
      if (tDate >= sevenDaysAgo && tDate <= now) {
        thisWeekSpend += t.amount;
        const catId = t.categoryId || 'other';
        catSpendMap[catId] = (catSpendMap[catId] || 0) + t.amount;
      } else if (tDate >= fourteenDaysAgo && tDate < sevenDaysAgo) {
        lastWeekSpend += t.amount;
      }
    });

    // Top Category
    let topCatName = 'Living Expenses';
    let topCatAmount = 0;
    Object.entries(catSpendMap).forEach(([id, amt]) => {
      if (amt > topCatAmount) {
        topCatAmount = amt;
        const cat = categories.find(c => c.id === id);
        topCatName = cat?.name || 'Living Expenses';
      }
    });

    const topCatPct = thisWeekSpend > 0 ? Math.round((topCatAmount / thisWeekSpend) * 100) : 0;

    // Spending comparison
    let spendComparisonText = '';
    if (lastWeekSpend > 0) {
      const diff = Math.round(((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100);
      if (diff > 5) {
        spendComparisonText = `${diff}% higher than last week`;
      } else if (diff < -5) {
        spendComparisonText = `${Math.abs(diff)}% more disciplined than last week`;
      } else {
        spendComparisonText = 'consistent with last week';
      }
    } else {
      spendComparisonText = 'well tracked';
    }

    // Liquid runway calculation
    let liquidAssets = 0;
    accounts.forEach(acc => {
      if (acc.type === 'cash' || acc.type === 'savings') {
        liquidAssets += Math.max(0, acc.balance);
      }
    });

    // Monthly burn estimated from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    let thirtyDaySpend = 0;
    transactions.forEach(t => {
      if (t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo) {
        thirtyDaySpend += t.amount;
      }
    });
    const monthlyBurn = thirtyDaySpend > 0 ? thirtyDaySpend : 30000;
    const runway = calculateRunway(liquidAssets, monthlyBurn);

    // Formulate 4 natural English bullet sentences
    const sentences = [
      `You've spent ${isPrivacyMasked ? '••••' : formatAmount(thisWeekSpend)} over the last 7 days, which is ${spendComparisonText}.`,
      topCatAmount > 0
        ? `Main spend driver: ${topCatName} (${isPrivacyMasked ? '••••' : formatAmount(topCatAmount)}), representing ${topCatPct}% of this week's outlay.`
        : 'Zero discretionary spikes logged this past week.',
      `Emergency health: Your liquid reserves provide ${runway.runwayMonths >= 999 ? 'infinite' : `${runway.runwayMonths} months`} of living runway (${runway.label.split('(')[0].trim()}).`,
      thisWeekSpend === 0
        ? 'Great start! Ready to record new activity whenever you swipe or transfer.'
        : 'All transaction streams are synced and encrypted in your local vault.'
    ];

    return {
      thisWeekSpend,
      topCatName,
      topCatAmount,
      runwayMonths: runway.runwayMonths,
      sentences,
      rawText: sentences.join(' ')
    };
  }, [transactions, categories, accounts, formatAmount, isPrivacyMasked]);

  const handleCopy = () => {
    navigator.clipboard.writeText(digest.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(14, 19, 31, 0.95) 0%, rgba(23, 30, 50, 0.9) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Newspaper size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Weekly Financial Intelligence
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-emerald-light)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <Sparkles size={11} />
                Executive Brief
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Plain-English summary of your money movements
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn-secondary pressable"
          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          title="Copy digest to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} color="var(--accent-emerald-light)" />
              <span style={{ color: 'var(--accent-emerald-light)' }}>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Brief</span>
            </>
          )}
        </button>
      </div>

      {/* 4 Plain-English Paragraph sentences */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {digest.sentences.map((sentence, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#818cf8',
                marginTop: '6px',
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              {sentence}
            </span>
          </div>
        ))}
      </div>

      {onExploreInsights && (
        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onExploreInsights}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span>View Full Trends & Analytics</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
