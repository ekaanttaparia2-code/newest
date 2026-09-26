import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { Calculator, Rocket, Info, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { simulateSip } from '../../lib/finance';

export const WealthSimulatorView: React.FC = () => {
  const { symbol, formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(15000);
  const [annualReturn, setAnnualReturn] = useState<number>(12); // 12% standard Nifty/Mutual Funds
  const [years, setYears] = useState<number>(10);
  const [inflationRate, setInflationRate] = useState<number>(6); // 6% Indian long-term CPI benchmark
  const [stepUpPercent, setStepUpPercent] = useState<number>(10); // 10% annual salary step-up
  const [enableStepUp, setEnableStepUp] = useState<boolean>(true);

  const simulation = useMemo(() => {
    return simulateSip({
      initialMonthlyDeposit: monthlyDeposit,
      annualReturnRate: annualReturn,
      years,
      annualInflationRate: inflationRate,
      annualStepUpPercent: enableStepUp ? stepUpPercent : 0,
      isAnnuityDue: false // Standard Indian SIP convention (end of month)
    });
  }, [monthlyDeposit, annualReturn, years, inflationRate, stepUpPercent, enableStepUp]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Wealth & SIP Simulator 2.0 (Real Purchasing Power)
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Accurate compounding with inflation deflation & annual step-up modeling
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'var(--accent-emerald-light)', fontSize: '12px', fontWeight: 700 }}>
            <Rocket size={14} />
            <span>{simulation.wealthMultiplier}x Nominal Multiplier</span>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Monthly Investment Slider */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Initial Monthly SIP
            </span>
            <span className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>
              {symbol}{monthlyDeposit.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={monthlyDeposit}
            onChange={e => setMonthlyDeposit(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            <span>{symbol}1,000</span>
            <span>{symbol}50,000</span>
            <span>{symbol}1,00,000</span>
          </div>
        </div>

        {/* Expected Return Slider */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Expected CAGR Return
            </span>
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
              {annualReturn}% p.a.
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="22"
            step="0.5"
            value={annualReturn}
            onChange={e => setAnnualReturn(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            <span>6% (FD)</span>
            <span>12% (Nifty Index)</span>
            <span>18% (Mid/Smallcap)</span>
          </div>
        </div>

        {/* Time Horizon Slider */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Investment Horizon
            </span>
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-amber)' }}>
              {years} Years
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            <span>1 Year</span>
            <span>15 Years</span>
            <span>30 Years</span>
          </div>
        </div>

        {/* Inflation Adjustment Slider */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Inflation Deflator
              <span title="Discount future rupees using India's long term CPI benchmark (default 6%)">
                <Info size={13} color="var(--text-muted)" />
              </span>
            </span>
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-rose-light)' }}>
              {inflationRate}% p.a.
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={inflationRate}
            onChange={e => setInflationRate(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-rose)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            <span>0% (Nominal)</span>
            <span>6% (India CPI Benchmark)</span>
            <span>10% (High Inflation)</span>
          </div>
        </div>

        {/* Annual Step-Up Slider */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableStepUp}
                onChange={e => setEnableStepUp(e.target.checked)}
                style={{ accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
              />
              Annual Step-Up ({enableStepUp ? `${stepUpPercent}%` : 'Off'})
            </label>
            <span className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: enableStepUp ? 'var(--accent-emerald-light)' : 'var(--text-muted)' }}>
              {enableStepUp ? `+${stepUpPercent}% / yr` : 'Disabled'}
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            disabled={!enableStepUp}
            value={stepUpPercent}
            onChange={e => setStepUpPercent(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: enableStepUp ? 'pointer' : 'not-allowed', opacity: enableStepUp ? 1 : 0.4 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            <span>5%</span>
            <span>10% (Salary Hike)</span>
            <span>25%</span>
          </div>
        </div>

      </div>

      {/* Projection Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '22px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Total Capital Invested
          </span>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatAmount(simulation.totalNominalInvested, isPrivacyMasked)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            {enableStepUp ? `Starts at ${symbol}${monthlyDeposit.toLocaleString('en-IN')}/mo with +${stepUpPercent}% annual hike` : 'Fixed monthly contribution'}
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '22px', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 19, 31, 0.9) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-emerald-light)', fontWeight: 700 }}>
              Future Nominal Corpus
            </span>
            <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              Future ₹
            </span>
          </div>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald-light)', marginTop: '4px' }}>
            {formatAmount(simulation.finalNominalWealth, isPrivacyMasked)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Estimated paper balance after {years} years
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '22px', border: '1px solid rgba(245, 158, 11, 0.35)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(14, 19, 31, 0.9) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-amber)', fontWeight: 700 }}>
              Real Buying Power
            </span>
            <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              In Today's Money
            </span>
          </div>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {formatAmount(simulation.finalRealWealth, isPrivacyMasked)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Discounted at {inflationRate}% inflation (Retains {simulation.purchasingPowerRetainedPercent}% purchasing power)
          </span>
        </div>

      </div>

      {/* Interactive Growth Trajectory Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Compounding Trajectory: Nominal vs. Real Purchasing Power</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              See how inflation impacts purchasing power over {years} years
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              <span>Nominal Corpus (Future ₹)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-amber)' }} />
              <span>Real Buying Power (Today's ₹)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.3)' }} />
              <span>Capital Invested</span>
            </div>
          </div>
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulation.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="yearLabel" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatAmount(Number(val), isPrivacyMasked),
                  name === 'nominalWealth' ? 'Nominal Corpus' : name === 'realWealth' ? "In Today's Money" : 'Invested Capital'
                ]}
                contentStyle={{ background: '#0e131f', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="nominalWealth" name="nominalWealth" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#wealthGrad)" />
              <Area type="monotone" dataKey="realWealth" name="realWealth" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" fillOpacity={1} fill="url(#realGrad)" />
              <Area type="monotone" dataKey="nominalInvested" name="nominalInvested" stroke="#94a3b8" strokeWidth={1.5} fillOpacity={1} fill="url(#investedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Assumptions & Disclosure Shield */}
      <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <ShieldCheck size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Modeling Methodology & Regulatory Disclosures:</span> Compounding is calculated on a monthly schedule according to Association of Mutual Funds in India (AMFI) conventions. Real purchasing power is discounted using the Fisher deflation formula: FV(real) = FV(nominal) / (1 + inflation)^n. Projected returns are indicative annualized estimates and do not guarantee future performance. PocketTrack does not provide licensed SEBI investment advice.
          </div>
        </div>
      </div>

    </div>
  );
};
