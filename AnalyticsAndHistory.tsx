import React, { useState } from 'react';
import { Transaction, SavingsGoal, Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { History, Download, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

interface AnalyticsAndHistoryProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  language: Language;
  currency: Currency;
  onExportData: () => void;
}

export const AnalyticsAndHistory: React.FC<AnalyticsAndHistoryProps> = ({
  transactions,
  goals,
  language,
  currency,
  onExportData,
}) => {
  const t = getTranslation(language);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');

  // Prepare chart data for savings progress
  const chartData = transactions.map((tx, idx) => {
    const accum = transactions.slice(0, idx + 1).reduce((sum, item) => {
      return item.type === 'withdraw' ? sum - item.amount : sum + item.amount;
    }, 0);
    return {
      date: formatDate(tx.date, language),
      amount: accum,
    };
  });

  // Prepare Pie Chart data per goal
  const pieColors = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1e40af', '#1e3a8a'];
  const pieData = goals.map((g) => ({
    name: g.title,
    value: g.currentAmount,
  })).filter(item => item.value > 0);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.goalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.note.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-700" />
            {t.historyTitle}
          </h2>
          <p className="text-slate-500 text-sm">
            {language === 'rw' 
              ? 'Ibibazwa byose, ibyakozwe, n\'ikura ry\'ubwizigame bwawe.' 
              : 'Complete transaction ledger, progress analytics, and export options.'}
          </p>
        </div>

        <button
          onClick={onExportData}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-blue-700" />
          <span>{t.exportData}</span>
        </button>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Savings Growth Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            {language === 'rw' ? 'Ikura ry\'Ubwizigame Mu Gihe (Savings Growth)' : 'Savings Balance Growth Over Time'}
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{ date: 'Today', amount: 0 }]}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [formatCurrency(Number(val), currency, language), 'Total Saved']}
                />
                <Area type="monotone" dataKey="amount" stroke="#1d4ed8" strokeWidth={3} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Category Breakdown Pie */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {language === 'rw' ? 'Igipimo ku Intego (Goal Distribution)' : 'Savings Allocation by Goal'}
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: 'No goals', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [formatCurrency(Number(val), currency, language), 'Saved']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {pieData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                  <span className="line-clamp-1 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(item.value, currency, language)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'rw' ? 'Shakisha ibyabitswe...' : 'Search transaction history...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-700 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setTypeFilter('deposit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'deposit' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterDeposit}
            </button>
            <button
              onClick={() => setTypeFilter('withdraw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'withdraw' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterWithdraw}
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <th className="py-3 px-3">Ubwoko / Type</th>
                <th className="py-3 px-3">Intego / Goal</th>
                <th className="py-3 px-3">Itariki / Date</th>
                <th className="py-3 px-3">Icyitonderwa / Note</th>
                <th className="py-3 px-3 text-right">Umubare / Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    {t.noTransactions}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                        tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {tx.type === 'deposit' ? t.filterDeposit : t.filterWithdraw}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{tx.goalTitle}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(tx.date, language)}</td>
                    <td className="py-3 px-3 text-slate-600 italic">{tx.note || '-'}</td>
                    <td className={`py-3 px-3 text-right font-bold ${
                      tx.type === 'deposit' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount, currency, language)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
