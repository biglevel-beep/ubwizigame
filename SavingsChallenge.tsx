import React from 'react';
import { SavingsChallengeDay, Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { Flame, CheckCircle2, RotateCcw, Trophy, Sparkles, Coins } from 'lucide-react';

interface SavingsChallengeProps {
  challengeDays: SavingsChallengeDay[];
  onToggleDay: (dayNumber: number) => void;
  onResetChallenge: () => void;
  language: Language;
  currency: Currency;
}

export const SavingsChallenge: React.FC<SavingsChallengeProps> = ({
  challengeDays,
  onToggleDay,
  onResetChallenge,
  language,
  currency,
}) => {
  const t = getTranslation(language);

  const completedCount = challengeDays.filter(d => d.completed).length;
  const totalSavedChallenge = challengeDays
    .filter(d => d.completed)
    .reduce((sum, d) => sum + d.amount, 0);

  const grandTotalPossible = challengeDays.reduce((sum, d) => sum + d.amount, 0);
  const progressPercent = Math.round((completedCount / challengeDays.length) * 100);

  const handleDayClick = (dayNumber: number, wasCompleted: boolean) => {
    onToggleDay(dayNumber);
    if (!wasCompleted) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Challenge Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-blue-400 animate-bounce" />
              {t.challengeTitle}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {language === 'rw' ? 'Umukoro w\'Iminsi 30 y\'Ubwizigame' : '30-Day Savings Challenge'}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t.challengeSubtitle}
            </p>
          </div>

          {/* Quick Progress Banner */}
          <div className="bg-white/10 p-5 rounded-xl border border-white/10 text-center flex-1 md:max-w-xs shadow-sm">
            <div className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
              {t.totalChallengeSaved}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(totalSavedChallenge, currency, language)}
            </div>
            <div className="text-xs text-slate-300 mt-2">
              / {formatCurrency(grandTotalPossible, currency, language)} ({progressPercent}%)
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-blue-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Days */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-700" />
            <span className="font-extrabold text-slate-900 text-base">
              {t.completedDays}: {completedCount} / 30
            </span>
          </div>

          <button
            onClick={onResetChallenge}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetChallenge}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {challengeDays.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => handleDayClick(day.dayNumber, day.completed)}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-between gap-2 text-center group ${
                day.completed
                  ? 'bg-blue-50 border-blue-200 text-slate-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-blue-700">
                  {language === 'rw' ? 'Umunsi' : 'Day'} {day.dayNumber}
                </span>
                {day.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                ) : (
                  <Coins className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700" />
                )}
              </div>

              <div className="text-sm font-extrabold text-slate-900">
                {formatCurrency(day.amount, currency, language)}
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                day.completed ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {day.completed ? (language === 'rw' ? 'Ikozwe' : 'Done') : t.markComplete}
              </span>
            </button>
          ))}
        </div>

      </div>

    </div>
  );
};
