import React, { useState } from 'react';
import { SavingsGoal, SavingsGoalCategory, Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency, calculateGoalMetrics, formatDate } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { 
  Target, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Briefcase, 
  Home, 
  GraduationCap, 
  Sprout, 
  ShieldAlert, 
  Car, 
  Plane, 
  FolderHeart,
  PlusCircle,
  X,
  Coins
} from 'lucide-react';

interface GoalsSectionProps {
  goals: SavingsGoal[];
  language: Language;
  currency: Currency;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  onDeposit: (goalId: string, amount: number, note: string) => void;
  onWithdraw: (goalId: string, amount: number, note: string) => void;
  onDeleteGoal: (goalId: string) => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  selectedDepositGoalId: string | null;
  setSelectedDepositGoalId: (id: string | null) => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  language,
  currency,
  onAddGoal,
  onDeposit,
  onWithdraw,
  onDeleteGoal,
  showAddModal,
  setShowAddModal,
  selectedDepositGoalId,
  setSelectedDepositGoalId,
}) => {
  const t = getTranslation(language);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New Goal form state
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCategory, setNewCategory] = useState<SavingsGoalCategory>('business');
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Deposit/Withdraw modal state
  const [transType, setTransType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transAmount, setTransAmount] = useState('');
  const [transNote, setTransNote] = useState('');

  const getCategoryIcon = (cat: SavingsGoalCategory) => {
    switch (cat) {
      case 'business': return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'housing': return <Home className="w-5 h-5 text-amber-400" />;
      case 'education': return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case 'agriculture': return <Sprout className="w-5 h-5 text-emerald-400" />;
      case 'emergency': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'vehicle': return <Car className="w-5 h-5 text-cyan-400" />;
      case 'travel': return <Plane className="w-5 h-5 text-purple-400" />;
      default: return <FolderHeart className="w-5 h-5 text-teal-400" />;
    }
  };

  const getCategoryName = (cat: SavingsGoalCategory) => {
    switch (cat) {
      case 'business': return t.catBusiness;
      case 'housing': return t.catHousing;
      case 'education': return t.catEducation;
      case 'agriculture': return t.catAgriculture;
      case 'emergency': return t.catEmergency;
      case 'vehicle': return t.catVehicle;
      case 'travel': return t.catTravel;
      default: return t.catGeneral;
    }
  };

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget || Number(newTarget) <= 0 || !newDate) return;

    onAddGoal({
      title: newTitle.trim(),
      targetAmount: Number(newTarget),
      category: newCategory,
      targetDate: newDate,
      notes: newNotes,
    });

    setNewTitle('');
    setNewTarget('');
    setNewDate('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepositGoalId || !transAmount || Number(transAmount) <= 0) return;

    const amountNum = Number(transAmount);
    const targetGoal = goals.find(g => g.id === selectedDepositGoalId);

    if (transType === 'deposit') {
      onDeposit(selectedDepositGoalId, amountNum, transNote || (language === 'rw' ? 'Ikibuzwe vuba' : 'Quick deposit'));
      
      // Trigger celebratory confetti if deposit completes the goal!
      if (targetGoal && (targetGoal.currentAmount + amountNum >= targetGoal.targetAmount)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      onWithdraw(selectedDepositGoalId, amountNum, transNote || (language === 'rw' ? 'Ikibukujwe vuba' : 'Quick withdrawal'));
    }

    setTransAmount('');
    setTransNote('');
    setSelectedDepositGoalId(null);
  };

  const filteredGoals = goals.filter(g => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'completed') return g.currentAmount >= g.targetAmount;
    return g.category === categoryFilter;
  });

  const selectedGoalForModal = goals.find(g => g.id === selectedDepositGoalId);

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-700" />
            {t.navGoals} ({goals.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'rw' 
              ? 'Genzura intego z\'ubwizigame, bika cyangwa bikuza amafaranga buri gihe.' 
              : 'Manage your savings goals, record deposits, and reach milestones.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-lg shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addGoal}</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            categoryFilter === 'all'
              ? 'bg-blue-700 text-white font-bold shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {t.filterAll} ({goals.length})
        </button>
        <button
          onClick={() => setCategoryFilter('completed')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            categoryFilter === 'completed'
              ? 'bg-blue-700 text-white font-bold shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ✅ {t.completedGoal}
        </button>
        {(['business', 'housing', 'education', 'agriculture', 'emergency', 'vehicle', 'travel'] as SavingsGoalCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-blue-700 text-white font-bold shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {getCategoryName(cat)}
          </button>
        ))}
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map((goal) => {
          const metrics = calculateGoalMetrics(goal);
          const isDone = metrics.isCompleted;

          return (
            <div
              key={goal.id}
              className={`relative overflow-hidden rounded-2xl bg-white border ${
                isDone ? 'border-emerald-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              } p-5 sm:p-6 transition-all duration-300 shadow-sm flex flex-col justify-between`}
            >
              {isDone && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.completedGoal}
                </div>
              )}

              <div>
                {/* Category & Title */}
                <div className="flex items-start justify-between gap-3 pr-16">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {getCategoryName(goal.category)}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 line-clamp-1">
                        {goal.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">{t.currentProgress}</span>
                    <span className="text-blue-700 font-extrabold">{metrics.progressPercent}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isDone ? 'bg-emerald-600' : 'bg-blue-700'
                      }`}
                      style={{ width: `${metrics.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(goal.currentAmount, currency, language)}
                    </span>
                    <span className="text-slate-500">
                      / {formatCurrency(goal.targetAmount, currency, language)}
                    </span>
                  </div>
                </div>

                {/* Requirements / Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">{t.daysLeft}</span>
                      <span className="font-bold text-slate-900">{metrics.daysLeft} {language === 'rw' ? 'minsi' : 'days'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">{t.dailyNeeded}</span>
                      <span className="font-bold text-blue-700">
                        {formatCurrency(metrics.dailyNeeded, currency, language)}
                      </span>
                    </div>
                  </div>
                </div>

                {goal.notes && (
                  <p className="mt-3 text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTransType('deposit');
                      setSelectedDepositGoalId(goal.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.depositMoney}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTransType('withdraw');
                      setSelectedDepositGoalId(goal.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5 text-rose-600" />
                    <span>{t.withdrawMoney}</span>
                  </button>
                </div>

                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Saza Intego"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Create New Goal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-900">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{t.addGoal}</h3>
                <p className="text-xs text-slate-500">{language === 'rw' ? 'Shyiraho intego nshya mu buryo bworoshye' : 'Set up a target and deadline'}</p>
              </div>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.navGoals} (Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.goalTitlePlaceholder}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.targetAmount} (RWF)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="100000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SavingsGoalCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                  >
                    <option value="business">{t.catBusiness}</option>
                    <option value="housing">{t.catHousing}</option>
                    <option value="education">{t.catEducation}</option>
                    <option value="agriculture">{t.catAgriculture}</option>
                    <option value="emergency">{t.catEmergency}</option>
                    <option value="vehicle">{t.catVehicle}</option>
                    <option value="travel">{t.catTravel}</option>
                    <option value="general">{t.catGeneral}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.targetDate}
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Note / Detaye (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Aya mafaranga azaba ay'iki..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 shadow-sm"
                >
                  {t.saveButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit / Withdraw Modal */}
      {selectedDepositGoalId && selectedGoalForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 relative text-slate-900">
            <button
              onClick={() => setSelectedDepositGoalId(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${transType === 'deposit' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-600'}`}>
                {transType === 'deposit' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {transType === 'deposit' ? t.depositMoney : t.withdrawMoney}
                </h3>
                <p className="text-xs text-blue-700 font-bold">{selectedGoalForModal.title}</p>
              </div>
            </div>

            {/* Deposit Quick Amounts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[5000, 10000, 20000, 50000, 100000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTransAmount(amt.toString())}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 whitespace-nowrap"
                >
                  +{formatCurrency(amt, currency, language)}
                </button>
              ))}
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.amountPlaceholder} ({currency === 'USD' ? 'USD' : 'RWF'})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="20000"
                  value={transAmount}
                  onChange={(e) => setTransAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-lg font-black focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.notePlaceholder}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ubwizigame bw'iki cyumweru"
                  value={transNote}
                  onChange={(e) => setTransNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDepositGoalId(null)}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm ${
                    transType === 'deposit'
                      ? 'bg-blue-700 hover:bg-blue-800 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {transType === 'deposit' ? t.confirmDeposit : t.confirmWithdraw}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
