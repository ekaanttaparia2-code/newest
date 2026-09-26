import { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { useAccounts } from './hooks/useAccounts';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';
import { useStreak } from './hooks/useStreak';
import { PrivacyProvider } from './context/PrivacyContext';
import { AuthProvider } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

import { Header } from './components/layout/Header';
import { Sidebar, type NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MobileFrameWrapper } from './components/mobile/MobileFrameWrapper';

import { WelcomeExplainer } from './components/welcome/WelcomeExplainer';
import { AuthLanding } from './components/welcome/AuthLanding';
import { BalanceMathGuide } from './components/dashboard/BalanceMathGuide';
import { GettingStartedCard } from './components/dashboard/GettingStartedCard';
import { BankCardCarousel } from './components/dashboard/BankCardCarousel';
import { QuickTapBar } from './components/dashboard/QuickTapBar';
import { NetWorthHero } from './components/dashboard/NetWorthHero';
import { FinancialHealthScore } from './components/dashboard/FinancialHealthScore';
import { WeeklyDigestCard } from './components/dashboard/WeeklyDigestCard';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { BudgetProgressOverview } from './components/dashboard/BudgetProgressOverview';

import { TransactionHistoryView } from './components/transactions/TransactionHistoryView';
import { AccountsView } from './components/accounts/AccountsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SavingsGoalsView } from './components/goals/SavingsGoalsView';
import { WealthSimulatorView } from './components/wealth/WealthSimulatorView';
import { SubscriptionsRadarView } from './components/subscriptions/SubscriptionsRadarView';
import { DebtPayoffView } from './components/debt/DebtPayoffView';
import { FireRunwayView } from './components/wealth/FireRunwayView';

import { VoiceLogModal } from './components/transactions/VoiceLogModal';
import { TransactionModal } from './components/transactions/TransactionModal';
import { TransferModal } from './components/transactions/TransferModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingTour } from './components/onboarding/OnboardingTour';
import { LegalDisclaimerModal } from './components/legal/LegalDisclaimerModal';

import './App.css';

interface MainAppProps {
  onReopenExplainer: () => void;
}

function MainApp({ onReopenExplainer }: MainAppProps) {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [visitedTabs, setVisitedTabs] = useState<string[]>([]);

  useEffect(() => {
    setVisitedTabs(prev => (prev.includes(currentTab) ? prev : [...prev, currentTab]));
  }, [currentTab]);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(() => {
    return localStorage.getItem('pockettrack_mobile_frame') === 'true';
  });
  
  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    return localStorage.getItem('pockettrack_tour_completed') !== 'true';
  });

  const { t } = useLanguage();

  // Core Data Hooks
  const { accounts, netWorth, totalAssets, totalLiabilities, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const { currentStreak, isLoggedToday } = useStreak(transactions);

  // Monthly stats calculation
  const { monthlyIncome, monthlyExpense } = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let income = 0;
    let expense = 0;

    transactions.forEach(tx => {
      if (tx.date.startsWith(currentMonthPrefix)) {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
      }
    });

    return { monthlyIncome: income, monthlyExpense: expense };
  }, [transactions]);

  // 50-30-20 Envelope Budget calculations
  const { budgetStatuses, updateCategoryBudget, groupSummary, applySuggestedBudgets } = useBudgets(monthlyIncome);

  const toggleMobileFrame = () => {
    setIsMobileFrame(prev => {
      const next = !prev;
      localStorage.setItem('pockettrack_mobile_frame', String(next));
      return next;
    });
  };

  // Page titles localized
  const pageTitles: Record<NavTab, string> = {
    dashboard: t.executiveDashboard,
    transactions: t.activityHistory,
    accounts: t.accountsVault,
    budgets: t.budgetsLimits,
    analytics: t.cashFlowInsights,
    goals: t.savingsGoals,
    simulator: t.wealthSimulator,
    debt: 'Debt Payoff Planner',
    fire: 'FIRE & Runway Horizon',
    subscriptions: t.subscriptionsRadar
  };

  const handleTransfer = async (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    notes?: string;
  }) => {
    await addTransaction({
      amount: data.amount,
      type: 'transfer',
      accountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      notes: data.notes
    });
  };

  const handleQuickLog = async (data: {
    amount: number;
    notes: string;
    categoryId: string;
    accountId: string;
    type?: 'income' | 'expense';
  }) => {
    const targetAccount = accounts.find(a => a.id === data.accountId) || accounts[0];
    if (!targetAccount) return;

    await addTransaction({
      amount: data.amount,
      type: data.type || 'expense',
      accountId: targetAccount.id,
      categoryId: data.categoryId,
      notes: data.notes
    });
  };

  return (
    <MobileFrameWrapper isMobileFrame={isMobileFrame}>
      <div className={`app-container ${isMobileFrame ? 'mobile-mode-active' : ''}`}>
        {/* Desktop Sidebar (hidden when mobile frame is active or screen is small) */}
        {!isMobileFrame && (
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenLegalModal={() => setIsLegalModalOpen(true)}
          />
        )}

        {/* Main Viewport */}
        <main className="main-viewport">
          <Header
            pageTitle={pageTitles[currentTab]}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
            onOpenTour={() => setIsTourOpen(true)}
            onReopenExplainer={onReopenExplainer}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={toggleMobileFrame}
            onOpenLegalModal={() => setIsLegalModalOpen(true)}
          />

          <div className="content-container">
            {currentTab === 'dashboard' && (
              <>
                {/* Getting Started First Steps Checklist (Dismissible Banner) */}
                <GettingStartedCard
                  hasTransactions={transactions.length > 0}
                  hasVisitedBudgets={visitedTabs.includes('budgets')}
                  hasVisitedSimulator={visitedTabs.includes('simulator')}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  onSelectTab={setCurrentTab}
                />

                {/* Net Worth Hero (Executive Dashboard Centerpiece) */}
                <NetWorthHero
                  netWorth={netWorth}
                  totalAssets={totalAssets}
                  totalLiabilities={totalLiabilities}
                  monthlyIncome={monthlyIncome}
                  monthlyExpense={monthlyExpense}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
                />

                {/* Instant 1-Tap Log Bar */}
                <QuickTapBar
                  accounts={accounts}
                  categories={categories}
                  onQuickLog={handleQuickLog}
                />

                {/* Bank Card Carousel (Authentic Digital Wallet) */}
                <BankCardCarousel
                  accounts={accounts}
                  onOpenTransfer={() => setIsTransferModalOpen(true)}
                />

                {/* Dual Intelligence & Health Grid (Balanced 2-Column Desktop Grid) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
                  <FinancialHealthScore
                    netWorth={netWorth}
                    totalAssets={totalAssets}
                    totalLiabilities={totalLiabilities}
                    monthlyIncome={monthlyIncome}
                    monthlyExpense={monthlyExpense}
                    streak={currentStreak}
                    isLoggedToday={isLoggedToday}
                  />
                  <WeeklyDigestCard
                    transactions={transactions}
                    categories={categories}
                    accounts={accounts}
                    onExploreInsights={() => setCurrentTab('analytics')}
                  />
                </div>

                {/* Recent Activity & Monthly Budgets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
                  <RecentTransactions
                    transactions={transactions}
                    categories={categories}
                    accounts={accounts}
                    onDelete={deleteTransaction}
                    onViewAll={() => setCurrentTab('transactions')}
                  />
                  <BudgetProgressOverview
                    budgetStatuses={budgetStatuses}
                    onViewBudgets={() => setCurrentTab('budgets')}
                  />
                </div>

                {/* Interactive Balance Math Sandbox & Explainer (Bottom Section) */}
                <div style={{ marginTop: '12px' }}>
                  <BalanceMathGuide
                    primaryAccount={accounts[0]}
                    monthlyIncome={monthlyIncome}
                    monthlyExpense={monthlyExpense}
                    netWorth={netWorth}
                    onQuickLog={async (data) => {
                      await handleQuickLog({
                        amount: data.amount,
                        type: data.type,
                        accountId: data.accountId,
                        categoryId: data.categoryId,
                        notes: data.notes
                      });
                    }}
                  />
                </div>
              </>
            )}

            {currentTab === 'transactions' && (
              <TransactionHistoryView
                transactions={transactions}
                categories={categories}
                accounts={accounts}
                onDelete={deleteTransaction}
                onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
                onOpenVoiceLog={() => setIsVoiceModalOpen(true)}
              />
            )}

            {currentTab === 'accounts' && (
              <AccountsView
                accounts={accounts}
                netWorth={netWorth}
                totalAssets={totalAssets}
                totalLiabilities={totalLiabilities}
                onAddAccount={addAccount}
                onDeleteAccount={deleteAccount}
                onOpenTransferModal={() => setIsTransferModalOpen(true)}
              />
            )}

            {currentTab === 'budgets' && (
              <BudgetsView
                budgetStatuses={budgetStatuses}
                allCategories={categories}
                onUpdateLimit={updateCategoryBudget}
                groupSummary={groupSummary}
                monthlyIncome={monthlyIncome}
                onApplySalaryPlan={applySuggestedBudgets}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView
                transactions={transactions}
                categories={categories}
              />
            )}

            {currentTab === 'goals' && (
              <SavingsGoalsView />
            )}

            {currentTab === 'simulator' && (
              <WealthSimulatorView />
            )}

            {currentTab === 'debt' && (
              <DebtPayoffView
                accounts={accounts}
                onUpdateAccount={updateAccount}
              />
            )}

            {currentTab === 'fire' && (
              <FireRunwayView
                accounts={accounts}
                transactions={transactions}
                monthlyIncome={monthlyIncome}
              />
            )}

            {currentTab === 'subscriptions' && (
              <SubscriptionsRadarView />
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation (shown on mobile or when Phone Frame is active) */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenLegalModal={() => setIsLegalModalOpen(true)}
          onReopenExplainer={onReopenExplainer}
          isMobileFrame={isMobileFrame}
        />

        {/* Modals */}
        <VoiceLogModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          categories={categories}
          accounts={accounts}
          onSave={addTransaction}
        />

        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          categories={categories}
          accounts={accounts}
          onSave={addTransaction}
        />

        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          accounts={accounts}
          onTransfer={handleTransfer}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <OnboardingTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
        />

        <LegalDisclaimerModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
        />
      </div>
    </MobileFrameWrapper>
  );
}

type AppStage = 'explainer' | 'auth' | 'app';

function RootApp() {
  const [stage, setStage] = useState<AppStage>(() => {
    const saved = localStorage.getItem('pockettrack_stage');
    if (saved === 'app' || saved === 'auth' || saved === 'explainer') {
      return saved;
    }
    return 'explainer';
  });
  const [reopenedFromApp, setReopenedFromApp] = useState<boolean>(false);

  const returnToApp = () => {
    setReopenedFromApp(false);
    localStorage.setItem('pockettrack_stage', 'app');
    setStage('app');
  };

  const handleEnterApp = async (userData: { name: string; startingBalance: number; accountName: string }) => {
    const txCount = await db.transactions.count();
    const accCount = await db.accounts.count();
    if (
      (txCount > 0 || accCount > 0) &&
      !window.confirm('This will reset your vault and clear all existing transactions and accounts. Do you want to continue?')
    ) {
      return;
    }
    await db.initializeCleanVault(userData.name, userData.accountName, userData.startingBalance);
    localStorage.setItem('pockettrack_stage', 'app');
    setReopenedFromApp(false);
    setStage('app');
  };

  const handleQuickStartGuest = async () => {
    const txCount = await db.transactions.count();
    const accCount = await db.accounts.count();
    if (
      (txCount > 0 || accCount > 0) &&
      !window.confirm('This will reset your vault and clear all existing transactions and accounts. Do you want to continue?')
    ) {
      return;
    }
    await db.initializeCleanVault('Guest User', 'UPI Wallet & Cash', 2000);
    localStorage.setItem('pockettrack_stage', 'app');
    setReopenedFromApp(false);
    setStage('app');
  };

  const handleCompleteOnboarding = async (data: {
    userName: string;
    startingBalance: number;
    accountName: string;
    stressLevel: number;
    triggers: string[];
    primaryGoal: string;
    monthlyIncome: number;
  }) => {
    localStorage.setItem(
      'pockettrack_finny_profile',
      JSON.stringify({
        stressLevel: data.stressLevel,
        triggers: data.triggers,
        primaryGoal: data.primaryGoal,
        monthlyIncome: data.monthlyIncome,
        completedAt: new Date().toISOString()
      })
    );

    if (reopenedFromApp) {
      returnToApp();
      return;
    }

    await handleEnterApp({
      name: data.userName || 'My Vault',
      startingBalance: data.startingBalance || 5000,
      accountName: data.accountName || 'Primary Bank / UPI'
    });
  };

  if (stage === 'explainer') {
    return (
      <WelcomeExplainer
        onContinueToAuth={() => {
          if (!reopenedFromApp) {
            localStorage.setItem('pockettrack_stage', 'auth');
          }
          setStage('auth');
        }}
        onQuickStartGuest={handleQuickStartGuest}
        onReturnToApp={reopenedFromApp ? returnToApp : undefined}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    );
  }

  if (stage === 'auth') {
    return (
      <AuthLanding
        onBackToExplainer={() => {
          if (!reopenedFromApp) {
            localStorage.setItem('pockettrack_stage', 'explainer');
          }
          setStage('explainer');
        }}
        onEnterApp={handleEnterApp}
        onReturnToApp={reopenedFromApp ? returnToApp : undefined}
      />
    );
  }

  return (
    <MainApp
      onReopenExplainer={() => {
        setReopenedFromApp(true);
        setStage('explainer');
      }}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <PrivacyProvider>
          <AuthProvider>
            <SyncProvider>
              <RootApp />
            </SyncProvider>
          </AuthProvider>
        </PrivacyProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
