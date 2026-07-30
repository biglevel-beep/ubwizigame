import React, { useState, useEffect } from 'react';
import { SavingsGoal, SavingsChallengeDay, Language, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Clock, 
  Zap, 
  ShieldAlert,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface NotificationCenterProps {
  goals: SavingsGoal[];
  challengeDays: SavingsChallengeDay[];
  language: Language;
  currency: Currency;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  goals,
  challengeDays,
  language,
  currency,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enableDailyChallenge, setEnableDailyChallenge] = useState<boolean>(() => {
    const saved = localStorage.getItem('tt_notif_challenge');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [enableUpcomingDeadlines, setEnableUpcomingDeadlines] = useState<boolean>(() => {
    const saved = localStorage.getItem('tt_notif_deadlines');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  // Safely check if Notifications are supported by the browser without throwing SecurityError in strict iframes
  const isNotificationSupported = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      return 'Notification' in window && typeof window.Notification !== 'undefined';
    } catch (e) {
      return false;
    }
  };

  // Safely read the Notification permission without crashing in sandboxed iframes
  const getSafePermission = (): NotificationPermission => {
    try {
      if (isNotificationSupported()) {
        return window.Notification.permission;
      }
    } catch (e) {
      console.warn("Notification permission access blocked by security sandbox:", e);
    }
    return 'denied';
  };

  // Check current browser notification permission on mount
  useEffect(() => {
    setPermission(getSafePermission());
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('tt_notif_challenge', JSON.stringify(enableDailyChallenge));
  }, [enableDailyChallenge]);

  useEffect(() => {
    localStorage.setItem('tt_notif_deadlines', JSON.stringify(enableUpcomingDeadlines));
  }, [enableUpcomingDeadlines]);

  // Request browser notification permission
  const requestPermission = async () => {
    if (!isNotificationSupported()) {
      alert(language === 'rw' ? "Iyi browser ntabwo ishyigikiye ubutumwa (Notifications)" : "This browser does not support notifications.");
      return;
    }

    try {
      const res = await window.Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        showLocalNotification(
          language === 'rw' ? 'Ubutumwa bwatangijwe!' : 'Notifications Enabled!',
          language === 'rw' 
            ? 'Ubu uzajya ubona ubutumwa bukwibutsa kubika kuri Tuzamurane Tetero.' 
            : 'You will now receive friendly reminders for your financial goals.'
        );
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      alert(language === 'rw'
        ? "Ntabwo byashobotse gufungura ubutumwa muri iri dirishya (Iframe)."
        : "Failed to request notification permission in this sandbox.");
    }
  };

  // Helper to trigger browser notification
  const showLocalNotification = (title: string, body: string, tag?: string) => {
    if (isNotificationSupported()) {
      try {
        if (getSafePermission() === 'granted') {
          const options: NotificationOptions = {
            body,
            icon: '/favicon.ico',
            tag: tag || 'tt-finance',
            requireInteraction: false
          };
          new window.Notification(title, options);
        }
      } catch (e) {
        console.warn('Native notification failed, showing custom console fallback:', e);
      }
    }
  };

  // Find dynamic alerts to show in-app
  const getChallengeAlert = () => {
    const firstPendingDay = challengeDays.find(d => !d.completed);
    if (firstPendingDay) {
      return {
        dayNumber: firstPendingDay.dayNumber,
        amount: firstPendingDay.amount,
        isAlert: true
      };
    }
    return null;
  };

  const getUpcomingDeadlinesAlerts = () => {
    const today = new Date();
    const alerts: Array<{ goal: SavingsGoal; daysLeft: number; progressPercent: number }> = [];

    goals.forEach(g => {
      if (g.isCompleted || g.currentAmount >= g.targetAmount) return;

      try {
        const target = new Date(g.targetDate);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 7) {
          const percent = Math.round((g.currentAmount / g.targetAmount) * 100);
          alerts.push({
            goal: g,
            daysLeft: diffDays,
            progressPercent: percent
          });
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    return alerts;
  };

  const challengeAlert = getChallengeAlert();
  const deadlineAlerts = getUpcomingDeadlinesAlerts();

  // Simulation Triggers
  const simulateChallengeNotif = () => {
    if (permission !== 'granted') {
      alert(language === 'rw' 
        ? "Banza uhe uburenganzira bwa browser (Kanda buto ya 'He Uburenganzira')" 
        : "Please enable browser permissions first (Click the 'Request Permission' button)");
      return;
    }
    showLocalNotification(
      language === 'rw' ? '🏆 Tuzamurane Tetero: Daily Savings Reminder!' : '🏆 Tuzamurane Tetero: Daily Savings Reminder!',
      language === 'rw'
        ? "Waba wazigamye ku mukoro wawe w'uyu munsi? Komeza streak yawe uyumunsi uze neza ejo hazaza!"
        : "Keep your savings streak alive! Have you saved for today's challenge yet?",
      'test-challenge'
    );
    triggerSuccessFeedback("Daily challenge notification simulated!");
  };

  const simulateDeadlineNotif = () => {
    if (permission !== 'granted') {
      alert(language === 'rw' 
        ? "Banza uhe uburenganzira bwa browser (Kanda buto ya 'He Uburenganzira')" 
        : "Please enable browser permissions first (Click the 'Request Permission' button)");
      return;
    }
    const sampleGoalTitle = goals[0]?.title || (language === 'rw' ? "Intego y'Ubucuruzi" : "Business Fund");
    showLocalNotification(
      language === 'rw' ? '⚠️ Tuzamurane Tetero: Deadline Alert!' : '⚠️ Tuzamurane Tetero: Deadline Alert!',
      language === 'rw'
        ? `Intego yawe "${sampleGoalTitle}" isigaje iminsi 3 gusa ngo igere ku itariki yayo!`
        : `Your project "${sampleGoalTitle}" is approaching its target deadline in 3 days!`,
      'test-deadline'
    );
    triggerSuccessFeedback("Deadline alert notification simulated!");
  };

  const simulateSuccessNotif = () => {
    if (permission !== 'granted') {
      alert(language === 'rw' 
        ? "Banza uhe uburenganzira bwa browser (Kanda buto ya 'He Uburenganzira')" 
        : "Please enable browser permissions first (Click the 'Request Permission' button)");
      return;
    }
    showLocalNotification(
      language === 'rw' ? '🎉 Tuzamurane Tetero: Intego Yagezweho!' : '🎉 Tuzamurane Tetero: Goal Achieved!',
      language === 'rw'
        ? "Intego yawe y'ubwizigame yayuzuye 100%! Ishema ni ryawe ku gukora neza!"
        : "Congratulations! You have successfully completed your savings project. Fantastic effort!",
      'test-success'
    );
    triggerSuccessFeedback("Goal success notification simulated!");
  };

  const triggerSuccessFeedback = (msg: string) => {
    setTestSuccess(msg);
    setTimeout(() => setTestSuccess(null), 3000);
  };

  const activeAlertsCount = 
    (challengeAlert && enableDailyChallenge ? 1 : 0) + 
    (enableUpcomingDeadlines ? deadlineAlerts.length : 0);

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="w-full text-left bg-gradient-to-r from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 active:scale-[0.99] transition-all border border-blue-100/80 rounded-2xl p-4 flex items-center justify-between shadow-xs cursor-pointer group"
        title={language === 'rw' ? "Kanda hano urebe inyibutsa zose" : "Click to view notifications"}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            activeAlertsCount > 0 
              ? 'bg-amber-100/80 text-amber-700 border-amber-200 animate-pulse' 
              : 'bg-blue-100/80 text-blue-700 border-blue-200'
          }`}>
            <Bell className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>{language === 'rw' ? "Inyibutsa z'Ububiki" : "Savings Reminders"}</span>
              {activeAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {activeAlertsCount > 0 
                ? (language === 'rw' ? `Ufite inyibutsa ${activeAlertsCount} zihutirwa!` : `You have ${activeAlertsCount} urgent reminders!`)
                : (language === 'rw' ? "Nta nyibutsa zihutirwa ufite ubu" : "No urgent action items pending")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeAlertsCount > 0 ? (
            <span className="px-2.5 py-1 text-xs font-black bg-rose-500 text-white rounded-lg shadow-sm">
              {activeAlertsCount}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
              {language === 'rw' ? 'Byose OK' : 'All Clear'}
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shadow-xs">
            <Bell className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {language === 'rw' ? "Inyibutsa n'Igenamiterere" : "Reminders & Alerts"}
              </h2>
              {activeAlertsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-md">
                  {activeAlertsCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'rw' 
                ? "Genzura inyibutsa z'igihe cy'intego n'umukoro wawe." 
                : "Manage browser alerts for your savings goals and daily challenges."}
            </p>
          </div>
        </div>

        {/* Browser Permission Badge & Trigger & Collapse Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {permission === 'granted' ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'rw' ? 'Fawe' : 'Alerts Active'}</span>
            </div>
          ) : permission === 'denied' ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold">
              <BellOff className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'rw' ? 'Zifunze' : 'Blocked'}</span>
            </div>
          ) : (
            <button
              onClick={requestPermission}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-black transition-all cursor-pointer shadow-xs"
            >
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
              <span>{language === 'rw' ? 'Fungura' : 'Enable'}</span>
            </button>
          )}

          {/* Close/Collapse Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold transition-all cursor-pointer border border-slate-200 shadow-3xs"
            title={language === 'rw' ? "Egeranya" : "Collapse view"}
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>{language === 'rw' ? 'Funga' : 'Collapse'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 columns on medium/large screens (Settings Toggles & Active Warnings) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Settings Panel Card */}
        <div className="bg-slate-50/75 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'rw' ? "Igenamiterere" : "Settings"}</span>
          </div>

          <div className="space-y-3">
            {/* Toggle 1: Daily Savings Challenge */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={enableDailyChallenge}
                onChange={(e) => setEnableDailyChallenge(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 text-blue-700 bg-slate-100 border-slate-300 rounded focus:ring-blue-600 focus:ring-2 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                  {language === 'rw' ? "Umukoro w'Iminsi 30" : "Daily Challenge"}
                </span>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">
                  {language === 'rw' 
                    ? "Inyibutsa iyo utarakora umukoro w'ubwizigame." 
                    : "Alert when today's 30-day challenge deposit is pending."}
                </p>
              </div>
            </label>

            {/* Toggle 2: Project Deadlines */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={enableUpcomingDeadlines}
                onChange={(e) => setEnableUpcomingDeadlines(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 text-blue-700 bg-slate-100 border-slate-300 rounded focus:ring-blue-600 focus:ring-2 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                  {language === 'rw' ? "Itariki y'Intego" : "Upcoming Deadlines"}
                </span>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">
                  {language === 'rw' 
                    ? "Inyibutsa ku mishinga y'ubwizigame iri hafi (munsi y'iminsi 7)." 
                    : "Alert when projects are within 7 days of deadline."}
                </p>
              </div>
            </label>
          </div>

          {/* SIMULATE AREA */}
          <div className="pt-2.5 border-t border-slate-200">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {language === 'rw' ? "Ipime mu browser (Test)" : "Tester & Simulation"}
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={simulateChallengeNotif}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-extrabold transition-all active:scale-98 shadow-3xs cursor-pointer"
              >
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Challenge</span>
              </button>

              <button
                type="button"
                onClick={simulateDeadlineNotif}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-extrabold transition-all active:scale-98 shadow-3xs cursor-pointer"
              >
                <Clock className="w-3 h-3 text-blue-600" />
                <span>Deadline</span>
              </button>

              <button
                type="button"
                onClick={simulateSuccessNotif}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-extrabold transition-all active:scale-98 shadow-3xs cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Success</span>
              </button>
            </div>

            {testSuccess && (
              <div className="mt-1.5 text-center text-[9px] font-extrabold text-emerald-600 animate-pulse bg-emerald-50 py-0.5 rounded border border-emerald-100">
                {testSuccess}
              </div>
            )}
          </div>
        </div>

        {/* Live Active Reminders & Notices Column */}
        <div className="bg-slate-50/75 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'rw' ? "Inyibutsa z'Ubu" : "Active Alerts"}</span>
            </div>

            {/* List of Alerts */}
            <div className="space-y-2 overflow-y-auto max-h-40 pr-1">
              
              {/* Daily Challenge Pending Warning */}
              {challengeAlert && enableDailyChallenge && (
                <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2 shadow-3xs">
                  <Flame className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-black text-amber-950">
                      {language === 'rw' 
                        ? `Challenge y'umunsi wa ${challengeAlert.dayNumber}` 
                        : `Challenge (Day ${challengeAlert.dayNumber}) Pending`}
                    </div>
                    <p className="text-[10px] font-medium text-amber-900 leading-tight">
                      {language === 'rw' 
                        ? `Zigama Frw ${formatCurrency(challengeAlert.amount, currency, language)} uyu munsi.`
                        : `Deposit ${formatCurrency(challengeAlert.amount, currency, language)} today to stay active.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Goal Deadlines warnings */}
              {enableUpcomingDeadlines && deadlineAlerts.length > 0 && (
                deadlineAlerts.map(({ goal, daysLeft, progressPercent }) => (
                  <div key={goal.id} className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-2 shadow-3xs">
                    <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="space-y-1 w-full">
                      <div className="text-[11px] font-black text-blue-950 flex items-center justify-between gap-2">
                        <span className="truncate">{goal.title}</span>
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded shrink-0">
                          {language === 'rw' ? `${daysLeft}d isigaye` : `${daysLeft} days left`}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-blue-900 leading-tight">
                        {language === 'rw'
                          ? `Intego isigaje iminsi ${daysLeft}. Ufite ${formatCurrency(goal.currentAmount, currency, language)} ku ntego ya ${formatCurrency(goal.targetAmount, currency, language)} (${progressPercent}%).`
                          : `${daysLeft} days to deadline. Saved ${formatCurrency(goal.currentAmount, currency, language)} of ${formatCurrency(goal.targetAmount, currency, language)} (${progressPercent}%).`}
                      </p>
                      
                      {/* Micro Progress Bar */}
                      <div className="w-full bg-blue-200/60 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Success / Ideal state when no urgent warnings exist */}
              {(!challengeAlert || !enableDailyChallenge) && (deadlineAlerts.length === 0 || !enableUpcomingDeadlines) && (
                <div className="py-4 text-center text-[11px] text-slate-500 font-bold space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <div>
                    {language === 'rw' 
                      ? "Nta nyibutsa zihutirwa zihari!" 
                      : "No urgent reminders pending!"}
                  </div>
                </div>
              )}

            </div>
          </div>

          <p className="text-[9px] text-slate-400 font-semibold border-t border-slate-200/60 pt-2">
            * {language === 'rw' 
              ? "Ubutumwa n'inyibutsa biruka kuri iyi browser gusa." 
              : "Reminders run in local browser background using HTML5 standard API."}
          </p>
        </div>

      </div>

    </div>
  );
};
