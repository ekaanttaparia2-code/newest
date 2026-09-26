import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, X, Sparkles, Volume2 } from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { parseNaturalLanguageInput, type ParsedVoiceTransaction } from '../../lib/nlpParser';
import type { Account, Category } from '../../db/types';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { soundFx } from '../../lib/soundFx';
import confetti from 'canvas-confetti';

interface VoiceLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  onSave: (data: {
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    categoryId?: string;
    accountId: string;
    toAccountId?: string;
    notes: string;
  }) => Promise<any>;
}

export const VoiceLogModal: React.FC<VoiceLogModalProps> = ({
  isOpen,
  onClose,
  categories,
  accounts,
  onSave
}) => {
  const { symbol, formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  useModalAccessibility(isOpen, onClose);
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition();

  const [draftText, setDraftText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedVoiceTransaction | null>(null);
  const [editableAmount, setEditableAmount] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedToAccountId, setSelectedToAccountId] = useState<string>('');
  const [editableNotes, setEditableNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      setDraftText('');
      setParsedData(null);
      setEditableAmount('');
      setSelectedCategoryId('');
      setSelectedAccountId(accounts[0]?.id || '');
      setSelectedToAccountId(accounts.find(a => a.id !== accounts[0]?.id)?.id || '');
      setEditableNotes('');
      if (isSupported) {
        startListening();
      }
    } else {
      stopListening();
    }
  }, [isOpen, isSupported, startListening, stopListening, resetTranscript, accounts]);

  useEffect(() => {
    if (transcript) {
      setDraftText(transcript);
    }
  }, [transcript]);

  const activeSpeechText = draftText || interimTranscript;

  useEffect(() => {
    if (activeSpeechText.trim()) {
      const parsed = parseNaturalLanguageInput(activeSpeechText, categories, accounts);
      setParsedData(parsed);
      if (parsed.amount !== undefined) {
        setEditableAmount(parsed.amount.toString());
      }
      if (parsed.categoryId) {
        setSelectedCategoryId(parsed.categoryId);
      }
      if (parsed.accountId) {
        setSelectedAccountId(parsed.accountId);
      }
      if (parsed.toAccountId) {
        setSelectedToAccountId(parsed.toAccountId);
      }
      if (parsed.notes) {
        setEditableNotes(parsed.notes);
      }
    }
  }, [activeSpeechText, categories, accounts]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const amountVal = parseFloat(editableAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Please provide a valid amount');
      return;
    }

    const txType = parsedData?.type || 'expense';

    if (txType === 'transfer') {
      if (!selectedAccountId || !selectedToAccountId) {
        alert('Transfer requires both source and destination accounts');
        return;
      }
      if (selectedAccountId === selectedToAccountId) {
        alert('Source and destination accounts must be different');
        return;
      }
    } else {
      if (!selectedAccountId) {
        alert('Please select an account');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      soundFx.playCashChime();
      await onSave({
        amount: amountVal,
        type: txType,
        categoryId: txType !== 'transfer' ? selectedCategoryId || undefined : undefined,
        accountId: selectedAccountId,
        toAccountId: txType === 'transfer' ? selectedToAccountId : undefined,
        notes: editableNotes || 'Voice logged transaction'
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#059669']
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save voice log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickExample = (text: string) => {
    soundFx.playPop();
    stopListening();
    resetTranscript();
    setDraftText(text);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="sheet-notch" />
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>Natural Voice Logging</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Speak naturally in Rupees or colloquial terms</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          
          {/* Mic Visual Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 24px 0' }}>
            <button
              onClick={() => {
                soundFx.playPop();
                if (isListening) stopListening(); else startListening();
              }}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: isListening 
                  ? 'radial-gradient(circle, #f43f5e 0%, #be123c 100%)' 
                  : 'radial-gradient(circle, #10b981 0%, #059669 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isListening 
                  ? '0 0 35px 5px rgba(244, 63, 94, 0.4)' 
                  : '0 0 30px 4px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                border: '4px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              {isListening ? <Mic size={38} /> : <MicOff size={34} />}
            </button>

            {/* Pulsing Voice Bars */}
            {isListening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '16px', height: '28px' }}>
                <span className="voice-wave-bar" style={{ animationDelay: '0.1s' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '0.3s' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '0.15s' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '0.4s' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '0.2s' }} />
              </div>
            )}

            <p style={{ marginTop: '14px', fontSize: '13px', fontWeight: 600, color: isListening ? 'var(--accent-rose-light)' : 'var(--text-secondary)' }}>
              {isListening ? 'Listening... Speak now' : 'Tap microphone to speak'}
            </p>

            {error && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                {error}
              </div>
            )}
          </div>

          {/* Transcript / Input Box */}
          <div style={{ background: '#121827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                Live Spoken / Typed Transcript
              </span>
              <Volume2 size={14} color="var(--text-muted)" />
            </div>
            <textarea
              rows={2}
              value={draftText || interimTranscript}
              onChange={e => {
                stopListening();
                setDraftText(e.target.value);
              }}
              placeholder='e.g., "Spent 20 rupees on chai with UPI" or "Paid 850 for groceries with card"'
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '15px',
                resize: 'none'
              }}
            />
          </div>

          {/* Quick Indian Sample Prompts */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
              Or try quick Indian prompts:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickExample('Spent 20 rupees on chai with cash')}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '6px' }}
              >
                ☕ "Spent ₹20 on chai with cash"
              </button>
              <button
                type="button"
                onClick={() => handleQuickExample('Paid 650 for Swiggy with credit card')}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '6px' }}
              >
                🍔 "Paid ₹650 for Swiggy with card"
              </button>
              <button
                type="button"
                onClick={() => handleQuickExample('Received 85000 salary into savings')}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '6px' }}
              >
                💼 "Received ₹85,000 salary into savings"
              </button>
            </div>
          </div>

          {/* Parsed Extracted Values Preview */}
          {parsedData && (
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Extracted Breakdown
                </span>
                <span className={parsedData.type === 'income' ? 'badge-income' : parsedData.type === 'transfer' ? 'badge-transfer' : 'badge-expense'}>
                  {parsedData.type.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Amount */}
                <div>
                  <label className="form-label">Amount ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input font-mono"
                    value={editableAmount}
                    onChange={e => setEditableAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '16px', fontWeight: 700 }}
                  />
                </div>

                {/* Account / From Account */}
                <div>
                  <label className="form-label">{parsedData.type === 'transfer' ? 'From Account' : 'Account'}</label>
                  <select
                    className="form-select"
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                  >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatAmount(acc.balance, isPrivacyMasked)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Account for transfers */}
                {parsedData.type === 'transfer' ? (
                  <div>
                    <label className="form-label">To Account</label>
                    <select
                      className="form-select"
                      value={selectedToAccountId}
                      onChange={e => setSelectedToAccountId(e.target.value)}
                    >
                      <option value="">Select Destination</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatAmount(acc.balance, isPrivacyMasked)})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  /* Category */
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={selectedCategoryId}
                      onChange={e => setSelectedCategoryId(e.target.value)}
                    >
                      <option value="">Uncategorized</option>
                      {categories
                        .filter(c => c.type === (parsedData.type === 'income' ? 'income' : 'expense'))
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="form-label">Description / Note</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editableNotes}
                    onChange={e => setEditableNotes(e.target.value)}
                    placeholder="Note"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={isSubmitting || !editableAmount}
              onClick={handleConfirm}
              style={{ minWidth: '140px' }}
            >
              <Check size={16} />
              Confirm & Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
