import React, { useState } from 'react';
import type { Account, AccountType } from '../../db/types';
import { usePrivacy } from '../../context/PrivacyContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { Landmark, Plus, ArrowRightLeft, CreditCard, Building2, Vault, Banknote, Trash2, X, Check, AlertCircle } from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  onAddAccount: (data: { name: string; type: AccountType; balance: number; institution?: string }) => Promise<any>;
  onDeleteAccount: (id: string) => Promise<any>;
  onOpenTransferModal: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  netWorth,
  totalAssets,
  totalLiabilities,
  onAddAccount,
  onDeleteAccount,
  onOpenTransferModal
}) => {
  const { isPrivacyMasked } = usePrivacy();
  const { symbol, formatAmount } = useCurrency();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newAccName, setNewAccName] = useState<string>('');
  const [newAccType, setNewAccType] = useState<AccountType>('checking');
  const [newAccBalance, setNewAccBalance] = useState<string>('');
  const [newAccInstitution, setNewAccInstitution] = useState<string>('');

  useModalAccessibility(isAddModalOpen, () => setIsAddModalOpen(false));

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'checking': return <Building2 size={20} />;
      case 'savings': return <Vault size={20} />;
      case 'credit': return <CreditCard size={20} />;
      case 'cash': return <Banknote size={20} />;
      case 'investment': return <Landmark size={20} />;
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawBalance = parseFloat(newAccBalance) || 0;
    if (!newAccName.trim()) return;

    // Credit cards are liabilities: entered debt is stored as negative balance
    const balance = newAccType === 'credit' ? -Math.abs(rawBalance) : rawBalance;

    await onAddAccount({
      name: newAccName.trim(),
      type: newAccType,
      balance,
      institution: newAccInstitution.trim()
    });

    setNewAccName('');
    setNewAccBalance('');
    setNewAccInstitution('');
    setIsAddModalOpen(false);
  };

  const assetAccounts = accounts.filter(a => a.type !== 'credit');
  const liabilityAccounts = accounts.filter(a => a.type === 'credit');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Financial Accounts & Balance Sheet
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage liquid assets, bank deposits, cash reserves, and liability cards
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onOpenTransferModal}>
            <ArrowRightLeft size={16} />
            <span>Transfer Funds</span>
          </button>
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Total Net Worth
          </div>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatAmount(netWorth, isPrivacyMasked)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Assets minus Total Liabilities
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-emerald-light)', fontWeight: 700 }}>
            Total Assets
          </div>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald-light)', marginTop: '4px' }}>
            {formatAmount(totalAssets, isPrivacyMasked)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            {assetAccounts.length} Active Asset Accounts
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-rose-light)', fontWeight: 700 }}>
            Total Liabilities & Owed
          </div>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-rose-light)', marginTop: '4px' }}>
            {formatAmount(totalLiabilities, isPrivacyMasked)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            {liabilityAccounts.length} Credit Accounts / Overdrafts
          </span>
        </div>

      </div>

      {/* Asset Accounts Section */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Asset & Liquid Accounts ({assetAccounts.length})
        </h3>
        
        {assetAccounts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No asset accounts active. Click "+ Add Account" to create a savings, checking, or cash vault.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {assetAccounts.map(acc => {
              const isOverdraft = acc.balance < 0;
              return (
                <div
                  key={acc.id}
                  className="glass-panel interactive-card"
                  style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: acc.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getAccountIcon(acc.type)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{acc.name}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {acc.institution || acc.type.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)',
                          fontWeight: 700
                        }}
                      >
                        {acc.type}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                        {isOverdraft ? 'Overdraft Due' : 'Available Balance'}
                      </span>
                      <span
                        className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: isOverdraft ? 'var(--accent-rose-light)' : 'var(--accent-emerald-light)'
                        }}
                      >
                        {formatAmount(acc.balance, isPrivacyMasked)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Archive account "${acc.name}"? It will be hidden from active balances.`)) {
                          onDeleteAccount(acc.id);
                        }
                      }}
                      className="btn-icon"
                      style={{ width: '32px', height: '32px', color: 'var(--text-faint)' }}
                      title="Archive account"
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

      {/* Liabilities & Credit Cards Section */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Liabilities & Credit Cards ({liabilityAccounts.length})
        </h3>

        {liabilityAccounts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No credit cards or debt accounts registered. Zero debt logged!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {liabilityAccounts.map(acc => {
              const outstandingDue = Math.abs(acc.balance);
              return (
                <div
                  key={acc.id}
                  className="glass-panel interactive-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px',
                    borderColor: 'rgba(244, 63, 94, 0.25)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'rgba(244, 63, 94, 0.12)',
                            color: 'var(--accent-rose)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{acc.name}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {acc.institution || 'Credit Facility'}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(244, 63, 94, 0.15)',
                          color: 'var(--accent-rose-light)',
                          fontWeight: 700
                        }}
                      >
                        Liability
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Outstanding Due</span>
                      <span
                        className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: 'var(--accent-rose-light)'
                        }}
                      >
                        {formatAmount(outstandingDue, isPrivacyMasked)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Archive card/liability "${acc.name}"? It will be hidden from active balances.`)) {
                          onDeleteAccount(acc.id);
                        }
                      }}
                      className="btn-icon"
                      style={{ width: '32px', height: '32px', color: 'var(--text-faint)' }}
                      title="Archive card"
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

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Create New Account</h3>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., HDFC Millennia, SBI Salary, Cash Drawer"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as AccountType)}
                  >
                    <option value="checking">Checking / Current</option>
                    <option value="savings">Savings Account</option>
                    <option value="credit">Credit Card (Liability)</option>
                    <option value="cash">Cash / UPI Wallet</option>
                    <option value="investment">Investment / Brokerage</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Institution / Bank</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., HDFC, ICICI, Zerodha"
                    value={newAccInstitution}
                    onChange={e => setNewAccInstitution(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">
                  {newAccType === 'credit'
                    ? `Current Outstanding Balance / Owed (${symbol})`
                    : `Starting Available Balance (${symbol})`}
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input font-mono"
                  placeholder="0.00"
                  value={newAccBalance}
                  onChange={e => setNewAccBalance(e.target.value)}
                  required
                />
                {newAccType === 'credit' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-rose-light)', marginTop: '6px' }}>
                    <AlertCircle size={13} />
                    <span>Credit card balances are liabilities that subtract from your net worth.</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
