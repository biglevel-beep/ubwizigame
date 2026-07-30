import React, { useState } from 'react';
import { Member, SavingsGoal, Transaction, Language, Currency, AdminNotification } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  UserCheck, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  X, 
  Check, 
  Coins, 
  PiggyBank, 
  Phone, 
  Mail, 
  CreditCard, 
  Plus, 
  Minus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  FileSpreadsheet,
  Stamp,
  Printer,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Bell,
  Share2,
  Inbox
} from 'lucide-react';

interface AdminDashboardProps {
  members: Member[];
  goals: SavingsGoal[];
  transactions: Transaction[];
  language: Language;
  currency: Currency;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (unlocked: boolean) => void;
  onAddMember: (newMember: Omit<Member, 'id' | 'accountNumber' | 'totalSaved' | 'joinedDate'>) => void;
  onUpdateMember: (updatedMember: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onAdminDepositToWallet: (memberId: string, amount: number, note: string) => void;
  onAdminWithdrawFromWallet: (memberId: string, amount: number, note: string) => void;
  notifications: AdminNotification[];
  onMarkNotifAsRead: (id: string) => void;
  onClearNotif: (id: string) => void;
  onApproveLoanRequest: (notifId: string, memberId: string, amount: number, description: string) => void;
  onShareLoanRequest: (notifId: string, memberName: string, amount: number, description: string) => void;
  onApproveNewUser?: (notifId: string, memberId: string) => void;
  onRejectNewUser?: (notifId: string, memberId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  members,
  goals,
  transactions,
  language,
  currency,
  isAdminUnlocked,
  setIsAdminUnlocked,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onAdminDepositToWallet,
  onAdminWithdrawFromWallet,
  notifications = [],
  onMarkNotifAsRead,
  onClearNotif,
  onApproveLoanRequest,
  onShareLoanRequest,
  onApproveNewUser,
  onRejectNewUser,
}) => {
  const t = getTranslation(language);

  // Local state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [activeLedgerPage, setActiveLedgerPage] = useState<'registry' | 'ledger' | 'goals' | 'notifications'>('registry');

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [walletTxMember, setWalletTxMember] = useState<{ member: Member; type: 'deposit' | 'withdraw' } | null>(null);
  const [walletTxAmount, setWalletTxAmount] = useState('');
  const [walletTxNote, setWalletTxNote] = useState('');

  // New Member Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('50000');
  const [newStatus, setNewStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [newRole, setNewRole] = useState<'member' | 'admin'>('member');

  // PIN Unlock Handler
  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '2026') {
      setIsAdminUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  // Add Member Submit
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    onAddMember({
      name: newName.trim(),
      phone: newPhone.trim(),
      nationalId: newNationalId.trim() || '1 1990 8 0000000 0 00',
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      walletBalance: Number(newInitialBalance) || 0,
      status: newStatus,
      role: newRole,
    });

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewNationalId('');
    setNewEmail('');
    setNewInitialBalance('50000');
    setNewStatus('active');
    setNewRole('member');
    setShowAddMemberModal(false);
  };

  // Edit Member Submit
  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setEditingMember(null);
  };

