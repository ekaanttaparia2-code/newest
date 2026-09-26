import React, { useState, useMemo } from 'react';
import type { Transaction, Category } from '../../db/types';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, Flame, Layers } from 'lucide-react';

interface CategoryTrendWatchProps {
  transactions: Transaction[];
  categories: Category[];
}

interface TrendItem {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  currentSpend: number;
  baselineSpend: number;
  deltaAmount: number;
  pctChange: number;
  isSurge: boolean;
}

export const CategoryTrendWatch: React.FC<CategoryTrendWatchProps> = ({
  transactions,
  categories
}) => {
  const { formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();
  const [filterMode, setFilterMode] = useState<'surge' | 'all'>('surge');

  const trends: TrendItem[] = useMemo(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Past 2 months keys
    const pastMonths: string[] = [];
    for (let i = 1; i <= 2; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      pastMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const currentMap: Record<string, number> = {};
    const baselineMap: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      const catId = t.categoryId || 'other';
      const mKey = t.date.substring(0, 7);

      if (mKey === currentMonthKey) {
        currentMap[catId] = (currentMap[catId] || 0) + t.amount;
      } else if (pastMonths.includes(mKey)) {
        baselineMap[catId] = (baselineMap[catId] || 0) + t.amount;
      }
    });

    const items: TrendItem[] = [];

    categories.forEach(cat => {
      const currentSpend = currentMap[cat.id] || 0;
      const pastMonthsCount = pastMonths.length || 1;
      const baselineSpend = (baselineMap[cat.id] || 0) / pastMonthsCount;

      if (currentSpend > 0 || baselineSpend > 0) {
        const deltaAmount = currentSpend - baselineSpend;
        let pctChange = 0;
        if (baselineSpend > 0) {
          pctChange = Math.round(((currentSpend - baselineSpend) / baselineSpend) * 100);
        } else if (currentSpend > 0) {
          pctChange = 100;
        }

        items.push({
          categoryId: cat.id,
          categoryName: cat.name,
          color: cat.color || '#6366F1',
          icon: cat.icon || '📦',
          currentSpend: Math.round(currentSpend),
          baselineSpend: Math.round(baselineSpend),
          deltaAmount: Math.round(deltaAmount),
          pctChange,
          isSurge: pctChange >= 15 && deltaAmount > 500
        });
      }
    });

    return items.sort((a, b) => b.deltaAmount - a.deltaAmount);
  }, [transactions, categories]);

  const surgeCount = trends.filter(t => t.isSurge).length;
  const displayedTrends = filterMode === 'surge' ? trends.filter(t => t.deltaAmount > 0) : trends;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(14, 19, 31, 0.95) 0%, rgba(20, 27, 43, 0.9) 100%)',
        border: '1px solid var(--border-subtle)',
        marginTop: '24px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose-light)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}
          >
            <Flame size={13} />
            Inflation & Category Creep Watch
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Things That Cost More Than They Used To
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Comparing current month spending against your 2-month trailing baseline.
          </p>
        </div>

        {/* View Filter Pill */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0, 0, 0, 0.35)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setFilterMode('surge')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: filterMode === 'surge' ? 'var(--accent-emerald)' : 'transparent',
              color: filterMode === 'surge' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Increases ({trends.filter(t => t.deltaAmount > 0).length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: filterMode === 'all' ? 'var(--accent-emerald)' : 'transparent',
              color: filterMode === 'all' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            All Categories ({trends.length})
          </button>
        </div>
      </div>

      {surgeCount > 0 && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <AlertTriangle size={18} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', color: '#fde68a', lineHeight: '1.5' }}>
            <span style={{ fontWeight: 700 }}>Lifestyle Creep Notice:</span> You have{' '}
            <span style={{ fontWeight: 700, textDecoration: 'underline' }}>{surgeCount} {surgeCount === 1 ? 'category' : 'categories'}</span> spending significantly higher (&gt;15% and &gt;₹500) than your recent average. Review these items to curb stealth inflation.
          </div>
        </div>
      )}

      {displayedTrends.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Layers size={32} opacity={0.4} />
          <span>No expenditure trends detected yet. Add more transactions across months to activate trend intelligence.</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {displayedTrends.map(item => {
            const isIncrease = item.deltaAmount > 0;
            const isNeutral = item.deltaAmount === 0;

            return (
              <div
                key={item.categoryId}
                className="interactive-card"
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(21, 28, 46, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                      backgroundColor: `${item.color}20`,
                      border: `1px solid ${item.color}40`
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.categoryName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span>Baseline: {isPrivacyMasked ? '••••' : formatAmount(item.baselineSpend)}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Now: {isPrivacyMasked ? '••••' : formatAmount(item.currentSpend)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    {isIncrease ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--accent-rose-light)',
                          background: 'rgba(244, 63, 94, 0.15)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        <ArrowUpRight size={12} style={{ marginRight: '2px' }} />
                        +{item.pctChange}%
                      </span>
                    ) : isNeutral ? (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        0%
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--accent-emerald-light)',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        <ArrowDownRight size={12} style={{ marginRight: '2px' }} />
                        {item.pctChange}%
                      </span>
                    )}
                  </div>
                  <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {isIncrease ? `+${isPrivacyMasked ? '•••' : formatAmount(item.deltaAmount)}` : isNeutral ? 'Unchanged' : `${isPrivacyMasked ? '•••' : formatAmount(item.deltaAmount)}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
