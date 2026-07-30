import React, { useState } from 'react';
import { Member, SavingsGoal, Transaction, Language, Currency, MemberLedgerRecord } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft, 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  Users, 
  Plus, 
  Download, 
  X, 
  ShieldCheck, 
  Sparkles,
  Search,
  History,
  FileSpreadsheet,
  PlusCircle,
  Edit3,
  Trash2,
  Table,
  Check,
  PiggyBank,
  Coins,
  ShieldAlert
} from 'lucide-react';

interface WalletPageProps {
  currentMember: Member;
  members: Member[];
  setCurrentMemberId: (memberId: string) => void;
  goals: SavingsGoal[];
  transactions: Transaction[];
  ledgerRecords?: MemberLedgerRecord[];
  onAddLedgerRecord?: (record: Omit<MemberLedgerRecord, 'id' | 'createdAt'>) => void;
  onUpdateLedgerRecord?: (record: MemberLedgerRecord) => void;
  onDeleteLedgerRecord?: (recordId: string) => void;
  language: Language;
  currency: Currency;
  onTopUpWallet: (memberId: string, amount: number, paymentMethod: 'MoMo' | 'Airtel' | 'Bank', note: string) => void;
  onLoanRequest: (memberId: string, amount: number, description: string) => void;
  onTransferWalletToGoal: (memberId: string, goalId: string, amount: number) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  currentMember,
  members,
  setCurrentMemberId,
  goals,
  transactions,
  ledgerRecords = [],
  onAddLedgerRecord,
  onUpdateLedgerRecord,
  onDeleteLedgerRecord,
  language,
  currency,
  onTopUpWallet,
  onLoanRequest,
  onTransferWalletToGoal,
}) => {
  const t = getTranslation(language);
  const isAdmin = currentMember.role === 'admin';

  // Modals state
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Top Up Form State
  const [topUpAmount, setTopUpAmount] = useState('20000');
  const [topUpMethod, setTopUpMethod] = useState<'MoMo' | 'Airtel' | 'Bank'>('MoMo');
  const [momoNumber, setMomoNumber] = useState(currentMember?.phone || '+250 788 000 000');
  const [topUpNote, setTopUpNote] = useState('');
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState(false);

  // Loan Request Form State
  const [loanAmount, setLoanAmount] = useState('50000');
  const [loanDescription, setLoanDescription] = useState('');
  const [loanSuccessMsg, setLoanSuccessMsg] = useState(false);

  // Goal Transfer Form State
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState('15000');
  const [transferError, setTransferError] = useState('');

  // Ledger Table State
  const [selectedLedgerMemberId, setSelectedLedgerMemberId] = useState<string>(isAdmin ? 'all' : currentMember.id);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MemberLedgerRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Ledger Form Fields
  const [formMemberId, setFormMemberId] = useState<string>(currentMember.id);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formSavings, setFormSavings] = useState<string>('50000');
  const [formTotalSavings, setFormTotalSavings] = useState<string>('500000');
  const [formLoanAmount, setFormLoanAmount] = useState<string>('0');
  const [formPaidAmount, setFormPaidAmount] = useState<string>('0');
  const [formRemainingLoan, setFormRemainingLoan] = useState<string>('0');
  const [formNotes, setFormNotes] = useState<string>('');

  // Filter member transactions
  const memberTransactions = transactions.filter(
    tx => tx.memberId === currentMember.id || tx.memberName === currentMember.name
  );

  // Filtered Ledger Records: Admin can choose 'all' or specific member; regular user sees ONLY their records
  const displayedLedgerRecords = ledgerRecords.filter(rec => {
    if (!isAdmin) {
      return rec.memberId === currentMember.id;
    }
    if (selectedLedgerMemberId === 'all') return true;
    return rec.memberId === selectedLedgerMemberId;
  });

  // Calculate Ledger Summaries
  const totalSavingsSum = displayedLedgerRecords.reduce((sum, r) => sum + r.savings, 0);
  const totalLoanSum = displayedLedgerRecords.reduce((sum, r) => sum + r.loanAmount, 0);
  const totalPaidSum = displayedLedgerRecords.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalRemainingLoanSum = displayedLedgerRecords.reduce((sum, r) => sum + r.remainingLoan, 0);

  // Ledger Open Add Modal
  const openAddRecordModal = () => {
    setEditingRecord(null);
    const targetMemberId = (selectedLedgerMemberId !== 'all' ? selectedLedgerMemberId : currentMember.id);
    setFormMemberId(targetMemberId);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSavings('50000');
    
    // Suggest current member total saved
    const targetMember = members.find(m => m.id === targetMemberId);
    const prevTotal = targetMember ? targetMember.totalSaved + 50000 : 500000;
    setFormTotalSavings(prevTotal.toString());

    setFormLoanAmount('0');
    setFormPaidAmount('0');
    setFormRemainingLoan('0');
    setFormNotes(language === 'rw' ? 'Ubwizigame bw\'ukwezi' : 'Monthly savings record');
    setShowLedgerModal(true);
  };

  // Ledger Open Edit Modal
  const openEditRecordModal = (rec: MemberLedgerRecord) => {
    setEditingRecord(rec);
    setFormMemberId(rec.memberId);
    setFormDate(rec.date);
    setFormSavings(rec.savings.toString());
    setFormTotalSavings(rec.totalSavings.toString());
    setFormLoanAmount(rec.loanAmount.toString());
    setFormPaidAmount(rec.paidAmount.toString());
    setFormRemainingLoan(rec.remainingLoan.toString());
    setFormNotes(rec.notes || '');
    setShowLedgerModal(true);
  };

  // Ledger Submit Handler
  const handleLedgerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMemberId || !formDate) return;

    const targetMem = members.find(m => m.id === formMemberId);
    const memberName = targetMem ? targetMem.name : 'Umunyamuryango';

    const sav = Number(formSavings) || 0;
    const totSav = Number(formTotalSavings) || 0;
    const loan = Number(formLoanAmount) || 0;
    const paid = Number(formPaidAmount) || 0;
    const rem = Number(formRemainingLoan) || 0;

    if (editingRecord) {
      if (onUpdateLedgerRecord) {
        onUpdateLedgerRecord({
          ...editingRecord,
          memberId: formMemberId,
          memberName,
          date: formDate,
          savings: sav,
          totalSavings: totSav,
          loanAmount: loan,
          paidAmount: paid,
          remainingLoan: rem,
          notes: formNotes,
        });
      }
    } else {
      if (onAddLedgerRecord) {
        onAddLedgerRecord({
          memberId: formMemberId,
          memberName,
          date: formDate,
          savings: sav,
          totalSavings: totSav,
          loanAmount: loan,
          paidAmount: paid,
          remainingLoan: rem,
          notes: formNotes,
        });
      }
    }

    setShowLedgerModal(false);
  };

  // Top Up submit
  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(topUpAmount);
    if (amt <= 0) return;

    onTopUpWallet(
      currentMember.id, 
      amt, 
      topUpMethod, 
      topUpNote || `Top up via ${topUpMethod} (${momoNumber})`
    );

    setTopUpSuccessMsg(true);
    setTimeout(() => {
      setTopUpSuccessMsg(false);
      setShowTopUpModal(false);
    }, 1500);
  };

  // Loan Request submit
  const handleLoanRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(loanAmount);
    if (amt <= 0) return;

    onLoanRequest(
      currentMember.id,
      amt,
      loanDescription || (language === 'rw' ? 'Gusaba inguzanyo nshya' : 'New loan request')
    );

    setLoanSuccessMsg(true);
    setTimeout(() => {
      setLoanSuccessMsg(false);
      setShowLoanModal(false);
      setLoanDescription('');
    }, 1500);
  };

  // Transfer submit
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(transferAmount);
    if (amt <= 0 || !selectedGoalId) return;

    if (amt > currentMember.walletBalance) {
      setTransferError(language === 'rw' ? "Amafaranga ari mu wallet ntabwo ahagije!" : "Insufficient wallet balance!");
      return;
    }

    onTransferWalletToGoal(currentMember.id, selectedGoalId, amt);
    setTransferError('');
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-8">

      {/* 3. MAIN WALLET CARDS & ACTION GRID */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Visual Member Wallet Card */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          
          {/* Subtle Background Elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: Brand & QR */}
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8 text-slate-400 opacity-60" />
            </div>
          </div>

          {/* Middle Row: Wallet Balance Display */}
          <div className="my-6 relative z-10">
            <span className="text-xs uppercase font-bold text-blue-300 tracking-wider block mb-1">
              {t.myWalletBalance}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatCurrency(currentMember.walletBalance, currency, language)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'rw' ? 'amafaranga yawe yose wayasanga muri wallet' : 'All your funds and deposits can be found in your wallet'}
            </p>
          </div>

          {/* Bottom Row: Quick Action Buttons (WITH WITHDRAWAL REPLACED BY LOAN REQUEST) */}
          <div className="flex flex-wrap items-center gap-3 relative z-10 pt-4 border-t border-white/10">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4.5 h-4.5" />
              <span>{t.topUpWallet}</span>
            </button>

            {/* REPLACED WITHDRAW WITH REQUEST LOAN BUTTON */}
            <button
              onClick={() => setShowLoanModal(true)}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm sm:text-xs rounded-xl shadow-md transition-all cursor-pointer border border-amber-500/20"
            >
              <Coins className="w-4.5 h-4.5" />
              <span>{language === 'rw' ? 'Saba Inguzanyo' : 'Request Loan'}</span>
            </button>

            <button
              onClick={() => setShowTransferModal(true)}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4.5 h-4.5" />
              <span>{t.transferToGoal}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 4. MEMBER FINANCIAL TABLE LEDGER */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-700 tracking-wider">
              <FileSpreadsheet className="w-4.5 h-4.5 text-blue-700" />
              <span>{language === 'rw' ? 'Raporo y\'itsinda' : 'Group Financial Report'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {language === 'rw' 
                ? 'Raporo y\'itsinda' 
                : 'Group Financial Report'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin 
                ? (language === 'rw' 
                    ? 'Nka Admin, hano ushobora guhitamo umunyamuryango ukamwandikira amafaranga arimwo (Ubwizigame, Inguzanyo, Ayishyuwe, Nayasigaje).' 
                    : 'As Admin, select any member to record or update their savings, loans, amount paid, and remaining balance.')
                : (language === 'rw' 
                    ? 'Raporo y\'itsinda' 
                    : 'Group Financial Report')}
            </p>
          </div>

          {/* Controls: Member Selector & Add Button */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <Users className="w-4 h-4 text-slate-500" />
                <label className="font-bold text-slate-700 whitespace-nowrap">
                  {language === 'rw' ? 'Hitamo Umunyamuryango:' : 'Select Member:'}
                </label>
                <select
                  value={selectedLedgerMemberId}
                  onChange={(e) => setSelectedLedgerMemberId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-black text-xs focus:outline-none focus:border-blue-700 cursor-pointer shadow-xs"
                >
                  <option value="all">{language === 'rw' ? 'Abanyamuryango Bose (All Members)' : 'All Members'}</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.accountNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isAdmin && (
              <button
                onClick={openAddRecordModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'rw' ? 'Ongeraho Record Shya' : 'Add Financial Record'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial Table (Row & Column) - PLACED FIRST IN FINANCIAL SECTION */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">{language === 'rw' ? 'Itariki' : 'Date'}</th>
                {isAdmin && selectedLedgerMemberId === 'all' && (
                  <th className="py-3.5 px-4">{language === 'rw' ? 'Umunyamuryango' : 'Member'}</th>
                )}
                <th className="py-3.5 px-4 text-emerald-800">{language === 'rw' ? 'Ubwizigame' : 'Savings'}</th>
                <th className="py-3.5 px-4 text-blue-800">{language === 'rw' ? 'Nayo Agejejemwo' : 'Total Savings'}</th>
                <th className="py-3.5 px-4 text-amber-800">{language === 'rw' ? 'Inguzanyo' : 'Loan'}</th>
                <th className="py-3.5 px-4 text-emerald-800">{language === 'rw' ? 'Ayishyuwe' : 'Paid'}</th>
                <th className="py-3.5 px-4 text-rose-800">{language === 'rw' ? 'Asigaje kwishyurwa' : 'Remaining'}</th>
                <th className="py-3.5 px-4 text-slate-600">{language === 'rw' ? 'Note / Icyitonderwa' : 'Notes'}</th>
                {isAdmin && (
                  <th className="py-3.5 px-4 text-center">{language === 'rw' ? 'Ibikorwa (CRUD)' : 'Actions'}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedLedgerRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 7} className="py-12 text-center text-slate-400 italic bg-slate-50/50">
                    Nta record y'ubwizigame n'inguzanyo irabikwa mu table.
                  </td>
                </tr>
              ) : (
                displayedLedgerRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {rec.date}
                    </td>
                    {isAdmin && selectedLedgerMemberId === 'all' && (
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {rec.memberName}
                      </td>
                    )}
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                      +{formatCurrency(rec.savings, currency, language)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-700">
                      {formatCurrency(rec.totalSavings, currency, language)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">
                      {formatCurrency(rec.loanAmount, currency, language)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatCurrency(rec.paidAmount, currency, language)}
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.remainingLoan > 0 ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md text-[11px]">
                          {formatCurrency(rec.remainingLoan, currency, language)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>0 RWF (Yarihawe)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={rec.notes}>
                      {rec.notes || '-'}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditRecordModal(rec)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingRecordId(rec.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Highlights Stat Bar - MOVED BELOW THE TABLE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
              <span>{language === 'rw' ? 'Ubwizigame' : 'Savings'}</span>
              <PiggyBank className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-base sm:text-lg font-black text-emerald-900">
              {formatCurrency(totalSavingsSum, currency, language)}
            </p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
              <span>{language === 'rw' ? 'Inguzanyo' : 'Loan'}</span>
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-base sm:text-lg font-black text-amber-900">
              {formatCurrency(totalLoanSum, currency, language)}
            </p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-blue-800 text-xs font-bold">
              <span>{language === 'rw' ? 'Ayishyuwe' : 'Paid'}</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-base sm:text-lg font-black text-blue-900">
              {formatCurrency(totalPaidSum, currency, language)}
            </p>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
              <span>{language === 'rw' ? 'Asigaje kwishyurwa' : 'Remaining'}</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-base sm:text-lg font-black text-rose-900">
              {formatCurrency(totalRemainingLoanSum, currency, language)}
            </p>
          </div>
        </div>

      </div>

      {/* 1. MEMBER PERSONAL TRANSACTION LEDGER - PLACED BELOW SAVINGS & LOANS FINANCIAL AND ABOVE MEMBER PROFILE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-5.5 h-5.5 text-blue-700 animate-pulse" />
              <span>{t.walletStatement}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'rw' 
                ? `Urutonde rwibyakozwe kuri konti ya ${currentMember.name}` 
                : `Account statement for ${currentMember.name}`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-xs">
                <th className="py-3 px-3">Ubwoko / Type</th>
                <th className="py-3 px-3">Intego / Reference</th>
                <th className="py-3 px-3">Metode / Payment</th>
                <th className="py-3 px-3">Itariki / Date</th>
                <th className="py-3 px-3">Note</th>
                <th className="py-3 px-3 text-right">Umubare / Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {memberTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic text-sm">
                    Nta transaction arabikwa kuri iyi konti.
                  </td>
                </tr>
              ) : (
                memberTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/85 transition-colors">
                    <td className="py-4 px-3">
                      <span className={`inline-flex items-center gap-1 font-black px-2.5 py-1.5 rounded-md text-xs ${
                        tx.type === 'deposit' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : tx.type === 'withdraw'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {tx.type === 'deposit' && <ArrowDownLeft className="w-4 h-4" />}
                        {tx.type === 'withdraw' && <ArrowUpRight className="w-4 h-4" />}
                        {tx.type === 'transfer' && <ArrowRightLeft className="w-4 h-4" />}
                        {tx.type === 'deposit' ? 'Top Up' : tx.type === 'withdraw' ? 'Withdrawal' : 'Goal Transfer'}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-extrabold text-slate-900 text-sm sm:text-base">{tx.goalTitle}</td>
                    <td className="py-4 px-3 font-mono text-slate-600 text-sm sm:text-base">{tx.paymentMethod || 'MoMo'}</td>
                    <td className="py-4 px-3 text-slate-500 text-sm sm:text-base">{formatDate(tx.date, language)}</td>
                    <td className="py-4 px-3 text-slate-600 italic text-sm sm:text-base">{tx.note || '-'}</td>
                    <td className={`py-4 px-3 text-right font-black text-sm sm:text-base ${
                      tx.type === 'deposit' ? 'text-emerald-700' : tx.type === 'withdraw' ? 'text-rose-700' : 'text-blue-700'
                    }`}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'withdraw' ? '-' : ''}{formatCurrency(tx.amount, currency, language)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MEMBER PROFILE QUICK SUMMARY - PLACED AT THE VERY END (BOTTOM) & SECURITY PARAGRAPH DELETED */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-black uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-2">
            {language === 'rw' ? 'Ibiranga Konti y\'Umunyamuryango' : 'Member Profile Quick Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm font-semibold">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Izina / Name:</span>
              <span className="font-extrabold text-slate-900">{currentMember.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Numero y'Konti:</span>
              <span className="font-mono font-black text-blue-700">{currentMember.accountNumber}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Telefone:</span>
              <span className="font-extrabold text-slate-800">{currentMember.phone}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Total Saved (Goals):</span>
              <span className="font-black text-emerald-700">{formatCurrency(currentMember.totalSaved, currency, language)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 md:border-none">
              <span className="text-slate-500">Joined Date:</span>
              <span className="text-slate-600">{formatDate(currentMember.joinedDate, language)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Top Up Wallet */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-900">
            <button
              onClick={() => setShowTopUpModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.topUpWallet}</h3>
                <p className="text-xs text-slate-500">Ongeraho amafaranga muri Wallet ya {currentMember.name}</p>
              </div>
            </div>

            {topUpSuccessMsg ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-emerald-800 text-sm">Amafaranga yabitswe neza!</h4>
                <p className="text-xs text-emerald-700">Wallet balance ikaba yazamuwe vuba.</p>
              </div>
            ) : (
              <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
                
                {/* Method selector */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.paymentMethodLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTopUpMethod('MoMo')}
                      className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 font-bold transition-all ${
                        topUpMethod === 'MoMo' ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      <span>MTN MoMo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopUpMethod('Airtel')}
                      className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 font-bold transition-all ${
                        topUpMethod === 'Airtel' ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-rose-600" />
                      <span>Airtel Money</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopUpMethod('Bank')}
                      className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 font-bold transition-all ${
                        topUpMethod === 'Bank' ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>BK / Bank</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Umubare w'Amafaranga (RWF) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-lg font-black focus:outline-none focus:border-blue-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {topUpMethod === 'Bank' ? t.bankAccountLabel : t.momoNumberLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.notePlaceholder}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ubwizigame bw'icyumweru"
                    value={topUpNote}
                    onChange={(e) => setTopUpNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowTopUpModal(false)}
                    className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200"
                  >
                    {t.cancelButton}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 shadow-sm"
                  >
                    {t.confirmDeposit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Saba Inguzanyo (Loan Request) */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowLoanModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                <Coins className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {language === 'rw' ? 'Saba Inguzanyo nshya' : 'Apply for a Loan'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'rw' ? 'Ohereza ubusabe bw\'inguzanyo kuri Admin ngo abyemeze.' : 'Submit a loan request description to the Admin for approval.'}
                </p>
              </div>
            </div>

            {loanSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-emerald-800 text-sm">
                  {language === 'rw' ? 'Ubusabe Bwoherejwe!' : 'Application Sent Successfully!'}
                </h4>
                <p className="text-xs text-emerald-600">
                  {language === 'rw' ? 'Ubusabe bwawe bwoherejwe kuri Admin binyuze kuri site.' : 'Your loan application request has been logged to the Admin panel.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleLoanRequestSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'rw' ? 'Umubare w\'Amafaranga Wifuza (RWF) *' : 'Requested Loan Amount (RWF) *'}
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-lg font-black focus:outline-none focus:border-blue-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'rw' ? 'Ibisobanuro & Impamvu yo Gusaba Inguzanyo *' : 'Description & Reason for Loan Request *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={loanDescription}
                    onChange={(e) => setLoanDescription(e.target.value)}
                    placeholder={language === 'rw' ? 'Sobanura impamvu ukeneye inguzanyo n\'uko uzayishyura...' : 'Explain why you need this loan and your plan for repayment...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowLoanModal(false)}
                    className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 cursor-pointer"
                  >
                    {t.cancelButton}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 shadow-sm cursor-pointer"
                  >
                    {language === 'rw' ? 'Ohereza Gusaba' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Transfer Wallet to Goal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-900">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.transferToGoal}</h3>
                <p className="text-xs text-slate-500">Yerekeze amafaranga ava mu wallet ajya mu intego wifuza</p>
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.selectGoalToTransfer} *
                </label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-700 focus:bg-white"
                >
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({formatCurrency(g.currentAmount, currency, language)} / {formatCurrency(g.targetAmount, currency, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.transferAmount} (RWF) *
                </label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={transferAmount}
                  onChange={(e) => {
                    setTransferAmount(e.target.value);
                    setTransferError('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 text-lg font-black focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              {transferError && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{transferError}</span>
                </p>
              )}

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aya mafaranga azahita akurwa mu Wallet ya {currentMember.name}, yongerwe mu ntego yitoranijwe.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm"
                >
                  Yerekeze Vuba
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Add/Edit Financial Ledger Record */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowLedgerModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingRecord 
                    ? (language === 'rw' ? 'Hindura Record y\'Ubwizigame / Inguzanyo' : 'Edit Financial Record')
                    : (language === 'rw' ? 'Ongeraho Record y\'Amafaranga (Table Entry)' : 'Add Financial Table Record')}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'rw' ? 'Kwandika no kuvugurura data muri table y\'umunyamuryango (Admin Only)' : 'Enter exact figures for savings, loan, paid, and remaining balance.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleLedgerSubmit} className="space-y-4 text-xs">
              {/* Select Member */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Umunyamuryango (Member) *
                </label>
                <select
                  value={formMemberId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setFormMemberId(newId);
                    const mem = members.find(m => m.id === newId);
                    if (mem) {
                      setFormTotalSavings((mem.totalSaved + Number(formSavings)).toString());
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-700"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.accountNumber}) - Wallet: {formatCurrency(m.walletBalance, currency, language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Savings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Itariki (Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    Ubwizigame (Savings) (RWF) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formSavings}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormSavings(val);
                      const targetMem = members.find(m => m.id === formMemberId);
                      if (targetMem) {
                        setFormTotalSavings((targetMem.totalSaved + (Number(val) || 0)).toString());
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Nayo Agejejemwo (Total Savings) */}
              <div>
                <label className="block font-bold text-blue-800 uppercase tracking-wider mb-1">
                  Nayo Agejejemwo (Total Accumulated Savings) (RWF) *
                </label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={formTotalSavings}
                  onChange={(e) => setFormTotalSavings(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-blue-700"
                />
              </div>

              {/* Loan & Amount Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-800 uppercase tracking-wider mb-1">
                    Inguzanyo (Loan Amount) (RWF)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formLoanAmount}
                    onChange={(e) => {
                      const loanVal = e.target.value;
                      setFormLoanAmount(loanVal);
                      const rem = Math.max(0, (Number(loanVal) || 0) - (Number(formPaidAmount) || 0));
                      setFormRemainingLoan(rem.toString());
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    Ayishyuwe (Amount Paid) (RWF)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formPaidAmount}
                    onChange={(e) => {
                      const paidVal = e.target.value;
                      setFormPaidAmount(paidVal);
                      const rem = Math.max(0, (Number(formLoanAmount) || 0) - (Number(paidVal) || 0));
                      setFormRemainingLoan(rem.toString());
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Nayasigaje Kwishyura (Remaining Loan) */}
              <div>
                <label className="block font-bold text-rose-800 uppercase tracking-wider mb-1">
                  Nayasigaje Kwishyura (Remaining Loan Balance) (RWF)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formRemainingLoan}
                  onChange={(e) => setFormRemainingLoan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-rose-600"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Icyitonderwa / Notes (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ubwizigame bw'ukwezi kwa 7 + kwishyura inguzanyo"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md"
                >
                  {editingRecord 
                    ? (language === 'rw' ? 'Bika Ibyahinduwe' : 'Save Changes')
                    : (language === 'rw' ? 'Bika Record Muri Table' : 'Save Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900 text-center">
            <div className="w-14 h-14 bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {language === 'rw' ? 'Siba iyi Record?' : 'Delete Record?'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'rw' ? 'Waba wizeye ko ushaka gusiba iyi record mu igitabo cy\'table?' : 'Are you sure you want to delete this financial record from the ledger table?'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingRecordId(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                {t.cancelButton}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteLedgerRecord && deletingRecordId) {
                    onDeleteLedgerRecord(deletingRecordId);
                  }
                  setDeletingRecordId(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md"
              >
                {language === 'rw' ? 'Yego, Siba' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
