import { Currency, Language, SavingsGoal } from '../types';

// Exchange rate approximate conversion: 1 USD = 1350 RWF
const USD_TO_RWF_RATE = 1350;

export function convertAmount(amountInRWF: number, targetCurrency: Currency): number {
  if (targetCurrency === 'USD') {
    return Math.round((amountInRWF / USD_TO_RWF_RATE) * 100) / 100;
  }
  return amountInRWF;
}

export function formatCurrency(amountInRWF: number, currency: Currency, lang: Language): string {
  const converted = convertAmount(amountInRWF, currency);
  
  if (currency === 'USD') {
    return new Intl.NumberFormat(lang === 'rw' ? 'rw-RW' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(converted);
  }

  // RWF Formatting
  const formattedNumber = new Intl.NumberFormat(lang === 'rw' ? 'rw-RW' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(converted);

  return lang === 'rw' ? `${formattedNumber} Frw` : `${formattedNumber} RWF`;
}

export function calculateDaysLeft(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function calculateGoalMetrics(goal: SavingsGoal) {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const daysLeft = calculateDaysLeft(goal.targetDate);
  
  const dailyNeeded = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining;
  const monthsLeft = daysLeft > 0 ? Math.max(1, Math.ceil(daysLeft / 30)) : 1;
  const monthlyNeeded = Math.ceil(remaining / monthsLeft);

  return {
    remaining,
    progressPercent,
    daysLeft,
    dailyNeeded,
    monthlyNeeded,
    isCompleted: progressPercent >= 100,
  };
}

export function formatDate(dateString: string, lang: Language): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(lang === 'rw' ? 'rw-RW' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
