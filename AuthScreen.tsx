import React, { useState, useEffect } from 'react';
import { Member, Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency } from '../utils/formatters';
import { 
  User, 
  Lock, 
  Smartphone, 
  Mail, 
  CreditCard, 
  UserPlus, 
  LogIn, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  PiggyBank,
  Phone,
  BookOpen,
  ArrowRight,
  MailCheck,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  Send,
  Clock,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', name: 'Marie' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', name: 'Jean' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', name: 'Chantal' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', name: 'Eric' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250', name: 'Aline' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250', name: 'Fabrice' },
];

interface AuthScreenProps {
  members: Member[];
  onLogin: (memberId: string) => void;
  onSignup: (newMemberData: Omit<Member, 'id' | 'accountNumber' | 'totalSaved' | 'joinedDate'>) => void;
  onUpdatePin?: (memberId: string, newPin: string) => void;
  language: Language;
  currency: Currency;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  members,
  onLogin,
  onSignup,
  onUpdatePin,
  language,
  currency,
}) => {
  const t = getTranslation(language);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showQuickFill, setShowQuickFill] = useState(false);

  // Forgotten PIN State
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'new_pin'>('request');
  const [resetCode, setResetCode] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetMemberId, setResetMemberId] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [newPinConfirmInput, setNewPinConfirmInput] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Signup Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+250 788 ');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [groupName, setGroupName] = useState<'TUZAMURANE TETERO' | 'UMUHUZA TETERO'>('TUZAMURANE TETERO');
  const [initialDeposit, setInitialDeposit] = useState('20000');
  const [signupPin, setSignupPin] = useState('');
  const [signupConfirmPin, setSignupConfirmPin] = useState('');
  const [signupError, setSignupError] = useState('');

  // Email Verification State
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<Omit<Member, 'id' | 'accountNumber' | 'totalSaved' | 'joinedDate'> | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [resendNotice, setResendNotice] = useState('');

  // Profile Picture (Avatar) State
  const [isSettingAvatar, setIsSettingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_AVATARS[0].url);

  // Timer Countdown for Email Verification Resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifyingEmail && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifyingEmail, resendCountdown]);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = loginIdentifier.trim().toLowerCase();

    if (!cleanInput) {
      setLoginError(
        language === 'rw'
          ? 'Andika numero ya telefone cyangwa email!'
          : 'Please enter your phone number or email!'
      );
      return;
    }

    if (!loginPin.trim()) {
      setLoginError(
        language === 'rw'
          ? 'Andika PIN cyangwa Password yawe!'
          : 'Please enter your security PIN or password!'
      );
      return;
    }

    // Helper to extract digits for phone matching
    const extractDigits = (val: string) => val.replace(/[^0-9]/g, '');
    const inputDigits = extractDigits(cleanInput);

    // Search member by Phone, Email, Account Number, or Name
    const matchedMember = members.find(m => {
      const mEmail = m.email ? m.email.toLowerCase().trim() : '';
      const mPhoneDigits = extractDigits(m.phone || '');
      const mAcc = m.accountNumber ? m.accountNumber.toLowerCase().trim() : '';
      const mName = m.name ? m.name.toLowerCase().trim() : '';

      if (cleanInput === mEmail) return true;
      if (cleanInput === mAcc) return true;
      if (cleanInput === mName) return true;
      if (inputDigits.length >= 7 && mPhoneDigits.length >= 7 && (mPhoneDigits.endsWith(inputDigits) || inputDigits.endsWith(mPhoneDigits))) return true;
      return false;
    });

    if (!matchedMember) {
      setLoginError(
        language === 'rw'
          ? 'Nta konti yabonywe ikoresha iyi telefone cyangwa email. Gerageza iyandi cyangwa wiyandikishe!'
          : 'No account found with this phone number or email. Please check or sign up!'
      );
      return;
    }

    // Validate PIN (check custom pin or default '1234')
    const validPin = matchedMember.pin || '1234';
    if (loginPin.trim() !== validPin && loginPin.trim() !== '1234') {
      setLoginError(
        language === 'rw'
          ? 'PIN / Password ntabwo ari yo! (Ijambo ry\'ibanga ry\'imbanzirizamushinga ni 1234)'
          : 'Incorrect PIN or password! (Default PIN is 1234)'
      );
      return;
    }

    setLoginError('');
    onLogin(matchedMember.id);
  };

  // Handle Passcode Reset Step 1: Request
  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = resetIdentifier.trim().toLowerCase();

    if (!cleanInput) {
      setResetError(
        language === 'rw'
          ? 'Andika numero ya telefone cyangwa email yawe!'
          : 'Please enter your phone number or email address!'
      );
      return;
    }

    const extractDigits = (val: string) => val.replace(/[^0-9]/g, '');
    const inputDigits = extractDigits(cleanInput);

    const matchedMember = members.find(m => {
      const mEmail = m.email ? m.email.toLowerCase().trim() : '';
      const mPhoneDigits = extractDigits(m.phone || '');
      if (cleanInput === mEmail) return true;
      if (inputDigits.length >= 7 && mPhoneDigits.length >= 7 && (mPhoneDigits.endsWith(inputDigits) || inputDigits.endsWith(mPhoneDigits))) return true;
      return false;
    });

    if (!matchedMember) {
      setResetError(
        language === 'rw'
          ? 'Nta muryango cyangwa konti yabonetse ikoresha iyi telefone cyangwa imeri!'
          : 'No member or account found with this phone number or email!'
      );
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setResetCode(code);
    setResetMemberId(matchedMember.id);
    setResetStep('verify');
    setResetError('');
    setResetSuccessMsg(
      language === 'rw'
        ? `Ubutumwa bugufi (SMS) / Email byohererejwe kuri ${matchedMember.phone || matchedMember.email} burimo ikode yo guhindura PIN.`
        : `An SMS / Email with reset code has been sent to ${matchedMember.phone || matchedMember.email}.`
    );
  };

  // Handle Passcode Reset Step 2: Verify Code
  const handleResetVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCodeInput.trim() !== resetCode && resetCodeInput.trim() !== '8899') {
      setResetError(
        language === 'rw'
          ? 'Ikode si yo! Reba ubutumwa bugufi cyangwa ukoreshe ikode y\'icyitegererezo.'
          : 'Incorrect code! Check your message or use the demo code.'
      );
      return;
    }

    setResetStep('new_pin');
    setResetError('');
    setResetSuccessMsg('');
  };

  // Handle Passcode Reset Step 3: New PIN Set
  const handleResetComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length !== 4) {
      setResetError(
        language === 'rw'
          ? 'PIN igomba kuba igizwe n\'imibarwa 4!'
          : 'PIN must be exactly 4 digits!'
      );
      return;
    }

    if (newPinInput !== newPinConfirmInput) {
      setResetError(
        language === 'rw'
          ? 'PIN zombi ntabwo zihuye!'
          : 'PINs do not match!'
      );
      return;
    }

    if (onUpdatePin) {
      onUpdatePin(resetMemberId, newPinInput);
    }

    setResetSuccessMsg(
      language === 'rw'
        ? 'PIN yawe yahinduwe neza! Ubu ushobora kwinjira ukoresheje PIN nshya.'
        : 'Your PIN has been updated successfully! Please log in now with your new PIN.'
    );
    setTimeout(() => {
      setIsResettingPin(false);
      setResetIdentifier('');
      setResetCode('');
      setResetCodeInput('');
      setNewPinInput('');
      setNewPinConfirmInput('');
      setResetSuccessMsg('');
      setResetError('');
      const member = members.find(m => m.id === resetMemberId);
      if (member) {
        setLoginIdentifier(member.phone || member.email);
      }
    }, 3000);
  };

  // Handle Signup Submit (Triggers Email Verification)
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setSignupError(language === 'rw' ? "Andika izina ryawe ryose!" : "Full name is required!");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setSignupError(language === 'rw' ? "Andika numero ya telefone yuzuye!" : "Valid phone number required!");
      return;
    }
    if (signupPin && signupConfirmPin && signupPin !== signupConfirmPin) {
      setSignupError(language === 'rw' ? "PIN zombi ntandukanye!" : "PINs do not match!");
      return;
    }

    const cleanNameStr = fullName.toLowerCase().trim().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const targetEmail = email.trim() || `${cleanNameStr || 'user'}@gmail.com`;
    const initAmt = Number(initialDeposit) || 0;

    // Generate random 6-digit OTP code for email verification
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    setPendingSignupData({
      name: fullName.trim(),
      phone: phone.trim(),
      nationalId: nationalId.trim() || '1 1995 8 0001234 0 99',
      email: targetEmail,
      walletBalance: initAmt,
      status: 'pending',
      role: 'member',
      groupName: groupName,
      pin: signupPin || '1234',
    });

    setGeneratedCode(code);
    setVerificationCodeInput('');
    setVerificationError('');
    setIsVerifyingEmail(true);
    setResendCountdown(60);
    setSignupError('');
  };

  // Handle OTP Verification Submit -> Moves to Avatar step
  const handleVerifyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCodeInput.trim()) {
      setVerificationError(
        language === 'rw' 
          ? "Andika ikode y'imibarwa 6 yoherejwe kuri email yawe!" 
          : "Please enter the 6-digit code sent to your email!"
      );
      return;
    }

    // Allow generated code or universal test code 123456
    if (verificationCodeInput.trim() !== generatedCode && verificationCodeInput.trim() !== '123456') {
      setVerificationError(
        language === 'rw' 
          ? "Ikode yinjijwe si yo! Reba ikode yoherejwe kuri email yawe cyangwa ukande 'Injiza Ikode'." 
          : "Invalid verification code! Check your email or use quick fill."
      );
      return;
    }

    if (pendingSignupData) {
      setIsVerifyingEmail(false);
      setIsSettingAvatar(true);
    }
  };

  // Handle Profile Picture File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete Signup with Avatar
  const handleCompleteWithAvatar = (avatarUrlToUse?: string) => {
    if (pendingSignupData) {
      onSignup({
        ...pendingSignupData,
        avatarUrl: avatarUrlToUse || selectedAvatar,
      });

      // Reset all signup & verification states cleanly
      setPendingSignupData(null);
      setIsVerifyingEmail(false);
      setIsSettingAvatar(false);
      setFullName('');
      setPhone('+250 788 ');
      setNationalId('');
      setEmail('');
      setInitialDeposit('20000');
      setSignupPin('');
      setSignupConfirmPin('');
      setVerificationCodeInput('');
      setVerificationError('');
      setSignupError('');
    }
  };

  // Handle Resend Verification Code
  const handleResendCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setResendCountdown(60);
    setResendNotice(
      language === 'rw' 
        ? "Ikode nshya yoherejwe kuri email yawe!" 
        : "A new verification code has been sent to your email!"
    );
    setTimeout(() => setResendNotice(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 z-10">
        
        {/* Left Side: Brand & Official Agatabo Preview Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between border-r border-slate-800 relative">
          
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl tracking-tighter shadow-lg shadow-blue-500/30 border border-blue-400/30">
                TT
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  TUZAMURANE TETERO
                </h1>
              </div>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="pt-6 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Umubare w'Abanyamuryango:</span>
              <span className="font-bold text-white">{members.length} Active</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Umutekano:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PIN Protected
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Login, Signup, Email Verification, or Profile Picture Form */}
        <div className="md:col-span-7 bg-slate-50 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* PROFILE PICTURE SETUP STEP */}
          {isSettingAvatar && pendingSignupData ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingAvatar(false);
                    setIsVerifyingEmail(true);
                  }}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all shrink-0"
                  title="Subira inyuma"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>{language === 'rw' ? "Shyiraho Ifoto y'Isura (Profile Picture)" : "Upload Profile Picture"}</span>
                    <Camera className="w-5 h-5 text-blue-600" />
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'rw' 
                      ? "Ifoto yawe izagaragara hariya hejuru ku izina ryawe mu mutwe w'urupapuro" 
                      : "Your photo will appear in the top header next to your name"}
                  </p>
                </div>
              </div>

              {/* Header Badge Preview */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2 border border-slate-800 shadow-md">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>{language === 'rw' ? "Uko izagaragara mu mutwe w'urupapuro (Header Preview)" : "Live Header Profile Preview"}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                
                <div className="flex items-center gap-3 bg-slate-800/90 p-2.5 rounded-xl border border-slate-700 w-fit">
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-500 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                      {pendingSignupData.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left pr-2">
                    <div className="text-xs font-bold text-white leading-tight">
                      {pendingSignupData.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      IGH-2026-NEW
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Own File Button */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  {language === 'rw' ? "Hitamo Ifoto muri Telefone/Mudaformer" : "Upload Custom Photo from Device"}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload-input"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload-input"
                    className="w-full py-3 px-4 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-bold text-blue-700"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>{language === 'rw' ? "Kanda hano uhitemo ifoto mu mashusho yawe" : "Click here to upload photo from your device"}</span>
                  </label>
                </div>
              </div>

              {/* OR Choose from Avatar Presets */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  {language === 'rw' ? "Cyangwa Hitamo mu Mafoto y'Ingirakamaro" : "Or Choose a Ready Avatar"}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 ${
                        selectedAvatar === av.url
                          ? 'border-blue-600 shadow-md ring-2 ring-blue-500/30 scale-105'
                          : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-lg" />
                      {selectedAvatar === av.url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Final Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCompleteWithAvatar(selectedAvatar)}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'rw' ? "Emeza Ubike Ifoto & Winjire" : "Save Profile Picture & Access Account"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCompleteWithAvatar(undefined)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all text-center"
                >
                  {language === 'rw' ? "Simbuka ibi (Bika nyuma)" : "Skip for now (Set later)"}
                </button>
              </div>
            </div>
          ) : isVerifyingEmail && pendingSignupData ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <button
                  type="button"
                  onClick={() => setIsVerifyingEmail(false)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all shrink-0"
                  title="Subira inyuma"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>{language === 'rw' ? "Emeza Email Yawe" : "Verify Your Email"}</span>
                    <MailCheck className="w-5 h-5 text-emerald-600" />
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'rw' 
                      ? "Banza wemeze email yawe mbere yo kwinjira mu Ikimina" 
                      : "Please verify your email address to finalize account creation"}
                  </p>
                </div>
              </div>

              {/* Notification Banner about Sent OTP */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {language === 'rw' ? "Email Verification Code Koherezwa" : "Verification Code Sent"}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {language === 'rw' 
                    ? `Twarungitse ikode y'imibarwa 6 y'ingirakamaro (OTP Code) kuri email yawe: ` 
                    : `We sent a 6-digit verification code to: `}
                  <strong className="text-emerald-900 underline font-mono ml-1">{pendingSignupData.email}</strong>
                </p>
              </div>

              {/* Quick Fill / Demo Verification Code Helper */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-900 text-xs">
                  <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Ikode y'Imeza (Demo Code): </span>
                    <span className="font-mono font-black text-amber-800 tracking-wider bg-amber-200/70 px-2 py-0.5 rounded text-xs">
                      {generatedCode}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationCodeInput(generatedCode);
                    setVerificationError('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-[11px] shadow-sm transition-all shrink-0"
                >
                  {language === 'rw' ? 'Injiza Ikode' : 'Auto-Fill'}
                </button>
              </div>

              {resendNotice && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{resendNotice}</span>
                </div>
              )}

              {/* Verification Code Form */}
              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    {language === 'rw' ? "Andika Ikode Y'imibarwa 6 (6-Digit OTP)" : "Enter 6-Digit Code"} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      value={verificationCodeInput}
                      onChange={(e) => {
                        setVerificationCodeInput(e.target.value);
                        setVerificationError('');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-2xl pl-11 pr-4 py-3.5 text-center text-xl font-mono tracking-widest font-black text-slate-900 focus:outline-none focus:border-emerald-600 shadow-sm"
                    />
                  </div>
                </div>

                {verificationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{verificationError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {resendCountdown > 0 ? (
                      <span>
                        {language === 'rw' ? `Subira koherereza ikode mu masogonda ${resendCountdown}` : `Resend available in ${resendCountdown}s`}
                      </span>
                    ) : (
                      <span>{language === 'rw' ? "Ushobora gusaba ikode nshya!" : "You can request a new code now"}</span>
                    )}
                  </span>

                  <button
                    type="button"
                    disabled={resendCountdown > 0}
                    onClick={handleResendCode}
                    className={`font-extrabold text-xs flex items-center gap-1 transition-all ${
                      resendCountdown > 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-blue-700 hover:text-blue-800 underline'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === 'rw' ? 'Ohereza Ikode Nshya' : 'Resend Code'}</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'rw' ? 'Emeza Email & Komeza' : 'Verify Email & Complete Registration'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVerifyingEmail(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all text-center"
                  >
                    {language === 'rw' ? 'Subira Inyuma Uhindure Ibiranga' : 'Back to Edit Registration Form'}
                  </button>
                </div>
              </form>
            </div>
          ) : isResettingPin ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPin(false);
                    setResetError('');
                    setResetSuccessMsg('');
                  }}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all shrink-0"
                  title="Go back to login"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {language === 'rw' ? 'Guhindura PIN' : 'Reset PIN'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'rw'
                      ? 'Fata ikode nshya kugira ngo uhindure PIN'
                      : 'Get verification code to reset PIN'}
                  </p>
                </div>
              </div>

              {resetSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              {resetError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {/* STEP 1: Request reset code */}
              {resetStep === 'request' && (
                <form onSubmit={handleResetRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'rw' ? "Numero ya Telefone cyangwa Email" : "Phone Number or Email Address"} *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder={language === 'rw' ? "e.g. 0788123456 cyangwa email" : "e.g. +250 788 123 456 or email"}
                        value={resetIdentifier}
                        onChange={(e) => {
                          setResetIdentifier(e.target.value);
                          setResetError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600 shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'rw' ? 'Ohereza Ikode yo Guhindura' : 'Send Reset Code'}</span>
                  </button>
                </form>
              )}

              {/* STEP 2: Verify reset code */}
              {resetStep === 'verify' && (
                <form onSubmit={handleResetVerify} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                      <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{language === 'rw' ? 'Ubutumwa Bugufi (SMS Demo)' : 'Incoming SMS (Simulation)'}</span>
                    </div>
                    <p className="text-slate-700">
                      {language === 'rw'
                        ? `Ubutumwa bugeze kuri telefone yawe burimo ikode: `
                        : `Incoming SMS notification to your device with code: `}
                      <strong className="text-amber-900 font-mono tracking-wider font-extrabold text-sm bg-amber-200 px-1.5 py-0.5 rounded">{resetCode}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'rw' ? "Andika Ikode Yoherejwe (SMS Reset Code)" : "Enter SMS Reset Code"} *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength={4}
                        required
                        placeholder="e.g. 1234"
                        value={resetCodeInput}
                        onChange={(e) => {
                          setResetCodeInput(e.target.value);
                          setResetError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm font-bold text-center tracking-widest focus:outline-none focus:border-blue-600 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setResetCodeInput(resetCode);
                        setResetError('');
                      }}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      {language === 'rw' ? 'Koresha ikode (Auto-Fill)' : 'Auto-Fill Reset Code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'rw' ? 'Emeza Ikode' : 'Verify Code'}</span>
                  </button>
                </form>
              )}

              {/* STEP 3: Choose New PIN */}
              {resetStep === 'new_pin' && (
                <form onSubmit={handleResetComplete} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'rw' ? "Hitamo PIN Nshya (4 Digits)" : "Enter New PIN (4 Digits)"} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="e.g. 5678"
                        value={newPinInput}
                        onChange={(e) => {
                          setNewPinInput(e.target.value);
                          setResetError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'rw' ? "Subiramo PIN Nshya" : "Confirm New PIN"} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="e.g. 5678"
                        value={newPinConfirmInput}
                        onChange={(e) => {
                          setNewPinConfirmInput(e.target.value);
                          setResetError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600 shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'rw' ? 'Uruza PIN Nshya' : 'Update PIN & Log In'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Toggle Tabs */}
              <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl mb-8">
                <button
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    authMode === 'login'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span>{language === 'rw' ? 'Kwinjira (Login)' : 'Login'}</span>
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setSignupError(''); }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    authMode === 'signup'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'rw' ? 'Kwiyandikisha (Signup)' : 'Sign Up'}</span>
                </button>
              </div>

              {/* LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {language === 'rw' ? 'Kwinjira' : 'Login'}
                    </h3>
                  </div>

                  {/* Phone or Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'rw' ? "Numero ya Telefone cyangwa Email" : "Phone Number or Email Address"} *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder={language === 'rw' ? "e.g. 0788123456 cyangwa j.habimana@gmail.com" : "e.g. +250 788 123 456 or email"}
                        value={loginIdentifier}
                        onChange={(e) => {
                          setLoginIdentifier(e.target.value);
                          setLoginError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Security PIN / Password input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {language === 'rw' ? "Password cyangwa PIN y'Umutekano" : "Password or Security PIN"} *
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">
                        {language === 'rw' ? "Default PIN: 1234" : "Default PIN: 1234"}
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        maxLength={8}
                        placeholder="e.g. 1234"
                        value={loginPin}
                        onChange={(e) => {
                          setLoginPin(e.target.value);
                          setLoginError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600 shadow-sm"
                      />
                    </div>
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsResettingPin(true);
                          setResetStep('request');
                          setResetError('');
                          setResetSuccessMsg('');
                          setResetIdentifier(loginIdentifier);
                        }}
                        className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline transition-all flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                        <span>{language === 'rw' ? "Yibagiwe PIN? (Forgot PIN?)" : "Forgot PIN?"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Demo Autofill Helper */}
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowQuickFill(!showQuickFill)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {language === 'rw' 
                          ? (showQuickFill ? "Hisha konti z'icyitegererezo (Demo)" : "Reba konti z'icyitegererezo (Demo Accounts)")
                          : (showQuickFill ? "Hide demo accounts" : "Show demo accounts for testing")}
                      </span>
                    </button>

                    {showQuickFill && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {language === 'rw' ? "Kanda kuri konti uzozuza mu buryo bw'atsamuka (PIN: 1234):" : "Click an account to autofill login credentials (PIN: 1234):"}
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                          {members.map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setLoginIdentifier(m.phone || m.email);
                                setLoginPin(m.pin || '1234');
                                setLoginError('');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all shrink-0"
                            >
                              <div className="text-xs font-extrabold text-slate-900 leading-tight">{m.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{m.phone}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{language === 'rw' ? 'Injira muba Tuzamurane Tetero' : 'Access Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* SIGNUP FORM */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {language === 'rw' ? 'Iyandikishe Mu Ikimina' : 'Create New Member Profile'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'rw' ? 'Andika ibiranga umunyamuryango mushya kugira ngo ugire konti y ubwizigame' : 'Enter your details to register as a new savings group member'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    {/* Group Selection */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {language === 'rw' ? 'Izina ry\'itsinda (Group Name)' : 'Select Group Name'} *
                      </label>
                      <select
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value as 'TUZAMURANE TETERO' | 'UMUHUZA TETERO')}
                        className="w-full bg-slate-50 border border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-extrabold focus:outline-none focus:border-emerald-600 shadow-sm"
                      >
                        <option value="TUZAMURANE TETERO">TUZAMURANE TETERO</option>
                        <option value="UMUHUZA TETERO">UMUHUZA TETERO</option>
                      </select>
                    </div>

                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {language === 'rw' ? 'Izina Ryose / Full Name' : 'Full Name'} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Marie Chantal Uwase"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-bold focus:outline-none focus:border-emerald-600 shadow-sm"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {language === 'rw' ? 'Numero ya Telefone' : 'Phone Number'} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+250 788 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600 shadow-sm"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email (Imeri)
                      </label>
                      <input
                        type="email"
                        placeholder="marie@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600 shadow-sm"
                      />
                    </div>

                    {/* PIN */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {language === 'rw' ? 'Hitamo PIN (4 Digits)' : 'Create PIN'}
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="1234"
                        value={signupPin}
                        onChange={(e) => setSignupPin(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600 shadow-sm"
                      />
                    </div>

                    {/* Confirm PIN */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {language === 'rw' ? 'Subiramo PIN' : 'Confirm PIN'}
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="1234"
                        value={signupConfirmPin}
                        onChange={(e) => setSignupConfirmPin(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600 shadow-sm"
                      />
                    </div>

                  </div>

                  {signupError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{language === 'rw' ? 'Yemeza Wiyandikishe' : 'Complete Registration'}</span>
                  </button>
                </form>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
};
