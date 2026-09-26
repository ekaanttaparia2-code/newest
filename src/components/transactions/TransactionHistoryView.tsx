import React, { useState } from 'react';
import type { Transaction, Category, Account, TransactionType } from '../../db/types';
import { formatDate } from '../../lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';
import { usePrivacy } from '../../context/PrivacyContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Search, Download, Trash2, ArrowRightLeft, Mic, Plus } from 'lucide-react';

interface TransactionHistoryViewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onDelete: (id: string) => Promise<void>;
  onOpenNewTransaction: () => void;
  onOpenVoiceLog: () => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  transactions,
  categories,
  accounts,
  onDelete,
  onOpenNewTransaction,
  onOpenVoiceLog
}) => {
  const { isPrivacyMasked } = usePrivacy();
  const { formatAmount } = useCurrency();
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (accountFilter !== 'all' && tx.accountId !== accountFilter && tx.toAccountId !== accountFilter) return false;
    if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const notesMatch = tx.notes?.toLowerCase().includes(q);
      const amountMatch = tx.amount.toString().includes(q);
      const tagsMatch = tx.tags?.some(t => t.toLowerCase().includes(q));
      if (!notesMatch && !amountMatch && !tagsMatch) return false;
    }
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Account', 'Destination Account', 'Category', 'Notes', 'Tags'];
    const rows = filteredTransactions.map(tx => {
      const cat = categories.find(c => c.id === tx.categoryId)?.name || (tx.type === 'transfer' ? 'Transfer' : '');
      const acc = accounts.find(a => a.id === tx.accountId)?.name || '';
      const toAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId)?.name || '' : '';
      return [
        tx.date.substring(0, 10),
        tx.type,
        tx.amount,
        `"${acc.replace(/"/g, '""')}"`,
        `"${toAcc.replace(/"/g, '""')}"`,
        `"${cat.replace(/"/g, '""')}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
        `"${(tx.tags || []).join(', ').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pockettrack_export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      version: 1,
      totalCount: filteredTransactions.length,
      transactions: filteredTransactions.map(tx => {
        const cat = categories.find(c => c.id === tx.categoryId)?.name || (tx.type === 'transfer' ? 'Transfer' : undefined);
        const acc = accounts.find(a => a.id === tx.accountId)?.name || undefined;
        const toAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId)?.name || undefined : undefined;
        return {
          ...tx,
          _accountName: acc,
          _destinationAccountName: toAcc,
          _categoryName: cat
        };
      })
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `pockettrack_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Controls Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search transactions, notes, or tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', height: '42px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Type Filter */}
          <select
            className="form-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
            <option value="transfer">Transfers Only</option>
          </select>

          {/* Account Filter */}
          <select
            className="form-select"
            value={accountFilter}
            onChange={e => setAccountFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            className="form-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Data Exports */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={exportToCSV}
              title="Export filtered records to CSV"
            >
              <Download size={15} />
              <span>CSV</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={exportToJSON}
              title="Backup records as structured JSON"
            >
              <Download size={15} />
              <span>JSON Backup</span>
            </button>
          </div>

          {/* Action buttons */}
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenVoiceLog}
            style={{ color: 'var(--accent-emerald-light)' }}
          >
            <Mic size={15} />
            <span>Voice</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenNewTransaction}
          >
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>

      </div>

      {/* Transactions Table / List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Showing {filteredTransactions.length} of {transactions.length} records
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            No matching transactions found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0, 0, 0, 0.2)' }}>
                  <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Category & Details</th>
                  <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Account</th>
                  <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const toAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : undefined;
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Date */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(tx.date)}
                      </td>

                      {/* Details & Category */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: isExpense ? 'rgba(244, 63, 94, 0.12)' : isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                              color: isExpense ? 'var(--accent-rose-light)' : isIncome ? 'var(--accent-emerald-light)' : '#a5b4fc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {isTransfer ? <ArrowRightLeft size={15} /> : <CategoryIcon iconName={cat?.icon} size={15} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {tx.notes || (isTransfer ? 'Account Transfer' : cat?.name || 'Uncategorized')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              {cat && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.name}</span>}
                              {tx.tags && tx.tags.length > 0 && tx.tags.map(tag => (
                                <span key={tag} style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {isTransfer ? `${acc?.name} → ${toAcc?.name}` : acc?.name}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span
                          className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: isExpense ? 'var(--accent-rose-light)' : isIncome ? 'var(--accent-emerald-light)' : 'var(--text-primary)'
                          }}
                        >
                          {isExpense ? '-' : isIncome ? '+' : ''}
                          {formatAmount(tx.amount, isPrivacyMasked)}
                        </span>
                      </td>

                      {/* Delete */}
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this transaction? This will reverse the account balance adjustment.')) {
                              onDelete(tx.id);
                            }
                          }}
                          className="btn-icon"
                          style={{ width: '32px', height: '32px', margin: '0 auto', color: 'var(--text-faint)' }}
                          title="Delete transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
