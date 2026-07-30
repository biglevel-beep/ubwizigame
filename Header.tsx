import React from 'react';
import { Currency, Language, Member } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency } from '../utils/formatters';
import { 
  PiggyBank, 
  LayoutDashboard, 
  Target, 
  Flame, 
  Calculator, 
  Bot, 
  History,
  Globe,
  Coins,
  Wallet,
  ShieldCheck,
  LogOut,
  User
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalSavedRWF: number;
  currentMember?: Member;
  onLogout?: () => void;
  onViewProfile?: (memberId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  currency,
  setCurrency,
  activeTab,
  setActiveTab,
  totalSavedRWF,
  currentMember,
  onLogout,
  onViewProfile,
}) => {
  const t = getTranslation(language);

  const navItems = [
    { id: 'overview', label: t.navOverview, icon: LayoutDashboard },
    { id: 'wallet', label: t.navWallet || 'Wallet', icon: Wallet },
    { id: 'goals', label: t.navGoals, icon: Target },
    { id: 'challenge', label: t.navChallenge, icon: Flame },
    { id: 'budget', label: t.navBudget, icon: Calculator },
    { id: 'ai-advisor', label: t.navAiAdvisor, icon: Bot },
    { id: 'history', label: t.navHistory, icon: History },
    { id: 'admin', label: t.navAdmin || 'Admin Dashboard', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-800 via-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-700/25 text-white font-black text-xl tracking-tighter border border-blue-500/30">
              TT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  TUZAMURANE <span className="text-blue-700 dark:text-blue-400">TETERO</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-full">
                  TT FINANCE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-bold">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Center Summary Pill */}
          <div className="hidden lg:flex items-center gap-3 bg-blue-50/80 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-blue-100/80 dark:border-slate-800 shadow-sm">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                {t.totalSaved}
              </div>
              <div className="text-lg font-black text-blue-700 dark:text-blue-400">
                {formatCurrency(totalSavedRWF, currency, language)}
              </div>
            </div>
          </div>

          {/* Right Controls: Clean User Profile Badge */}
          <div className="flex items-center gap-2">
            {currentMember && (
              <button
                onClick={() => onViewProfile ? onViewProfile(currentMember.id) : setActiveTab('info')}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-700 transition-all px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 group cursor-pointer text-left"
                title={language === 'rw' ? 'Reba profile yawe' : 'View your profile'}
              >
                {currentMember.avatarUrl ? (
                  <img
                    src={currentMember.avatarUrl}
                    alt={currentMember.name}
                    className="w-7 h-7 rounded-lg object-cover shadow-xs border border-slate-300 dark:border-slate-700 group-hover:border-blue-500"
                  />
                ) : (
                  <div className={`w-7 h-7 rounded-lg text-white font-extrabold flex items-center justify-center text-xs shadow-xs ${
                    currentMember.role === 'admin' ? 'bg-amber-600' : 'bg-blue-700'
                  }`}>
                    {currentMember.name.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 leading-tight truncate max-w-[120px]">
                    {currentMember.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
                    {currentMember.accountNumber}
                  </div>
                </div>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

