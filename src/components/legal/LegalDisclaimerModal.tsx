import React from 'react';
import { ShieldCheck, AlertCircle, Lock, Download, X, Check } from 'lucide-react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({ isOpen, onClose }) => {
  useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '580px', maxHeight: '88vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'sticky',
            top: 0,
            background: '#121827',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald-light)'
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Legal Disclosures & Privacy Shield
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Regulatory Compliance & Security Architecture
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          
          {/* Regulatory Disclaimer */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose-light)', fontWeight: 700, fontSize: '14px' }}>
              <AlertCircle size={17} />
              <span>Statutory Non-Advisory Notice</span>
            </div>
            <p style={{ margin: 0 }}>
              <strong>PocketTrack</strong> is an offline-first financial recording ledger and educational forecasting calculator. 
              PocketTrack is <strong>not</strong> a SEBI-registered investment advisor, portfolio manager, or research entity. 
              All calculations, compound interest models, inflation-adjusted wealth simulations, and financial health scores are generated algorithmically for educational visualization only and should never be construed as professional financial, investment, legal, or tax advice.
            </p>
          </div>

          {/* Privacy & Zero-Knowledge Architecture */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald-light)', fontWeight: 700, fontSize: '14px' }}>
              <Lock size={17} />
              <span>100% Offline-First Privacy Guarantee</span>
            </div>
            <p style={{ margin: 0 }}>
              Your financial privacy is sacred. All ledger entries, bank accounts, credit card balances, and voice transcripts are processed and stored locally on your device in your browser's encrypted IndexedDB storage.
            </p>
            <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li>Zero telemetry or tracking pixels</li>
              <li>Zero financial data sold to advertisers or third-party aggregators</li>
              <li>Works 100% offline without an active internet connection</li>
            </ul>
          </div>

          {/* Data Portability */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-sky)', fontWeight: 700, fontSize: '14px' }}>
              <Download size={17} />
              <span>Full Data Sovereignty & Portability</span>
            </div>
            <p style={{ margin: 0 }}>
              You own 100% of your data. You can download and export your entire financial history anytime in standard CSV or structured JSON backup format from the Transaction History tab.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            PocketTrack v1.0 • Built for Privacy
          </span>
          <button type="button" className="btn-primary" onClick={onClose}>
            <Check size={16} />
            <span>I Understand</span>
          </button>
        </div>

      </div>
    </div>
  );
};
