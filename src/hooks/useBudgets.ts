import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Category } from '../db/types';

export interface CategoryBudgetStatus {
  category: Category;
  limit: number;
  spent: number;
  remaining: number; // negative if overspent
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  overspentAmount: number;
}

export interface UnbudgetedCategoryStatus {
  category: Category;
  spent: number;
}

export interface GroupBudgetSummary {
  needs: { spent: number; limit: number; suggested: number; percentage: number };
  wants: { spent: number; limit: number; suggested: number; percentage: number };
  savings: { spent: number; limit: number; suggested: number; percentage: number };
  totalLimit: number;
  totalSpent: number;
}

export const getCategoryGroup = (cat: Category): 'needs' | 'wants' | 'savings' => {
  if (cat.group) return cat.group;
  const name = cat.name.toLowerCase();
  if (
    name.includes('rent') ||
    name.includes('house') ||
    name.includes('grocer') ||
    name.includes('kirana') ||
    name.includes('util') ||
    name.includes('bill') ||
    name.includes('health') ||
    name.includes('pharm') ||
    name.includes('transport') ||
    name.includes('petrol') ||
    name.includes('fuel') ||
    name.includes('cab')
  ) {
    return 'needs';
  }
  if (
    name.includes('sip') ||
    name.includes('invest') ||
    name.includes('mutual') ||
    name.includes('save') ||
    name.includes('saving') ||
    name.includes('fund')
  ) {
    return 'savings';
  }
  return 'wants';
};

export function useBudgets(monthlyIncome: number = 0) {
  const categories = useLiveQuery(() => db.categories.where('type').equals('expense').toArray()) || [];

  const data = useLiveQuery(async (): Promise<{
    budgetStatuses: CategoryBudgetStatus[];
    unbudgetedCategories: UnbudgetedCategoryStatus[];
    groupSummary: GroupBudgetSummary;
  }> => {
    const expenseCats = await db.categories.where('type').equals('expense').toArray();

    // Current month prefix (YYYY-MM)
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const allTransactions = await db.transactions.toArray();
    const monthlyTransactions = allTransactions.filter(tx => tx.date && tx.date.startsWith(monthPrefix));

    const budgeted: CategoryBudgetStatus[] = [];
    const unbudgeted: UnbudgetedCategoryStatus[] = [];

    // Group aggregators for 50-30-20
    const groupSpent = { needs: 0, wants: 0, savings: 0 };
    const groupLimit = { needs: 0, wants: 0, savings: 0 };

    for (const cat of expenseCats) {
      const spent = monthlyTransactions
        .filter(tx => tx.categoryId === cat.id && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const limit = cat.budgetLimit || 0;
      const grp = getCategoryGroup(cat);

      groupSpent[grp] += spent;
      groupLimit[grp] += limit;

      if (limit > 0) {
        const remaining = limit - spent;
        const percentage = (spent / limit) * 100;
        budgeted.push({
          category: cat,
          limit,
          spent,
          remaining,
          percentage,
          isOverBudget: spent > limit,
          isNearLimit: percentage >= 80 && spent <= limit,
          overspentAmount: Math.max(0, spent - limit)
        });
      } else {
        unbudgeted.push({
          category: cat,
          spent
        });
      }
    }

    budgeted.sort((a, b) => b.percentage - a.percentage);
    unbudgeted.sort((a, b) => b.spent - a.spent);

    // 50-30-20 suggested splits based on user salary / monthly income (or fallback baseline ₹50,000)
    const baselineIncome = monthlyIncome > 0 ? monthlyIncome : 50000;
    const suggestedNeeds = Math.round(baselineIncome * 0.50);
    const suggestedWants = Math.round(baselineIncome * 0.30);
    const suggestedSavings = Math.round(baselineIncome * 0.20);

    const groupSummary: GroupBudgetSummary = {
      needs: {
        spent: groupSpent.needs,
        limit: groupLimit.needs,
        suggested: suggestedNeeds,
        percentage: groupLimit.needs > 0 ? (groupSpent.needs / groupLimit.needs) * 100 : 0
      },
      wants: {
        spent: groupSpent.wants,
        limit: groupLimit.wants,
        suggested: suggestedWants,
        percentage: groupLimit.wants > 0 ? (groupSpent.wants / groupLimit.wants) * 100 : 0
      },
      savings: {
        spent: groupSpent.savings,
        limit: groupLimit.savings,
        suggested: suggestedSavings,
        percentage: groupLimit.savings > 0 ? (groupSpent.savings / groupLimit.savings) * 100 : 0
      },
      totalLimit: groupLimit.needs + groupLimit.wants + groupLimit.savings,
      totalSpent: groupSpent.needs + groupSpent.wants + groupSpent.savings
    };

    return {
      budgetStatuses: budgeted,
      unbudgetedCategories: unbudgeted,
      groupSummary
    };
  }, [monthlyIncome]) || {
    budgetStatuses: [],
    unbudgetedCategories: [],
    groupSummary: {
      needs: { spent: 0, limit: 0, suggested: 0, percentage: 0 },
      wants: { spent: 0, limit: 0, suggested: 0, percentage: 0 },
      savings: { spent: 0, limit: 0, suggested: 0, percentage: 0 },
      totalLimit: 0,
      totalSpent: 0
    }
  };

  const updateCategoryBudget = async (categoryId: string, limit: number) => {
    const safeLimit = Math.max(0, limit);
    await db.categories.update(categoryId, { budgetLimit: safeLimit });
  };

  /**
   * Automatically sets 50-30-20 limits based on salary
   */
  const applySuggestedBudgets = async (salary: number) => {
    if (salary <= 0) return;
    const expenseCats = await db.categories.where('type').equals('expense').toArray();

    const needsTarget = Math.round(salary * 0.50);
    const wantsTarget = Math.round(salary * 0.30);
    const savingsTarget = Math.round(salary * 0.20);

    const needsCats = expenseCats.filter(c => getCategoryGroup(c) === 'needs');
    const wantsCats = expenseCats.filter(c => getCategoryGroup(c) === 'wants');
    const savingsCats = expenseCats.filter(c => getCategoryGroup(c) === 'savings');

    // Distribute proportionally across categories in each group
    const distribute = (cats: Category[], target: number) => {
      if (cats.length === 0) return [];
      const perCat = Math.round(target / cats.length / 500) * 500; // Round to clean 500 increments
      return cats.map(c => ({ id: c.id, limit: Math.max(500, perCat) }));
    };

    const updates = [
      ...distribute(needsCats, needsTarget),
      ...distribute(wantsCats, wantsTarget),
      ...distribute(savingsCats, savingsTarget)
    ];

    for (const u of updates) {
      await db.categories.update(u.id, { budgetLimit: u.limit });
    }
  };

  return {
    categories,
    budgetStatuses: data.budgetStatuses,
    unbudgetedCategories: data.unbudgetedCategories,
    groupSummary: data.groupSummary,
    updateCategoryBudget,
    applySuggestedBudgets
  };
}
