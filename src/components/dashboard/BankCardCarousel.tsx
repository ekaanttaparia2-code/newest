import React from 'react';
import type { Account } from '../../db/types';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { CreditCard, Copy, Check, ArrowRightLeft, Radio } from 'lucide-react';
import { soundFx } from '../../lib/soundFx';

interface BankCardCarouselProps {
  accounts: Account[];
  onOpenTransfer: () => void;
}

export const BankCardCarousel: React.FC<BankCardCarouselProps> = ({ accounts, onOpenTransfer }) => {
  const { formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyUpi = (accName: string, id: string) => {
    soundFx.playPop();
    const upiId = `${accName.toLowerCase().replace(/[^a-z]/g, '')}@okaxis`;
    navigator.clipboard?.writeText(upiId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCardGradient = (type: string) => {
    if (type === 'checking') {
      return 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'; // Royal Navy HDFC style
    }
    if (type === 'savings') {
      return 'linear-gradient(135deg, #065f46 0%, #022c22 100%)'; // Emerald Gold SBI style
    }
    if (type === 'credit') {
      return 'linear-gradient(135deg, #9f1239 0%, #4c0519 100%)'; // Crimson ICICI Coral style
    }
    return 'linear-gradient(135deg, #b45309 0%, #451a03 100%)'; // Amber UPI style
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={17} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Digital Cards & Accounts
          </h3>
        </div>

        <button
          onClick={onOpenTransfer}
          style={{
            fontSize: '12px',
            color: 'var(--accent-emerald-light)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ArrowRightLeft size={13} />
          <span>Quick Transfer</span>
        </button>
      </div>

      {/* Horizontal Carousel */}
      {accounts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No bank accounts or cards added yet.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {accounts.map((acc, idx) => {
            const isCredit = acc.type === 'credit';
            const isCopied = copiedId === acc.id;

          return (
            <div
              key={acc.id}
              className="interactive-card"
              style={{
                flexShrink: 0,
                width: '280px',
                height: '165px',
                borderRadius: '20px',
                background: getCardGradient(acc.type),
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.6)',
                scrollSnapAlign: 'start',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Subtle metallic chip & contactless wave */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* EMV Chip visual */}
                  <div
                    style={{
                      width: '34px',
                      height: '24px',
                      borderRadius: '5px',
                      background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
                      border: '1px solid #d4af37',
                      position: 'relative'
                    }}
                  />
                  <Radio size={14} color="rgba(255,255,255,0.6)" />
                </div>

                <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}>
                  {acc.institution || acc.name.split(' ')[0]}
                </span>
              </div>

              {/* Masked Card Number */}
              <div className="font-mono" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em' }}>
                •••• •••• •••• {4000 + idx * 231}
              </div>

              {/* Bottom: Name & Balance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'block' }}>
                    {isCredit ? 'Outstanding Bill' : 'Available Balance'}
                  </span>
                  <span
                    className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: isCredit ? '#fecdd3' : '#ffffff',
                      lineHeight: 1.2
                    }}
                  >
                    {formatAmount(acc.balance, isPrivacyMasked)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyUpi(acc.name, acc.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Copy UPI ID"
                >
                  {isCopied ? <Check size={11} /> : <Copy size={11} />}
                  <span>{isCopied ? 'Copied' : 'UPI ID'}</span>
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
