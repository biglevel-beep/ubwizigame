import React, { useState } from 'react';
import { Language, Currency, Member, SavingsGoal, SavingsChallengeDay } from '../types';
import { getTranslation } from '../data/translations';
import { NotificationCenter } from './NotificationCenter';
import { 
  LayoutDashboard, 
  Wallet, 
  Info,
  Calculator, 
  Bot, 
  MessageSquare,
  User,
  History, 
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  Globe,
  Coins,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  currentMember?: Member;
  onLogout?: () => void;
  goals: SavingsGoal[];
  challengeDays: SavingsChallengeDay[];
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  currency,
  setCurrency,
  isDarkMode,
  setIsDarkMode,
  currentMember,
  onLogout,
  goals,
  challengeDays,
}) => {
  const t = getTranslation(language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. The 4 MAIN Core tabs visible in the bottom bar
  const mainNavItems = [
    { id: 'overview', label: language === 'rw' ? 'Home Page' : 'Home Page', icon: LayoutDashboard },
    { id: 'info', label: language === 'rw' ? 'Profile' : 'Profile', icon: User },
    { id: 'chat', label: language === 'rw' ? 'Private Chat' : 'Private Chat', icon: MessageSquare },
    { id: 'wallet', label: language === 'rw' ? 'Wallet' : 'Wallet', icon: Wallet },
  ];

  // 2. Secondary pages accessible via the 3-lines menu bottom sheet
  const secondaryNavItems = [
    { 
      id: 'about', 
      label: language === 'rw' ? 'Ibyerekeye Umuryango' : 'About Us', 
      desc: language === 'rw' ? 'Amakuru n’amategeko y’isanduku' : 'Cooperative rules and overview',
      icon: Info 
    },
    { 
      id: 'budget', 
      label: language === 'rw' ? 'Igenamigambi' : 'Budget & Goals', 
      desc: language === 'rw' ? 'Gupanga no kubara imishinga' : 'Plan and track savings budgets',
      icon: Calculator 
    },
    { 
      id: 'ai-advisor', 
      label: language === 'rw' ? 'Inshuti Financial AI' : 'AI Advisor', 
      desc: language === 'rw' ? 'Inama z’imari n’ubujyanama' : 'Personal AI financial counseling',
      icon: Bot 
    },
    { 
      id: 'history', 
      label: language === 'rw' ? 'Ibyakozwe n’Isanduku' : 'History & Log', 
      desc: language === 'rw' ? 'Urusobe rw’ibyahembye n’ibyo wageragaje' : 'Complete financial transaction logs',
      icon: History 
    },
    { 
      id: 'privacy', 
      label: language === 'rw' ? 'Umutekano & Privacy' : 'Privacy & Security Policy', 
      desc: language === 'rw' ? 'Uburyo turinda amakuru yawe' : 'Data protection and member terms',
      icon: ShieldCheck 
    },
  ];

  if (currentMember?.role === 'admin') {
    secondaryNavItems.push({
      id: 'admin',
      label: language === 'rw' ? 'Admin Dashboard' : 'Admin Dashboard',
      desc: language === 'rw' ? 'Kuyobora abanyamuryango n’isanduku' : 'Manage coop members and deposits',
      icon: ShieldCheck
    });
  }

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* 1. SLIDING BOTTOM SHEET MENU DRAWER (Triggers on 3-lines click) */}
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 z-[95] bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Slide-Up Container */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-slate-900 dark:text-slate-100 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-out max-h-[85vh] flex flex-col ${
          isMenuOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Top Drag Pill & Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                {language === 'rw' ? 'Za Page Zose & Serivisi' : 'All Pages & Services'}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {language === 'rw' ? 'Hitamo page wifuza kureba' : 'Select any page to view details'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Funga Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Items List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-w-2xl mx-auto w-full">

          {/* LOCAL NOTIFICATIONS SYSTEM */}
          <NotificationCenter
            goals={goals}
            challengeDays={challengeDays}
            language={language}
            currency={currency}
          />

          {/* Settings & Account Section: Language, Currency, Logout */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xs">
            <div className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
              {language === 'rw' ? 'Igenamiterere n\'Konti (Settings & Logout)' : 'Settings & Account'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Language Switcher */}
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Globe className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>{language === 'rw' ? 'Ururimi' : 'Language'}</span>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-extrabold">
                  <button
                    onClick={() => setLanguage('rw')}
                    className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      language === 'rw' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    🇷🇼 <span>KINY</span>
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      language === 'en' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    🇬🇧 <span>ENG</span>
                  </button>
                </div>
              </div>

              {/* Currency Switcher */}
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'rw' ? 'Amafaranga' : 'Currency'}</span>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-extrabold">
                  <button
                    onClick={() => setCurrency('RWF')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      currency === 'RWF' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Frw
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      currency === 'USD' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              {/* Dark Mode Switcher */}
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between sm:col-span-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>{language === 'rw' ? 'Ubwoko bw’Imbonankore (Dark Mode)' : 'Dark Mode'}</span>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-extrabold">
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      !isDarkMode ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> <span>{language === 'rw' ? 'Rumuri' : 'Light'}</span>
                  </button>
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      isDarkMode ? 'bg-indigo-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> <span>{language === 'rw' ? 'Umwijima' : 'Dark'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Logout Row */}
            {currentMember && onLogout && (
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentMember.avatarUrl ? (
                    <img src={currentMember.avatarUrl} alt={currentMember.name} className="w-9 h-9 rounded-xl object-cover border border-slate-300 dark:border-slate-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-xs">
                      {currentMember.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{currentMember.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{currentMember.accountNumber}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-black text-xs border border-rose-200/90 dark:border-rose-900 transition-all shrink-0 shadow-xs active:scale-95 cursor-pointer"
                  title="Sohoka muri system"
                >
                  <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>{language === 'rw' ? 'Sohoka (Logout)' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            {language === 'rw' ? 'Ibice Bisigaye Muri System' : 'More App Sections'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left group cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 border-blue-700 text-white shadow-lg shadow-blue-700/20'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-50/70 dark:hover:bg-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold transition-all ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white dark:bg-slate-950 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-800 group-hover:bg-blue-700 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                        {item.label}
                      </div>
                      <div className={`text-[10px] truncate font-medium ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? 'text-amber-300' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Core Menu Shortcut Quick Return */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 mb-2">
              {language === 'rw' ? 'Ibyibanze (Main Tabs)' : 'Core Navigation'}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-extrabold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FIXED BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] transition-all">
        <div className="max-w-4xl mx-auto px-2 sm:px-6">
          <nav className="flex items-center justify-around py-2">
            {/* The 4 Core Main Tabs */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab(item.id);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 px-3 sm:px-6 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 text-white font-black shadow-md shadow-blue-700/25 scale-105'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 font-bold'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-300' : 'text-slate-600 dark:text-slate-400'}`} />
                  <span className="text-[10px] sm:text-xs whitespace-nowrap leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* The 5th Tab: 3-LINES MENU BUTTON [≡] */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex flex-col items-center justify-center gap-1 px-3 sm:px-6 py-1.5 rounded-xl transition-all duration-200 relative cursor-pointer ${
                isMenuOpen || isSecondaryActive
                  ? 'bg-slate-900 dark:bg-slate-800 text-white font-black shadow-md shadow-slate-900/30 scale-105 ring-2 ring-blue-500'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 font-bold'
              }`}
            >
              <Menu className={`w-5 h-5 ${isMenuOpen || isSecondaryActive ? 'text-amber-300' : 'text-slate-700 dark:text-slate-300'}`} />
              <span className="text-[10px] sm:text-xs whitespace-nowrap leading-tight flex items-center gap-0.5">
                <span>{language === 'rw' ? 'Menu' : 'Menu'}</span>
                <span className="text-[9px] font-mono opacity-80">[3]</span>
              </span>

              {/* Active Dot Indicator if user is on a secondary page */}
              {isSecondaryActive && !isMenuOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};
