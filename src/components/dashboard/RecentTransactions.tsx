import React from 'react';
import type { Transaction, Category, Account } from '../../db/types';
import { formatRelativeTime } from '../../lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';
import { usePrivacy } from '../../context/PrivacyContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { Trash2, ArrowRightLeft, Sparkles } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onDelete: (id: string) => Promise<void>;
  onViewAll: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  categories,
  accounts,
  onDelete,
  onViewAll
}) => {
  const { isPrivacyMasked } = usePrivacy();
  const { formatAmount } = useCurrency();
  const { language } = useLanguage();

  const getCategory = (catId?: string) => categories.find(c => c.id === catId);
  const getAccount = (accId?: string) => accounts.find(a => a.id === accId);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {language === 'hi' ? 'हाल की गतिविधि' : language === 'hinglish' ? 'Recent Activity' : 'Recent Activity'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {language === 'hi' ? 'ताजा आय, खर्च और ट्रांसफर' : 'Latest logged income, expenses & transfers'}
          </p>
        </div>
        <button
          onClick={onViewAll}
          style={{ fontSize: '13px', color: 'var(--accent-emerald-light)', fontWeight: 600 }}
        >
          {language === 'hi' ? 'सभी देखें →' : 'View All →'}
        </button>
      </div>

      {transactions.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-medium)'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-emerald-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}
          >
            <Sparkles size={20} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {language === 'hi' ? 'कोई लेन-देन नहीं मिला (स्वच्छ शुरुआत)' : language === 'hinglish' ? 'No transactions yet (Clean Slate!)' : 'No transactions recorded yet (Clean Slate)'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '340px', margin: '6px auto 0 auto', lineHeight: 1.5 }}>
            {language === 'hi'
              ? 'ऊपर दिए गए गाइड में "+ आय जोड़ें" या "- ₹20 चाय" पर क्लिक करें और देखें कि बैलेंस कैसे खुद बदलता है!'
              : language === 'hinglish'
              ? 'Upar guide mein "+ Add Income" ya "- ₹20 Chai" click karke dekhein balance kaise automatically update hota hai!'
              : 'Click any button in the guide above or 1-Tap Bar to watch your balance update automatically!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {transactions.slice(0, 7).map(tx => {
            const cat = getCategory(tx.categoryId);
            const acc = getAccount(tx.accountId);
            const toAcc = tx.toAccountId ? getAccount(tx.toAccountId) : undefined;
            const isExpense = tx.type === 'expense';
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                className="interactive-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {/* Left: Icon & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: isExpense
                        ? 'rgba(244, 63, 94, 0.12)'
                        : isIncome
                        ? 'rgba(16, 185, 129, 0.12)'
                        : 'rgba(99, 102, 241, 0.12)',
                      color: isExpense
                        ? 'var(--accent-rose-light)'
                        : isIncome
                        ? 'var(--accent-emerald-light)'
                        : '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isTransfer ? (
                      <ArrowRightLeft size={18} />
                    ) : (
                      <CategoryIcon iconName={cat?.icon} size={18} />
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.notes || (isTransfer ? `Transfer to ${toAcc?.name}` : cat?.name || 'Uncategorized')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isTransfer ? `${acc?.name} → ${toAcc?.name}` : acc?.name || 'Main Account'}
                      </span>
                      {cat && !isTransfer && (
                        <>
                          <span style={{ color: 'var(--border-medium)', fontSize: '10px' }}>•</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {cat.name}
                          </span>
                        </>
                      )}
                      <span style={{ color: 'var(--border-medium)', fontSize: '10px' }}>•</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {formatRelativeTime(tx.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isExpense
                          ? 'var(--accent-rose-light)'
                          : isIncome
                          ? 'var(--accent-emerald-light)'
                          : '#cbd5e1'
                      }}
                    >
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {formatAmount(tx.amount, isPrivacyMasked)}
                    </div>
                    {tx.syncStatus === 'pending' && (
                      <span style={{ fontSize: '10px', color: 'var(--accent-amber)', fontWeight: 600 }}>
                        Offline Queue
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Delete this transaction? This will reverse the account balance adjustment.')) {
                        onDelete(tx.id);
                      }
                    }}
                    className="btn-icon"
                    style={{ width: '32px', height: '32px', color: 'var(--text-faint)' }}
                    title="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
