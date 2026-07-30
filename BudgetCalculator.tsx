import React, { useState } from 'react';
import { Language, Currency, SavingsGoal } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency } from '../utils/formatters';
import { Calculator, ShieldAlert, TrendingUp, PieChart, Plus, Check } from 'lucide-react';

interface BudgetCalculatorProps {
  language: Language;
  currency: Currency;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  setActiveTab: (tab: string) => void;
}

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  language,
  currency,
  onAddGoal,
  setActiveTab,
}) => {
  const t = getTranslation(language);

  // Budget state
  const [income, setIncome] = useState<number>(300000);
  const [expenses, setExpenses] = useState<number>(180000);

  // Emergency Fund State
  const [essentialExpenses, setEssentialExpenses] = useState<number>(150000);
  const [emergencyMonths, setEmergencyMonths] = useState<number>(3);
  const [emergencyCreated, setEmergencyCreated] = useState<boolean>(false);

  // Compound Interest State
  const [monthlyContribution, setMonthlyContribution] = useState<number>(30000);
  const [years, setYears] = useState<number>(3);
  const [annualRate, setAnnualRate] = useState<number>(8); // 8% average SACCO interest

  // 50/30/20 Calculations
  const needs50 = income * 0.5;
  const wants30 = income * 0.3;
  const savings20 = income * 0.2;
  const netSurplus = income - expenses;

  // Emergency Calculation
  const recommendedEmergencyTarget = essentialExpenses * emergencyMonths;

  // Compound Interest Calculation
  const totalMonths = years * 12;
  const monthlyRate = annualRate / 100 / 12;
  
  let compoundBalance = 0;
  for (let i = 0; i < totalMonths; i++) {
    compoundBalance = (compoundBalance + monthlyContribution) * (1 + monthlyRate);
  }
  const totalPrincipal = monthlyContribution * totalMonths;
  const totalInterestEarned = Math.max(0, compoundBalance - totalPrincipal);

  const handleCreateEmergencyGoal = () => {
    onAddGoal({
      title: language === 'rw' ? `Ikegera cy'Ubutabazi (Amezi ${emergencyMonths})` : `Emergency Safety Net (${emergencyMonths} months)`,
      targetAmount: recommendedEmergencyTarget,
      category: 'emergency',
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: language === 'rw' ? `Amezi ${emergencyMonths} y'ibyibanze ku kwezi` : `${emergencyMonths} months of essentials`,
    });
    setEmergencyCreated(true);
    setTimeout(() => setEmergencyCreated(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Tool Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-700" />
          {t.navBudget}
        </h2>
        <p className="text-slate-500 text-sm">
          {language === 'rw' 
            ? 'Bipime neza: Amategeko 50/30/20, ikegera cy\'ubutabazi, n\'inyungu ku bwizigame bwawe.' 
            : 'Plan your monthly budget, safety reserve, and long-term interest projections.'}
        </p>
      </div>

      {/* 50/30/20 Budgeting Rule Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Form */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-wider">
            <PieChart className="w-5 h-5" />
            {t.budgetTitle}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.incomeLabel} (RWF)
              </label>
              <input
                type="number"
                step="1000"
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-lg font-bold focus:outline-none focus:border-blue-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.expensesLabel} (RWF)
              </label>
              <input
                type="number"
                step="1000"
                value={expenses}
                onChange={(e) => setExpenses(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-lg font-bold focus:outline-none focus:border-blue-700 focus:bg-white"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">{t.disposableIncome}</span>
            <span className={`text-xl font-black ${netSurplus >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
              {formatCurrency(netSurplus, currency, language)}
            </span>
          </div>
        </div>

        {/* 50/30/20 Breakdown Visual */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {language === 'rw' ? 'Igipimo Gikwiriye y\'Inyungu (Recommended Split)' : 'Recommended 50/30/20 Budget Split'}
          </h3>

          <div className="space-y-3">
            {/* 50% Needs */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase block">{t.rule50}</span>
                <span className="text-xs text-slate-500">{language === 'rw' ? 'Inzu, ibiryo, transport' : 'Rent, groceries, utilities'}</span>
              </div>
              <span className="text-base font-black text-slate-900">
                {formatCurrency(needs50, currency, language)}
              </span>
            </div>

            {/* 30% Wants */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase block">{t.rule30}</span>
                <span className="text-xs text-slate-500">{language === 'rw' ? 'Imyidagaduro, imyenda' : 'Dining out, recreation'}</span>
              </div>
              <span className="text-base font-black text-slate-900">
                {formatCurrency(wants30, currency, language)}
              </span>
            </div>

            {/* 20% Savings */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase block">{t.rule20}</span>
                <span className="text-xs text-slate-500">{language === 'rw' ? 'Ubwizigame n\'ikegera' : 'Emergency & goals'}</span>
              </div>
              <span className="text-lg font-black text-emerald-700">
                {formatCurrency(savings20, currency, language)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            💡 {language === 'rw' 
              ? 'Inama: Bika byura nibura 20% by\'umuhembo wawe mu bwizigame mbere yo gukoresha ibindi.' 
              : 'Pro Tip: Pay yourself first by transferring 20% into savings before discretionary spending.'}
          </p>
        </div>

      </div>

      {/* Emergency Fund Planner */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl text-white space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
              <ShieldAlert className="w-5 h-5" />
              {t.emergencyTitle}
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {t.emergencySubtitle}
            </p>
          </div>

          <button
            onClick={handleCreateEmergencyGoal}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              emergencyCreated
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm'
            }`}
          >
            {emergencyCreated ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{emergencyCreated ? (language === 'rw' ? 'Yashyizwe mu intego!' : 'Goal Created!') : t.createEmergencyGoal}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-2">
            <label className="block text-xs text-slate-300 font-bold uppercase">{t.monthlyEssentials}</label>
            <input
              type="number"
              step="1000"
              value={essentialExpenses}
              onChange={(e) => setEssentialExpenses(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm"
            />
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-2">
            <label className="block text-xs text-slate-300 font-bold uppercase">{t.targetMonths} ({emergencyMonths} {language === 'rw' ? 'Amezi' : 'Months'})</label>
            <input
              type="range"
              min="1"
              max="12"
              value={emergencyMonths}
              onChange={(e) => setEmergencyMonths(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex flex-col justify-center">
            <span className="text-xs text-blue-300 font-bold uppercase">{t.recommendedEmergency}</span>
            <span className="text-2xl font-black text-white mt-1">
              {formatCurrency(recommendedEmergencyTarget, currency, language)}
            </span>
          </div>
        </div>
      </div>

      {/* Compound Interest Savings Projection */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-wider">
          <TrendingUp className="w-5 h-5" />
          {t.compoundTitle}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {language === 'rw' ? 'Ubwizigame w\'Ukwezi' : 'Monthly Savings Deposit'}
              </label>
              <input
                type="number"
                step="5000"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.yearsToSave}: ({years} {language === 'rw' ? 'Imyaka' : 'Years'})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.interestRate}: ({annualRate}% / yr)
              </label>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase">{t.projectedTotal} ({years} yrs)</span>
              <div className="text-3xl sm:text-4xl font-black text-blue-700">
                {formatCurrency(compoundBalance, currency, language)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-xs">
              <div>
                <span className="text-slate-500 block">{language === 'rw' ? 'Ayo wamaze kubika (Principal)' : 'Total Principal'}</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(totalPrincipal, currency, language)}</span>
              </div>
              <div>
                <span className="text-emerald-700 block">{language === 'rw' ? 'Inyungu yakuremye (Interest)' : 'Total Interest Earned'}</span>
                <span className="font-extrabold text-emerald-700 text-sm">+{formatCurrency(totalInterestEarned, currency, language)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