  // Admin Direct Wallet Tx Handler
  const handleWalletTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletTxMember || !walletTxAmount) return;
    const amt = Number(walletTxAmount);
    if (amt <= 0) return;

    if (walletTxMember.type === 'deposit') {
      onAdminDepositToWallet(walletTxMember.member.id, amt, walletTxNote || 'Admin Wallet Adjustment (+)');
    } else {
      onAdminWithdrawFromWallet(walletTxMember.member.id, amt, walletTxNote || 'Admin Wallet Adjustment (-)');
    }

    setWalletTxMember(null);
    setWalletTxAmount('');
    setWalletTxNote('');
  };

  // Filter Members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Totals
  const totalGroupWallet = members.reduce((sum, m) => sum + m.walletBalance, 0);
  const totalGroupSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // If Admin is locked, show security unlock screen
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border-4 border-amber-900/60 rounded-3xl p-8 shadow-2xl text-center space-y-6 text-white relative">
        <div className="w-16 h-16 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <BookOpen className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-amber-300 tracking-wide uppercase">
            AGATABO K'IKIMINA
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Andika PIN ya Admin kugirango ufungure Igitabo cy'Ikimina n'Ubwizigame (Default PIN: <span className="font-mono font-bold text-amber-300">1234</span>)
          </p>
        </div>

        <form onSubmit={handleUnlockAdmin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              {t.enterAdminPin}
            </label>
            <input
              type="password"
              placeholder="••••"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-amber-300 focus:outline-none focus:border-amber-400"
            />
            {pinError && (
              <p className="text-xs text-rose-400 font-bold mt-1.5 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PIN si yo! Geza kuri PIN: 1234</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Fungura Agatabo Ka Admin</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          Ibiro by'Umuyobozi w'Ikimina (Admin Ledger Registry) • Igihango Savings Group 2026
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* LEATHER BINDER EMBOSSED COVER FRAME (AGATABO CONTAINER) */}
      <div className="bg-[#181d28] border-8 border-[#3b271d] rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Binder Spine Lines Aesthetic */}
        <div className="absolute left-0 top-0 bottom-0 w-3 sm:w-5 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-r border-amber-800/40 pointer-events-none" />

        {/* Agatabo Header Banner (Embossed Gold/Navy Style) */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>AGATABO Z'IBYABITSWE - OFFICIAL SAVINGS LEDGER 2026</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-amber-100 uppercase tracking-tight flex items-center gap-3">
              <span>AGATABO KA ADMIN (LEDGER BOOK)</span>
              <span className="text-xs bg-amber-500/30 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-md font-mono">
                REG-2026
              </span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm">
              Igitabo k'ibyamaze gukorwa mu ikimina: Registre y'abanyamuryango, gucunga ma balances, no kwemeza deposits/withdrawals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.addNewMember}</span>
            </button>

            <button
              onClick={() => setIsAdminUnlocked(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Funga Agatabo</span>
            </button>
          </div>

        </div>

        {/* FINANCIAL SUMMARY REGISTER COUNTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#fffdfa] border border-amber-900/20 rounded-2xl p-5 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Abanyamuryango Bose
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{members.length}</div>
              <span className="text-[10px] text-slate-500">Konti zose z'ikimina</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#fffdfa] border border-amber-900/20 rounded-2xl p-5 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Yose Ari Mu Ma Wallet
              </span>
              <div className="text-xl font-black text-emerald-800 mt-0.5">
                {formatCurrency(totalGroupWallet, currency, language)}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">In Wallet Accounts</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#fffdfa] border border-amber-900/20 rounded-2xl p-5 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Yose Ari Mu Intego
              </span>
              <div className="text-xl font-black text-blue-900 mt-0.5">
                {formatCurrency(totalGroupSavings, currency, language)}
              </div>
              <span className="text-[10px] text-blue-700 font-semibold">In Savings Goals</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#fffdfa] border border-amber-900/20 rounded-2xl p-5 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Imiterere (Status)
              </span>
              <div className="text-xl font-black text-teal-900 mt-0.5">
                {members.filter(m => m.status === 'active').length} Active
              </div>
              <span className="text-[10px] text-amber-800 font-semibold">100% Verified Members</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold">
              <Stamp className="w-5 h-5" />
            </div>

          </div>

        </div>

        {/* LEDGER BOOK PAGES NAV TABS */}
        <div className="bg-[#f7f3eb] p-1.5 rounded-2xl border border-amber-900/20 flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setActiveLedgerPage('registry')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeLedgerPage === 'registry'
                ? 'bg-[#181d28] text-amber-300 shadow-md border border-amber-500/30'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rupapuro 1: Registre y'Abanyamuryango</span>
          </button>

          <button
            onClick={() => setActiveLedgerPage('ledger')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeLedgerPage === 'ledger'
                ? 'bg-[#181d28] text-amber-300 shadow-md border border-amber-500/30'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rupapuro 2: Igitabo cy'Ibyakozwe (Transactions Ledger)</span>
          </button>

          <button
            onClick={() => setActiveLedgerPage('goals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeLedgerPage === 'goals'
                ? 'bg-[#181d28] text-amber-300 shadow-md border border-amber-500/30'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Rupapuro 3: Intego z'Ikimina (Group Goals)</span>
          </button>

          <button
            onClick={() => setActiveLedgerPage('notifications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all relative ${
              activeLedgerPage === 'notifications'
                ? 'bg-[#181d28] text-amber-300 shadow-md border border-amber-500/30'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Rupapuro 4: Ubusabe & Notifications</span>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="bg-rose-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center justify-center animate-bounce">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

        </div>

        {/* PHYSICAL PARCHMENT PAGE CONTENT (BG-[#fffdfa] WITH FAINT LEDGER RULINGS) */}
        <div className="bg-[#fffdfa] border-2 border-amber-900/20 rounded-2xl p-6 sm:p-8 text-slate-900 shadow-lg relative min-h-[480px]">
          
          {/* Watermark Official Stamp */}
          <div className="absolute right-8 top-8 opacity-5 pointer-events-none select-none text-slate-900 font-black text-6xl rotate-[-12deg]">
            OFFICIAL LEDGER
          </div>

          {/* PAGE 1: MEMBER REGISTRY & CRUD */}
          {activeLedgerPage === 'registry' && (
            <div className="space-y-6">
              
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-amber-900/10">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Shakisha ku Izina, Telefone, cyangwa Account #..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="all">Mose Status</option>
                    <option value="active">Active Only</option>
                    <option value="pending">Pending Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* Lined Financial Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f7f2e7] text-amber-950 font-black border-b-2 border-amber-900/30 uppercase tracking-wider">
                      <th className="py-3 px-3">Acc #</th>
                      <th className="py-3 px-3">Izina n'Inshingano</th>
                      <th className="py-3 px-3">Telefone & Indangamuntu</th>
                      <th className="py-3 px-3">Wallet Balance</th>
                      <th className="py-3 px-3">Total Saved</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/10 font-medium">
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-blue-900">
                          {m.accountNumber}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-slate-900 flex items-center gap-2">
                            <span>{m.name}</span>
                            {m.role === 'admin' && (
                              <span className="bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{m.email}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-mono text-slate-800">{m.phone}</div>
                          <div className="text-[10px] text-slate-500 font-mono">NIM: {m.nationalId}</div>
                        </td>

                        <td className="py-3.5 px-3 font-black text-emerald-800">
                          {formatCurrency(m.walletBalance, currency, language)}
                        </td>

                        <td className="py-3.5 px-3 font-bold text-blue-900">
                          {formatCurrency(m.totalSaved, currency, language)}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            m.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                              : m.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* Wallet Adjust buttons */}
                            <button
                              onClick={() => setWalletTxMember({ member: m, type: 'deposit' })}
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-all"
                              title="Bika kuri Wallet (+)"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setWalletTxMember({ member: m, type: 'withdraw' })}
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all"
                              title="Bikuza kuri Wallet (-)"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Member */}
                            <button
                              onClick={() => setEditingMember(m)}
                              className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 transition-all"
                              title="Hindura Iby'Umunyamuryango"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Member */}
                            <button
                              onClick={() => setDeletingMemberId(m.id)}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 transition-all"
                              title="Saza Umunyamuryango"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* PAGE 2: TRANSACTIONS LEDGER */}
          {activeLedgerPage === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
                <h3 className="font-black text-amber-950 uppercase tracking-wide text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-900" />
                  <span>Igitabo cy'Ibyakozwe Byose (Official Group Ledger Transactions)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f7f2e7] text-amber-950 font-black border-b-2 border-amber-900/30 uppercase tracking-wider">
                      <th className="py-3 px-3">Umunyamuryango</th>
                      <th className="py-3 px-3">Ubwoko</th>
                      <th className="py-3 px-3">Intego / Ref</th>
                      <th className="py-3 px-3">Payment Method</th>
                      <th className="py-3 px-3">Itariki</th>
                      <th className="py-3 px-3 text-right">Umubare (Amount)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/10 font-medium">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-amber-50/50">
                        <td className="py-3 px-3 font-bold text-slate-900">{tx.memberName || 'Member'}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                            tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-900' : tx.type === 'withdraw' ? 'bg-rose-100 text-rose-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-800">{tx.goalTitle}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{tx.paymentMethod || 'MoMo'}</td>
                        <td className="py-3 px-3 text-slate-500">{formatDate(tx.date, language)}</td>
                        <td className={`py-3 px-3 text-right font-black ${
                          tx.type === 'deposit' ? 'text-emerald-800' : tx.type === 'withdraw' ? 'text-rose-800' : 'text-blue-900'
                        }`}>
                          {formatCurrency(tx.amount, currency, language)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 3: GROUP GOALS REGISTER */}
          {activeLedgerPage === 'goals' && (
            <div className="space-y-4">
              <h3 className="font-black text-amber-950 uppercase tracking-wide text-sm flex items-center gap-2 border-b border-amber-900/10 pb-3">
                <PiggyBank className="w-5 h-5 text-amber-900" />
                <span>Registre y'Intego z'Ikimina (Group Savings Goals)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div key={g.id} className="p-4 bg-[#fcf9f2] border border-amber-900/20 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{g.title}</span>
                        <span className="text-xs font-black text-amber-900">{pct}%</span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full transition-all" style={{ width: `${pct}%` }} />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                        <span>Current: <strong className="text-emerald-800">{formatCurrency(g.currentAmount, currency, language)}</strong></span>
                        <span>Target: <strong className="text-slate-900">{formatCurrency(g.targetAmount, currency, language)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAGE 4: UBUSABE & NOTIFICATIONS REGISTER */}
          {activeLedgerPage === 'notifications' && (
            <div className="space-y-4 text-slate-950">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-900/10 pb-3">
                <h3 className="font-black text-amber-950 uppercase tracking-wide text-sm flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-900 animate-pulse" />
                  <span>Konti y'Ubusabe n'Impapuro za Notifications ({notifications.length})</span>
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      notifications.forEach(n => {
                        if (!n.isRead) onMarkNotifAsRead(n.id);
                      });
                    }}
                    className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    {language === 'rw' ? 'Yemeza zose ko zasomwe' : 'Mark all as read'}
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic bg-slate-50/50 rounded-xl space-y-2">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>{language === 'rw' ? 'Nta notification nshya cyangwa ubusabe burimo kuri ubu.' : 'No new notifications or requests at the moment.'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => {
                    const isLoan = n.type === 'loan_request';
                    const isNewUser = n.type === 'new_user_registration';
                    return (
                      <div 
                        key={n.id} 
                        className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          !n.isRead 
                            ? 'bg-amber-50/70 border-amber-200 shadow-xs' 
                            : 'bg-[#fcf9f2] border-amber-900/10'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            isNewUser
                              ? n.isApproved ? 'bg-emerald-100 text-emerald-800' : n.isRejected ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800 animate-pulse'
                              : isLoan 
                              ? n.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isNewUser ? <UserPlus className="w-5 h-5" /> : isLoan ? <Coins className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-slate-950 text-xs sm:text-sm">{n.memberName}</span>
                              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md font-mono text-slate-700">{n.date}</span>
                              
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                isNewUser
                                  ? 'bg-purple-200 text-purple-900'
                                  : isLoan 
                                  ? 'bg-blue-200 text-blue-900' 
                                  : 'bg-amber-200 text-amber-900'
                              }`}>
                                {isNewUser
                                  ? `New User (${n.groupName || 'Group'})`
                                  : isLoan 
                                  ? (language === 'rw' ? 'Gusaba Inguzanyo (Loan Request)' : 'Loan Request') 
                                  : (language === 'rw' ? 'Kwishyura (Deposit)' : 'Wallet Top-Up')
                                }
                              </span>

                              {n.isApproved && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Yemejwe (Accepted)</span>
                                </span>
                              )}

                              {n.isRejected && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 flex items-center gap-1">
                                  <X className="w-3 h-3" />
                                  <span>Yahanaguwe (Rejected)</span>
                                </span>
                              )}

                              {n.isShared && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 flex items-center gap-1">
                                  <Share2 className="w-3 h-3" />
                                  <span>Yasangijwe (Shared)</span>
                                </span>
                              )}
                            </div>

                            <p className="text-slate-800 text-xs font-semibold leading-relaxed text-left">
                              {n.description}
                            </p>

                            {n.amount > 0 && (
                              <div className="text-xs pt-1 text-left">
                                <span className="text-slate-500">{language === 'rw' ? 'Umubare w\'Amafaranga:' : 'Amount:'} </span>
                                <strong className="text-slate-900 text-sm">{formatCurrency(n.amount, currency, language)}</strong>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 shrink-0">
                          {isNewUser && !n.isApproved && !n.isRejected && (
                            <>
                              <button
                                onClick={() => onApproveNewUser && onApproveNewUser(n.id, n.memberId)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition-all cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>accept new user</span>
                              </button>
                              <button
                                onClick={() => onRejectNewUser && onRejectNewUser(n.id, n.memberId)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition-all cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>reject</span>
                              </button>
                            </>
                          )}

                          {isLoan && (
                            <>
                              {!n.isApproved ? (
                                <button
                                  onClick={() => onApproveLoanRequest(n.id, n.memberId, n.amount, n.description)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition-all cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{language === 'rw' ? 'Kuyemeza (Approve)' : 'Approve Loan'}</span>
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>{language === 'rw' ? 'Yemejwe!' : 'Approved'}</span>
                                </span>
                              )}

                              {!n.isShared ? (
                                <button
                                  onClick={() => onShareLoanRequest(n.id, n.memberName, n.amount, n.description)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition-all cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>{language === 'rw' ? 'Kuyisangiza (Share)' : 'Share Request'}</span>
                                </button>
                              ) : (
                                <span className="text-xs text-purple-700 font-extrabold flex items-center gap-1 bg-purple-50 border border-purple-100 px-2.5 py-1.5 rounded-lg">
                                  <Share2 className="w-4 h-4" />
                                  <span>{language === 'rw' ? 'Yasangijwe!' : 'Shared'}</span>
                                </span>
                              )}
                            </>
                          )}

                          {!n.isRead && (
                            <button
                              onClick={() => onMarkNotifAsRead(n.id)}
                              className="px-2.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                              title={language === 'rw' ? 'Merka ko yasomwe' : 'Mark as read'}
                            >
                              {language === 'rw' ? 'Soma' : 'Read'}
                            </button>
                          )}

                          <button
                            onClick={() => onClearNotif(n.id)}
                            className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg transition-all cursor-pointer"
                            title={language === 'rw' ? 'Siba notification' : 'Clear notification'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* MODAL: ADD NEW MEMBER */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffdfa] border-4 border-amber-900/40 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative text-slate-900">
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-amber-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-900/10 pb-4">
              <div className="p-3 bg-amber-100 text-amber-950 rounded-2xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-950 uppercase">{t.addNewMember}</h3>
                <p className="text-xs text-slate-500">Iyandikishe no kubika umunyamuryango mushya mu Agatabo</p>
              </div>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">{t.memberNameLabel} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Habimana Jean Claude"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t.memberPhoneLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="+250 788 000 000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t.memberIdLabel}</label>
                  <input
                    type="text"
                    placeholder="1 1990 8 0000000 0 00"
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">{t.initialDepositLabel} (RWF)</label>
                <input
                  type="number"
                  step="5000"
                  value={newInitialBalance}
                  onChange={(e) => setNewInitialBalance(e.target.value)}
                  className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-black text-emerald-800 focus:outline-none focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t.memberStatus}</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t.memberRoleLabel}</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/10">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md"
                >
                  {language === 'rw' ? 'Bika Umunyamuryango' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMBER */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffdfa] border-4 border-amber-900/40 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative text-slate-900">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-amber-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-900/10 pb-4">
              <div className="p-3 bg-blue-100 text-blue-900 rounded-2xl">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-950 uppercase">{t.editMember}</h3>
                <p className="text-xs text-slate-500">{editingMember.name} ({editingMember.accountNumber})</p>
              </div>
            </div>

            <form onSubmit={handleEditMemberSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">{t.memberNameLabel}</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t.memberPhoneLabel}</label>
                  <input
                    type="text"
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t.memberStatus}</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                    className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/10">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs shadow-md"
                >
                  {language === 'rw' ? 'Bika Iyahindutse' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN WALLET ADJUSTMENT */}
      {walletTxMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffdfa] border-4 border-amber-900/40 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative text-slate-900">
            <button
              onClick={() => setWalletTxMember(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-amber-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-900/10 pb-4">
              <div className={`p-3 rounded-2xl ${walletTxMember.type === 'deposit' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                {walletTxMember.type === 'deposit' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-950 uppercase">
                  {walletTxMember.type === 'deposit' ? 'Bika Kuri Wallet' : 'Bikuza Kuri Wallet'}
                </h3>
                <p className="text-xs text-slate-500">{walletTxMember.member.name} ({formatCurrency(walletTxMember.member.walletBalance, currency, language)})</p>
              </div>
            </div>

            <form onSubmit={handleWalletTxSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Umubare w'Amafaranga (RWF) *</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={walletTxAmount}
                  onChange={(e) => setWalletTxAmount(e.target.value)}
                  className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-4 py-3 text-slate-900 text-lg font-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Icyitonderwa (Note)</label>
                <input
                  type="text"
                  placeholder="e.g. Ubwizigame bw'icyumweru butanzwe mu ntoki"
                  value={walletTxNote}
                  onChange={(e) => setWalletTxNote(e.target.value)}
                  className="w-full bg-[#fcf9f2] border border-amber-900/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/10">
                <button
                  type="button"
                  onClick={() => setWalletTxMember(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-md text-white ${
                    walletTxMember.type === 'deposit' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Yemeza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE MEMBER */}
      {deletingMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffdfa] border-4 border-amber-900/40 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900">
            <div className="flex items-center gap-3 border-b border-amber-900/10 pb-4">
              <div className="p-3 bg-rose-100 text-rose-900 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-950 uppercase">{t.deleteMember}</h3>
                <p className="text-xs text-slate-500">Ese ufite icyizere cyo gukura uyu munyamuryango mu Agatabo?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingMemberId(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                {t.cancelButton}
              </button>
              <button
                onClick={() => {
                  onDeleteMember(deletingMemberId);
                  setDeletingMemberId(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs shadow-md"
              >
                Gusaza Umunyamuryango
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
