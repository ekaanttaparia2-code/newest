import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRightLeft, AlertCircle } from 'lucide-react';
import type { Account } from '../../db/types';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import confetti from 'canvas-confetti';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onTransfer: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    notes?: string;
  }) => Promise<void>;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onTransfer
}) => {
  const { symbol, formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  useModalAccessibility(isOpen, onClose);

  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNotes('');
      if (accounts.length > 0) {
        setFromAccountId(prev => (accounts.some(a => a.id === prev) ? prev : accounts[0].id));
        setToAccountId(prev => {
          const dest = accounts.find(a => a.id !== (accounts[0]?.id));
          return accounts.some(a => a.id === prev && a.id !== accounts[0]?.id)
            ? prev
            : (dest?.id || (accounts[1]?.id ?? ''));
        });
      }
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid transfer amount');
      return;
    }

    if (!fromAccountId || !toAccountId) {
      alert('Please select both source and destination accounts');
      return;
    }

    if (fromAccountId === toAccountId) {
      alert('From and To accounts must be different');
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransfer({
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
        notes: notes.trim() || 'Internal Account Transfer'
      });

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="sheet-notch" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightLeft size={16} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Transfer Funds</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {accounts.length < 2 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-amber)',
                fontSize: '12.5px',
                marginBottom: '16px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>You need at least 2 accounts to transfer funds. Please add a second account first.</span>
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Transfer Amount ({symbol})</label>
            <input
              type="number"
              step="0.01"
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="form-input font-mono"
              style={{ fontSize: '24px', fontWeight: 700 }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">From Account</label>
              <select
                className="form-select"
                value={fromAccountId}
                onChange={e => setFromAccountId(e.target.value)}
                required
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatAmount(acc.balance, isPrivacyMasked)})
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label className="form-label">Note (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Credit Card Payment or Savings Deposit"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !amount}>
              <Check size={16} />
              Execute Transfer
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
