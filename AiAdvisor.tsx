import React, { useState } from 'react';
import { SavingsGoal, Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency } from '../utils/formatters';
import { Bot, Sparkles, Send, Loader2, Lightbulb, Copy, Check, Briefcase, TrendingUp, HelpCircle, RefreshCw } from 'lucide-react';

interface AiAdvisorProps {
  goals: SavingsGoal[];
  language: Language;
  currency: Currency;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => void;
}

interface ChatHistoryItem {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  goals,
  language,
  currency,
}) => {
  const t = getTranslation(language);

  const [question, setQuestion] = useState('');
  const [income, setIncome] = useState(250000);
  const [expenses, setExpenses] = useState(150000);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Curated prompts for low budget business ideas and financial advice
  const presets = language === 'rw' ? [
    '💡 Ni muhe mishinga y\'ubucuruzi nakoza igishoro cya 10,000 Frw - 50,000 Frw?',
    '📈 Ni gute nagura inyungu n\'ubwizigame bw\'umuryango wanjye?',
    '💰 Mbaza uburyo bwo kuzigama amafaranga ashira mu tuntu duto (micro-savings).',
    '🚀 Inama zo gutangiza negocio y\'imbuto cyangwa Mobile Money mu quartier.'
  ] : [
    '💡 What small business can I start with $10 - $50 (10k - 50k RWF)?',
    '📈 How can I grow my monthly savings & investment returns?',
    '💰 Give me tips on micro-savings and curbing impulse spending.',
    '🚀 Step-by-step launch plan for a local retail or airtime business.'
  ];

  const handleFetchAdvice = async (customQuestion?: string) => {
    const qToUse = customQuestion || question;
    if (!qToUse.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add User Message to History
    setChatHistory(prev => [...prev, { sender: 'user', text: qToUse, time: userTime }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          currency,
          income,
          monthlyExpenses: expenses,
          savingsGoals: goals.map(g => ({
            title: g.title,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            targetDate: g.targetDate,
            category: g.category,
          })),
          userQuestion: qToUse,
          chatHistory: chatHistory.map(c => ({ role: c.sender === 'user' ? 'user' : 'model', content: c.text }))
        }),
      });

      const data = await response.json();
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (data.advice) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.advice, time: aiTime }]);
      } else {
        const errorText = data.error || (language === 'rw' ? 'Nta nama zabonetse. Gerageza mukanya.' : 'Failed to retrieve advice.');
        setChatHistory(prev => [...prev, { sender: 'ai', text: errorText, time: aiTime }]);
      }
    } catch (err) {
      console.error('Error contacting AI Advisor:', err);
      const errText = language === 'rw' ? 'Habaye ikosa mu gushaka inama z\'AI. Gerageza tena.' : 'Failed to connect to AI Savings Coach.';
      setChatHistory(prev => [...prev, { sender: 'ai', text: errText, time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch (e) {
      // Ignore clipboard error in sandbox iframe
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* AI Coach Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider">
              <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>{language === 'rw' ? 'Inshuti y\'Imari & Ubucuruzi (AI Financial Coach)' : 'AI Small Business & Finance Mentor'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'rw' ? 'Ubujyanama mu By\'Imari n\'Imishinga Mitu' : 'Financial Counseling & Business Ideas'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {language === 'rw' 
                ? 'Baza ikintu cyose cyerekeye imishinga yakorwa n’amafaranga make (5,000 Frw - 100,000 Frw), uko wakwigerera inyungu, n’ingamba z’ubwizigame mu Rwanda.'
                : 'Ask anything about starting low-budget micro-businesses, optimizing savings, or financial decision making.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 space-y-1.5 w-full md:w-auto shrink-0 shadow-inner">
            <span className="font-extrabold text-blue-400 block uppercase tracking-wider text-[10px]">
              {language === 'rw' ? 'Amakuru y\'Ubwizigame Bwawe' : 'Your Financial Context'}
            </span>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{t.incomeLabel}:</span>
              <strong className="text-white font-mono">{formatCurrency(income, currency, language)}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{t.expensesLabel}:</span>
              <strong className="text-white font-mono">{formatCurrency(expenses, currency, language)}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{t.activeGoals}:</span>
              <strong className="text-amber-400 font-black">{goals.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Suggestions Grid */}
      <div className="space-y-2.5">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>{language === 'rw' ? 'Ibibazo n\'Inama Bikunze Kubazwa (Tap to ask)' : 'Suggested Business & Savings Queries'}</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(preset);
                handleFetchAdvice(preset);
              }}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left text-xs font-extrabold text-slate-800 hover:text-blue-700 transition-all duration-200 flex items-center justify-between group shadow-xs"
            >
              <span className="line-clamp-2 pr-2 leading-snug">{preset}</span>
              <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Financial Context & Question Form */}
      <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              {t.incomeLabel} ({currency})
            </label>
            <input
              type="number"
              step="5000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              {t.expensesLabel} ({currency})
            </label>
            <input
              type="number"
              step="5000"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
            />
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={language === 'rw' ? 'Baza ikibazo cy\'ubucuruzi cyangwa imari...' : 'Ask about micro-businesses, investments...'}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchAdvice()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleFetchAdvice()}
            disabled={loading || !question.trim()}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-700/20 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">{language === 'rw' ? 'Baza AI' : 'Ask AI'}</span>
          </button>
        </div>
      </div>

      {/* Chat Conversation History Stream */}
      {chatHistory.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-700" />
              <span>{language === 'rw' ? 'Ibiganiro n\'Inama z\'AI' : 'AI Financial Advice Log'}</span>
            </span>

            <button
              onClick={() => setChatHistory([])}
              className="text-[10px] font-extrabold text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{language === 'rw' ? 'Siba Ibiganiro' : 'Clear Chat'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {chatHistory.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-3xl rounded-3xl p-5 sm:p-6 shadow-sm border transition-all ${
                      isUser
                        ? 'bg-blue-700 text-white border-blue-700 rounded-tr-none'
                        : 'bg-white text-slate-900 border-slate-200/90 rounded-tl-none'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100/20 gap-4">
                      <div className="flex items-center gap-2 font-black text-xs">
                        {isUser ? (
                          <span>{language === 'rw' ? 'Ikibazo Cyawe' : 'Your Query'}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-700">
                            <Bot className="w-4 h-4" />
                            <span>Inshuti y'Imari (AI Coach)</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-70">{msg.time}</span>
                        {!isUser && (
                          <button
                            onClick={() => handleCopy(msg.text, index)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all text-[10px] font-extrabold flex items-center gap-1"
                            title="Copy response"
                          >
                            {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Text Body */}
                    <div className={`prose max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-blue-50 font-medium' : 'text-slate-800'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center space-y-3 shadow-sm animate-pulse">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
          <p className="text-xs font-black text-slate-700">
            {language === 'rw' ? 'Inshuti y\'AI irimo gutegura inama z\'ubucuruzi n\'ubwizigame...' : 'AI Advisor is generating tailored financial guidance...'}
          </p>
        </div>
      )}

    </div>
  );
};
