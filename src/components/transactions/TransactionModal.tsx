import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRightLeft, TrendingDown, TrendingUp } from 'lucide-react';
import type { Account, Category, TransactionType } from '../../db/types';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { soundFx } from '../../lib/soundFx';
import confetti from 'canvas-confetti';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  onSave: (data: {
    amount: number;
    type: TransactionType;
    categoryId?: string;
    accountId: string;
    toAccountId?: string;
    date: string;
    notes?: string;
    tags?: string[];
  }) => Promise<any>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  accounts,
  onSave
}) => {
  const { symbol, formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  useModalAccessibility(isOpen, onClose);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [notes, setNotes] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync accounts and default category whenever modal opens or accounts/categories change
  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0) {
        setAccountId(prev => (accounts.some(a => a.id === prev) ? prev : accounts[0].id));
        setToAccountId(prev => {
          const other = accounts.find(a => a.id !== accounts[0]?.id);
          return accounts.some(a => a.id === prev && a.id !== accounts[0]?.id)
            ? prev
            : (other?.id || (accounts[1]?.id ?? ''));
        });
      }

      const matchingCats = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));
      setCategoryId(prev => {
        if (!prev || !matchingCats.some(c => c.id === prev)) {
          return matchingCats[0]?.id ?? '';
        }
        return prev;
      });
    }
  }, [isOpen, accounts, categories, type]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== 'transfer') {
      const matching = categories.find(c => c.type === newType);
      if (matching) setCategoryId(matching.id);
    }
  };

  const handleAmountChip = (addVal: number) => {
    soundFx.playPop();
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (type === 'transfer') {
      if (!accountId || !toAccountId) {
        alert('Please select both source and destination accounts');
        return;
      }
      if (accountId === toAccountId) {
        alert('Source and destination accounts must be different');
        return;
      }
    } else {
      if (!accountId) {
        alert('Please select an account');
        return;
      }
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    // Ensure calendar day consistency across timezones by setting noon
    const storedDate = new Date(`${date}T12:00:00`).toISOString();

    setIsSubmitting(true);
    try {
      soundFx.playCashChime();
      await onSave({
        amount: parsedAmount,
        type,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        categoryId: type !== 'transfer' ? categoryId || undefined : undefined,
        date: storedDate,
        notes: notes.trim(),
        tags
      });

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });

      // Clear non-persistent input
      setAmount('');
      setNotes('');
      setTagsInput('');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="sheet-notch" />
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Log Transaction</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Type Switcher Tabs */}
        <div style={{ display: 'flex', padding: '16px 24px 0 24px', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              handleTypeChange('expense');
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: type === 'expense' ? 'rgba(244, 63, 94, 0.16)' : 'var(--bg-surface-elevated)',
              color: type === 'expense' ? 'var(--accent-rose-light)' : 'var(--text-secondary)',
              border: `1px solid ${type === 'expense' ? 'rgba(244, 63, 94, 0.35)' : 'var(--border-subtle)'}`,
              transition: 'all var(--transition-fast)'
            }}
          >
            <TrendingDown size={16} />
            Expense
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              handleTypeChange('income');
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: type === 'income' ? 'rgba(16, 185, 129, 0.16)' : 'var(--bg-surface-elevated)',
              color: type === 'income' ? 'var(--accent-emerald-light)' : 'var(--text-secondary)',
              border: `1px solid ${type === 'income' ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)'}`,
              transition: 'all var(--transition-fast)'
            }}
          >
            <TrendingUp size={16} />
            Income
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              handleTypeChange('transfer');
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: type === 'transfer' ? 'rgba(99, 102, 241, 0.16)' : 'var(--bg-surface-elevated)',
              color: type === 'transfer' ? '#a5b4fc' : 'var(--text-secondary)',
              border: `1px solid ${type === 'transfer' ? 'rgba(99, 102, 241, 0.35)' : 'var(--border-subtle)'}`,
              transition: 'all var(--transition-fast)'
            }}
          >
            <ArrowRightLeft size={16} />
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          
          {/* Big Amount Input */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Amount</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '16px', fontSize: '24px', fontWeight: 700, color: 'var(--accent-emerald-light)' }}>
                {symbol}
              </span>
              <input
                type="number"
                step="0.01"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="form-input font-mono"
                style={{ fontSize: '26px', fontWeight: 700, paddingLeft: '42px', height: '58px' }}
                required
              />
            </div>

            {/* Quick add chip shortcuts in INR */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[50, 100, 500, 2000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleAmountChip(val)}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}
                >
                  +{symbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts & Categories Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">{type === 'transfer' ? 'From Account' : 'Account'}</label>
              <select
                className="form-select"
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                required
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatAmount(acc.balance, isPrivacyMasked)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="form-label">To Account</label>
                <select
                  className="form-select"
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatAmount(acc.balance, isPrivacyMasked)})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                >
                  <option value="">Uncategorized</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="chai, upi, swiggy"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          {/* Note Input */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Notes / Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Masala chai with biscuits"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !amount}
            >
              <Check size={16} />
              Save Transaction
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
