import { useMemo } from 'react';
import type { Transaction } from '../db/types';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  isLoggedToday: boolean;
  lastLoggedDate: string | null;
}

/**
 * Normalizes a date into local calendar 'YYYY-MM-DD'
 */
function toLocalDateString(dateInput: string | Date): string | null {
  if (typeof dateInput === 'string') {
    const ymdMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch && !dateInput.includes('T')) {
      return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates real consecutive day logging streaks from user transactions.
 */
export function useStreak(transactions: Transaction[]): StreakInfo {
  return useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        isLoggedToday: false,
        lastLoggedDate: null
      };
    }

    // Collect unique local calendar dates (YYYY-MM-DD)
    const uniqueDatesSet = new Set<string>();
    for (const tx of transactions) {
      if (tx.date) {
        const localDate = toLocalDateString(tx.date);
        if (localDate) {
          uniqueDatesSet.add(localDate);
        }
      }
    }

    if (uniqueDatesSet.size === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        isLoggedToday: false,
        lastLoggedDate: null
      };
    }

    // Sorted descending (newest first)
    const sortedDates = Array.from(uniqueDatesSet).sort((a, b) => b.localeCompare(a));
    const lastLoggedDate = sortedDates[0];

    const today = new Date();
    const todayStr = toLocalDateString(today)!;

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = toLocalDateString(yesterday)!;

    const isLoggedToday = uniqueDatesSet.has(todayStr);
    const isLoggedYesterday = uniqueDatesSet.has(yesterdayStr);

    // Calculate current active streak
    let currentStreak = 0;
    if (isLoggedToday || isLoggedYesterday) {
      // Walk backwards day by day from the reference day
      let checkDate = isLoggedToday ? new Date(today) : new Date(yesterday);

      while (true) {
        const checkStr = toLocalDateString(checkDate)!;
        if (uniqueDatesSet.has(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak in history
    let longestStreak = 0;
    // Iterate through all sorted unique dates and find max contiguous run
    if (sortedDates.length > 0) {
      let run = 1;
      longestStreak = 1;

      for (let i = 0; i < sortedDates.length - 1; i++) {
        const curr = new Date(sortedDates[i] + 'T12:00:00');
        const next = new Date(sortedDates[i + 1] + 'T12:00:00');
        const diffDays = Math.round((curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          run++;
          if (run > longestStreak) {
            longestStreak = run;
          }
        } else {
          run = 1;
        }
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      isLoggedToday,
      lastLoggedDate
    };
  }, [transactions]);
}
