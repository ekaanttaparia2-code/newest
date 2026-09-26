import React from 'react';
import type { Transaction, Category } from '../../db/types';
import { usePrivacy } from '../../context/PrivacyContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { CategoryTrendWatch } from './CategoryTrendWatch';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories
}) => {
  const { isPrivacyMasked } = usePrivacy();
  const { formatAmount } = useCurrency();

  // 1. Spending by Category Data
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((s, t) => s + t.amount, 0);

  const categoryTotals: Record<string, number> = {};
  expenseTransactions.forEach(t => {
    const catId = t.categoryId || 'other';
    categoryTotals[catId] = (categoryTotals[catId] || 0) + t.amount;
  });

  const pieData = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Uncategorized',
        value: Math.round(amount * 100) / 100,
        color: cat?.color || '#94a3b8'
      };
    })
    .sort((a, b) => b.value - a.value);

  // 2. Monthly Cash Flow Data (Last 6 months)
  const monthlyDataMap: Record<string, { month: string; income: number; expense: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    monthlyDataMap[key] = { month: label, income: 0, expense: 0 };
  }

  transactions.forEach(t => {
    const key = t.date.substring(0, 7);
    if (monthlyDataMap[key]) {
      if (t.type === 'income') {
        monthlyDataMap[key].income += t.amount;
      } else if (t.type === 'expense') {
        monthlyDataMap[key].expense += t.amount;
      }
    }
  });

  const barData = Object.values(monthlyDataMap);

  // Top spending category
  const topCategory = pieData[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Cash Flow & Spending Analytics
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Deep insights into your financial velocity, burn rate, and capital distribution
        </p>
      </div>

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Total Outflow Tracked
          </span>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-rose-light)', marginTop: '4px' }}>
            {formatAmount(totalExpense, isPrivacyMasked)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Top Expense Category
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {topCategory ? topCategory.name : 'N/A'}
          </div>
          {topCategory && (
            <span className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {formatAmount(topCategory.value, isPrivacyMasked)} ({Math.round((topCategory.value / totalExpense) * 100)}%)
            </span>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Active Categories
          </span>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {pieData.length}
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        
        {/* Spending by Category Donut */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieIcon size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Spending by Category</h3>
          </div>

          {pieData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No expense data recorded yet.
            </div>
          ) : (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-surface)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatAmount(Number(val), isPrivacyMasked), 'Spent']}
                    contentStyle={{ background: '#0e131f', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top 4 Legend Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
            {pieData.slice(0, 5).map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                <span>{item.name}</span>
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                  ({Math.round((item.value / totalExpense) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Cash Flow Bars */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BarChart3 size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Income vs. Expense Trend</h3>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatAmount(Number(val), isPrivacyMasked)]}
                  contentStyle={{ background: '#0e131f', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Inflation Watch & Category Creep */}
      <CategoryTrendWatch transactions={transactions} categories={categories} />

    </div>
  );
};
