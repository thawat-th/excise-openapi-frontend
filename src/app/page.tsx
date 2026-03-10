'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { HydraConfig, AppConfig } from '@/lib/sdk/config';
import { hydra } from '@/lib/sdk/hydra';
import {
  DollarSign,
  Shield,
  Wallet,
  FileText,
  ArrowRight,
  Building2,
  User,
  ChevronDown,
} from 'lucide-react';

export default function Home() {
  const { language } = useLanguage();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const handleLogin = () => {
    const state = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    // Use cookie instead of sessionStorage (survives redirects)
    // Security: SameSite=Lax (allows top-level navigation), Secure in production
    // max-age=600 (10 minutes) to allow time for login+consent flow
    const isProduction = window.location.protocol === 'https:';
    const secureFlag = isProduction ? '; Secure' : '';
    document.cookie = `oauth_state=${state}; path=/; max-age=600; SameSite=Lax${secureFlag}`;
    const authUrl = hydra.getAuthorizationUrl(
      HydraConfig.CLIENT_ID,
      AppConfig.CALLBACK_URL,
      HydraConfig.SCOPES,
      state,
    );
    window.location.href = authUrl;
  };

  const services = [
    {
      icon: DollarSign,
      titleTh: 'การจัดเก็บภาษีและรายได้',
      titleEn: 'Tax & Revenue Services',
      descTh: 'จัดเก็บภาษี ขึ้นทะเบียน และยื่นแบบ',
      descEn: 'Tax collection, registration, and filing',
    },
    {
      icon: Shield,
      titleTh: 'การปราบปรามและบังคับใช้กฎหมาย',
      titleEn: 'Enforcement & Compliance Services',
      descTh: 'ตรวจสอบและสืบสวนการกระทำผิด',
      descEn: 'Inspection and investigation of violations',
    },
    {
      icon: Wallet,
      titleTh: 'บริหารการคลังและทรัพย์สิน',
      titleEn: 'Finance & Asset Management Services',
      descTh: 'บริหารงบประมาณและทรัพย์สิน',
      descEn: 'Budget and asset management',
    },
    {
      icon: FileText,
      titleTh: 'บริหารองค์กรและกระบวนงาน',
      titleEn: 'Organization & Workflow Services',
      descTh: 'จัดการเอกสารและลายเซ็นดิจิทัล',
      descEn: 'Document management and digital signatures',
    },
  ];

  const faqKeys = [
    'whatIsApiPlatform',
    'howToRegister',
    'pricing',
    'security',
    'support',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16">
            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogin}
                className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t(language, 'common.signIn')}
              </button>
              <Link
                href="/auth/register"
                className="px-5 py-2 text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {language === 'th' ? 'สมัครใช้งาน' : 'Register'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[min(1200px,80vw)] opacity-80 z-0">
          <div className="w-full h-full bg-[url('/Identity3.svg')] bg-right bg-no-repeat bg-contain" aria-hidden="true"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6 animate-fade-in-up">
            {language === 'th' ? 'แพลตฟอร์ม API ภาครัฐ' : 'Government API Platform'}
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up animation-delay-200">
            <span className="text-brand-700 dark:text-brand-400">
              {language === 'th' ? 'เชื่อมต่อระบบ' : 'Connect to'}
            </span>
            <br />
            <span className="text-slate-900 dark:text-white">
              {language === 'th' ? 'กรมสรรพสามิต' : 'Excise Department'}
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-400">
            {language === 'th'
              ? 'แพลตฟอร์ม API มาตรฐานสำหรับนักพัฒนาและหน่วยงาน เชื่อมต่อบริการภาษี ใบอนุญาต แสตมป์ และข้อมูลสรรพสามิต'
              : 'Standard API platform for developers and organizations to connect with tax, license, stamp, and excise data services'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:scale-105"
            >
              {language === 'th' ? 'เริ่มต้นใช้งาน' : 'Get Started'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 border border-brand-700 dark:border-brand-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              {t(language, 'common.signIn')}
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {language === 'th' ? 'บริการที่เปิดให้เชื่อมต่อ' : 'Available API Services'}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {language === 'th' ? 'เชื่อมต่อกับระบบต่างๆ ของกรมสรรพสามิตได้อย่างปลอดภัย' : 'Securely connect with Excise Department systems'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="relative p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 text-center group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <service.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                    {language === 'th' ? service.titleTh : service.titleEn}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {language === 'th' ? service.descTh : service.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-brand-700 dark:bg-brand-700 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === 'th' ? 'เริ่มต้นใช้งาน' : 'Get Started'}
              </h2>
              <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto">
                {language === 'th'
                  ? 'เลือกประเภทบัญชีที่เหมาะกับคุณ และเริ่มเชื่อมต่อกับระบบกรมสรรพสามิต'
                  : 'Choose your account type and start connecting with Excise Department systems'}
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link
                  href="/getting-started?type=individual"
                  className="relative flex items-center gap-5 p-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl transition-all duration-300 text-left group hover:scale-105 border border-white/20 animate-fade-in-up animation-delay-200"
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl mb-2">
                      {language === 'th' ? 'บุคคลทั่วไป' : 'Individual'}
                    </h4>
                    <p className="text-sm text-blue-100">
                      {language === 'th' ? 'นักพัฒนา ผู้ประกอบการรายย่อย' : 'Developers, small businesses'}
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 ml-auto group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link
                  href="/getting-started?type=organization"
                  className="relative flex items-center gap-5 p-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl transition-all duration-300 text-left group hover:scale-105 border border-white/20 animate-fade-in-up animation-delay-400"
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl mb-2">
                      {language === 'th' ? 'หน่วยงาน/องค์กร' : 'Organization'}
                    </h4>
                    <p className="text-sm text-blue-100">
                      {language === 'th' ? 'ภาครัฐ เอกชน ที่ต้องเชื่อมต่อระบบ' : 'Government, enterprises'}
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 ml-auto group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {t(language, 'faq.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {t(language, 'faq.subtitle')}
            </p>
          </div>
          <div className="space-y-3">
            {faqKeys.map((key, index) => (
              <div
                key={key}
                className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-slate-950"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors"
                >
                  <span className="text-base font-semibold text-slate-900 dark:text-white pr-8">
                    {t(language, `faq.questions.${key}.question`)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                >
                  <div className="px-5 pb-5 pt-0">
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                      {t(language, `faq.questions.${key}.answer`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
