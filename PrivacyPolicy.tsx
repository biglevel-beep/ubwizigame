import React from 'react';
import { Language } from '../types';
import { Shield, Eye, Lock, FileText, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  language: Language;
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ language, onBack }) => {
  const isRw = language === 'rw';

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {isRw ? "Amategeko n'Ikubiro rya Privacy" : "Privacy Policy & Terms"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {isRw ? "Uburyo turinda amakuru n'umutekano w'abanyamuryango ba Tuzamurane Tetero." : "How we protect and manage member data at Tuzamurane Tetero."}
            </p>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isRw ? "Guma Inyuma" : "Go Back"}</span>
          </button>
        )}
      </div>

      {/* Intro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50/50 border border-blue-100/80 p-4 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {isRw ? "Umutekano wa PIN" : "PIN Security"}
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            {isRw ? "PIN yawe ihindurwa mu buryo bw'ibanga kandi ntabwo igaragara ku bandi cyangwa kuri system." : "Your account access PIN is encrypted and remains strictly confidential and inaccessible to others."}
          </p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100/80 p-4 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {isRw ? "Amakuru Yizewe" : "Confidentiality"}
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            {isRw ? "Nta makuru na mwe y'abanyamuryango asangizwa abantu batabifitiye uburenganzira mu buryo bw'amategeko." : "No member financial or personal records are shared with third parties without authorized consent."}
          </p>
        </div>

        <div className="bg-amber-50/50 border border-amber-100/80 p-4 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {isRw ? "Kwizerwa mu Ikimina" : "Transparency"}
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            {isRw ? "Ubwizigame n'inguzanyo bikurikiranwa mu buryo bwiza bugaragarira abanyamuryango bose." : "Savings ledger, loans, and wallet actions are tracked transparently for direct auditability."}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 text-sm leading-relaxed text-slate-700 font-medium">
        
        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-700 rounded-full" />
            <span>{isRw ? "1. Amakuru Atoranywa n'Uburyo Akoreshwa" : "1. Information Collection & Usage"}</span>
          </h2>
          <p className="pl-3 text-xs">
            {isRw 
              ? "Tuzamurane Tetero yakira gusa amakuru y'ibanze yo gufungura konti arimo: Izina ryawe, Umubare wa telefone, n'Imeri. Aya makuru akoreshwa gusa mu rwego rwo gucunga neza ubwizigame bwawe, kwemeza ibikorwa bya wallet, no kukubikira amateka y'inguzanyo yawe."
              : "Tuzamurane Tetero collects essential account data including: Full Name, Phone Number, and Email Address. This data is exclusively used to manage your savings goals, validate transactions, and record cooperative financial milestones."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-700 rounded-full" />
            <span>{isRw ? "2. Umutekano w'Amafaranga n'Ububiko" : "2. Financial Security & Storage"}</span>
          </h2>
          <p className="pl-3 text-xs">
            {isRw
              ? "Amafaranga yose abikwa mu buryo bwemewe n'amategeko mu isanduku cyangwa kuri konti yemewe y'umuryango. Amakuru yose ya system abikwa mu buryo bwa mudasobwa bwizewe, aho guhindura balances cyangwa amakuru bishobora gukorwa gusa n'umuyobozi wemejwe mu kurengera inyungu z'abanyamuryango bose."
              : "All deposit values are securely processed and accounted for in accordance with cooperative guidelines. Digital records are saved securely inside decentralized databases, and no critical balance modifications can occur without verified administrative authorization."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-700 rounded-full" />
            <span>{isRw ? "3. Amategeko n'Uburenganzira bwawe" : "3. Member Rights & Controls"}</span>
          </h2>
          <p className="pl-3 text-xs">
            {isRw
              ? "Buri munyamuryango afite uburenganzira bwuzuye bwo kureba balance ye igihe cyose, gusaba ko amakuru ye ahindurwa igihe habaye amakosa, no gusaba inguzanyo hashingiwe ku bwizigame bwe. Bitandukanye n'izindi system, ntabwo dusangiza amakuru yanyu n'ibigo by'ubucuruzi cyangwa abandi bashaka gukora pubulisiye."
              : "Every registered member retains the right to inspect their active balances, request record corrections in case of ledger discrepancies, and apply for loan products based on accumulated savings. We do not sell or lease member details to third-party advertisers."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-700 rounded-full" />
            <span>{isRw ? "4. Kuvugurura Amategeko" : "4. Policy Updates"}</span>
          </h2>
          <p className="pl-3 text-xs">
            {isRw
              ? "Tuzamurane Tetero ishobora kuvugurura aya mategeko mu gihe cyose habayeho impinduka mu micungire y'isanduku cyangwa mu mategeko ya Leta agenga ibimina mu Rwanda. Turakuburira binyuze ku butumwa bwa system cyangwa ku itangazo mu muryango igihe habaye impinduka zikomeye."
              : "This policy may undergo standard amendments to remain compliant with changing microfinance regulations in Rwanda. Registered users will be updated of any material changes through in-app circulars or community announcements."}
          </p>
        </section>

      </div>

      {/* Footer stamp */}
      <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400 font-bold">
        {isRw 
          ? "Umutekano n'Inyungu Nyabyo • Tuzamurane Tetero Rwanda © 2026" 
          : "Secure Cooperative Microfinance • Tuzamurane Tetero Rwanda © 2026"}
      </div>

    </div>
  );
};
