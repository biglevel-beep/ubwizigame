import React from 'react';
import { Language } from '../types';
import { 
  Info, 
  BookOpen, 
  CreditCard, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Building2, 
  Sparkles,
  MapPin,
  Mail,
  Award
} from 'lucide-react';

interface AboutUsProps {
  language: Language;
}

export const AboutUs: React.FC<AboutUsProps> = ({ language }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-10 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>{language === 'rw' ? 'Abo Turi Bo - Tuzamurane Tetero' : 'About Us - Tuzamurane Tetero Financial Services'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {language === 'rw'
              ? 'Umutekano n’Inyungu Nyabyo muri Tuzamurane Tetero'
              : 'Secure & Transparent Community Financial Growth'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {language === 'rw'
              ? 'Tuzamurane Tetero ni koperative y’ubwizigame n’inguzanyo igamije kuzamura abanyamuryango bayo mu buryo bw’ikoranabuhanga rya kijyambere. Twizerana mu mucyo n’umutekano w’amafaranga yacu.'
              : 'Tuzamurane Tetero is a modern financial cooperative empowering members through digital savings, transparent group accounting, and instant credit options.'}
          </p>
        </div>
      </div>

      {/* 2. GRID CONTAINING GUIDELINES, PAYMENT CHANNELS & SUPPORT CONTACT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (Cols 7): Official Guidelines & Mission */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Official Group Guidelines Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {language === 'rw' ? 'Amategeko y’Ikimina (Official Guidelines)' : 'Official Group Guidelines'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'rw' ? 'Amabwiriza agenga ubwizigame no gutanga umusanzu' : 'Savings terms, schedules, and deposit rules'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-medium">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 block text-sm sm:text-base">1. Igihe cy'Ubwizigame (Deposit Schedule)</span>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Ikimina ribera buri wa mbere w’icyumweru. Umusanzu ugemurwa binyuze kuri MoMo Pay cyangwa Wallet y’ikimina.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 block text-sm sm:text-base">2. Inyungu n'Inguzanyo (Savings & Credit)</span>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Umunyamuryango agejeje ku mezi 3 azigama afite uburenganzira bwo gusaba inguzanyo ku inyungu y’3% n’ingwate y’ubwizigame bwe.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 block text-sm sm:text-base">3. Umutekano w'Amafaranga (Financial Security)</span>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Amafaranga yose abikwa ku konti ya banki ikoreshwa n’ubuyobozi bw’ikimina (Cooperative Account BK) mu mucyo n’umutekano.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{language === 'rw' ? 'Icyerekezo cyacu' : 'Our Values & Mission'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                <span className="text-blue-800 font-extrabold block">🤝 Ubwiyunge n'Umucyo</span>
                <p className="text-slate-600 font-normal">Buri munyamuryango abona ibyakozwe byose ku gihe nyacyo.</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                <span className="text-emerald-800 font-extrabold block">⚡ Ikoranabuhanga</span>
                <p className="text-slate-600 font-normal">Izera Mobile Money na Wallet mu kwishyura no kubikuza.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Cols 5): Official Payment Channels & Admin Contact */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Official Payment Channels Card */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-5 border border-blue-800">
            <div className="flex items-center justify-between border-b border-blue-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {language === 'rw' ? 'Konti zo Kwishyuriraho' : 'Official Payment Channels'}
                  </h3>
                  <p className="text-xs text-slate-300">MoMo Pay & Bank Transfer</p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">MTN MoMo Pay Code</div>
                  <div className="font-mono font-black text-amber-300 text-base mt-0.5">*182*8*1*029381#</div>
                </div>
                <span className="text-[10px] font-black bg-amber-400 text-slate-900 px-2.5 py-1 rounded-lg shrink-0">MoMo Pay</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">BK Cooperative Account</div>
                  <div className="font-mono font-black text-white text-sm mt-0.5">00040-06912345-88</div>
                </div>
                <span className="text-[10px] font-black bg-blue-400 text-slate-900 px-2.5 py-1 rounded-lg shrink-0">Bank of Kigali</span>
              </div>
            </div>
          </div>

          {/* Admin & Support Contact Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'rw' ? 'Twandikire / Ubufasha (Support)' : 'Admin & Support Contact'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'rw' ? 'Ukeneye ubufasha cyangwa ibisobanuro ku ikimina' : 'For urgent balance checks or system support'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 font-mono">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Chairman / Admin</span>
                  <span className="text-slate-900 font-bold text-xs">+250 788 123 456</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 font-mono">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Support</span>
                  <span className="text-slate-900 font-bold text-xs">info@ubwizigame.rw</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 font-mono">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Ibiro / Office</span>
                  <span className="text-slate-900 font-bold text-xs">Kigali, Nyarugenge, KN 4 Ave</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
