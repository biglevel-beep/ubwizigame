import React from 'react';
import { Language } from '../types';
import { 
  Info, 
  BookOpen, 
  CreditCard, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Users, 
  Award, 
  MapPin, 
  Mail, 
  Phone, 
  Lock 
} from 'lucide-react';

interface AboutUsPageProps {
  language: Language;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ language }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-10 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>{language === 'rw' ? 'Ibyerekeye Ubwizigame' : 'About Ubwizigame Financial Services'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {language === 'rw' ? 'Ikimina Cyizewe & Serivisi z’Ubwizigame Mu Rwanda 🇷🇼' : 'Trusted Cooperative & Financial Savings Solution'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {language === 'rw'
              ? 'Ubwizigame ni umuryango w’ubwizigame n’inguzanyo ugamije gushyigikira abanyamuryango kuteza imbere, kwizigamira mu buryo bw’ikoranabuhanga bwa none, no kubona inguzanyo ku inyungu ntoya.'
              : 'Ubwizigame is a modern financial cooperative designed to promote digital group savings, transparent wallet tracking, and affordable micro-credit for empower members across Rwanda.'}
          </p>
        </div>
      </div>

      {/* STATS HIGHLIGHTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-xs">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <div className="text-lg font-black text-slate-900">250+</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {language === 'rw' ? 'Abanyamuryango' : 'Active Members'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-xs">
          <Award className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <div className="text-lg font-black text-slate-900">99.8%</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {language === 'rw' ? 'Umutekano' : 'Security Rate'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-xs">
          <ShieldCheck className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
          <div className="text-lg font-black text-slate-900">RCA Reg.</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {language === 'rw' ? 'Yanditswe Mu Rwanda' : 'Rwanda Certified'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-xs">
          <Lock className="w-6 h-6 text-amber-600 mx-auto mb-1" />
          <div className="text-lg font-black text-slate-900">100%</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {language === 'rw' ? 'Ibanga la Private' : 'Data Privacy'}
          </div>
        </div>
      </div>

      {/* 2 MAIN SECTIONS: GUIDELINES & PAYMENT CHANNELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* OFFICIAL GROUP GUIDELINES */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {language === 'rw' ? 'Amategeko y’Ikimina (Official Guidelines)' : 'Official Group Guidelines'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'rw' ? 'Amabwiriza agenga ubwizigame no gutanga umusanzu' : 'Savings terms, schedules, and deposit rules'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 font-medium">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 block">1. Igihe cy'Ubwizigame (Deposit Schedule)</span>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  Ikimina ribera buri wa mbere w’icyumweru. Umusanzu ugemurwa binyuze kuri MoMo Pay, Banki cyangwa ku isanduku ya Wallet.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 block">2. Inyungu n'Inguzanyo (Savings & Credit)</span>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  Umunyamuryango agejeje ku mezi 3 azigama akaba yujuje amategeko afite uburenganzira bwo gusaba inguzanyo ku inyungu y’3%.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 block">3. Umutekano w'Amafaranga (Financial Security)</span>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  Amafaranga yose abikwa ku konti ya banki ikoreshwa n’ubuyobozi bw’ikimina muri Bank of Kigali (Cooperative Account).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 block">4. Uburenganzira bwa Private (Privacy & 1-on-1 Chat)</span>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  Buri munyamuryango ashobora kuganira mu ibanga n'undi munyamuryango kuri Private Chat itasomwa n'undi muntu.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OFFICIAL PAYMENT CHANNELS */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 border border-blue-800">
            <div className="flex items-center justify-between border-b border-blue-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {language === 'rw' ? 'Konti zo Kwishyuriraho' : 'Official Payment Channels'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'rw' ? 'Injia zizewe zo kugemura umusanzu' : 'Authorized banking and MoMo accounts'}
                  </p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">MTN MoMo Pay Code</div>
                  <div className="font-mono font-black text-amber-300 text-base mt-1">*182*8*1*029381#</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Izina: Ubwizigame Coop</div>
                </div>
                <span className="text-xs font-black bg-amber-400/20 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400/30">
                  MoMo Pay
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">BK Cooperative Account</div>
                  <div className="font-mono font-black text-white text-sm mt-1">00040-06912345-88</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Bank of Kigali - Main Branch</div>
                </div>
                <span className="text-xs font-black bg-blue-400/20 text-blue-300 px-3 py-1.5 rounded-xl border border-blue-400/30">
                  BK Account
                </span>
              </div>
            </div>
          </div>

          {/* ADMIN & SUPPORT CONTACT CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {language === 'rw' ? 'Twandikire / Ubufasha (Support Contact)' : 'Admin & Support Contact'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'rw' ? 'Ukeneye ubufasha ku konti yako cyangwa ibibazo:' : 'Get help with payments or account management:'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-800">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase">Chairman & Leadership</div>
                <div className="flex items-center gap-2 text-slate-900 font-mono">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>+250 788 123 456</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase">Email Support</div>
                <div className="flex items-center gap-2 text-slate-900 font-mono">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>info@ubwizigame.rw</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase">Office Location</div>
                <div className="flex items-center gap-2 text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Kigali City, Nyarugenge District, KN 5 Rd, Tower Floor 3</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
