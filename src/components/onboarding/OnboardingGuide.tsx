'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  User,
  Building2,
  FileText,
  Key,
  Layers,
  Rocket,
  Shield,
  UserCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
  status: 'completed' | 'current' | 'upcoming';
  details?: string[];
  estimatedTime?: string;
  action?: {
    label: string;
    href: string;
  };
}

interface OnboardingGuideProps {
  type: 'individual' | 'organization';
  steps: OnboardingStep[];
  title?: string;
  subtitle?: string;
}

export function OnboardingGuide({ type, steps, title, subtitle }: OnboardingGuideProps) {
  const TypeIcon = type === 'organization' ? Building2 : User;
  const accentColor = type === 'organization' ? 'purple' : 'blue';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className={cn(
          'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6',
          accentColor === 'purple' ? 'bg-purple-100' : 'bg-blue-100'
        )}>
          <TypeIcon className={cn(
            'w-8 h-8',
            accentColor === 'purple' ? 'text-purple-600' : 'text-blue-600'
          )} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {title || 'แนะนำบริการ Excise OpenAPI'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle || (type === 'organization'
            ? 'คู่มือการเริ่มต้นใช้งานสำหรับหน่วยงาน/องค์กร'
            : 'คู่มือการเริ่มต้นใช้งานสำหรับบุคคลทั่วไป'
          )}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">ความคืบหน้า</span>
          <span className="text-sm text-gray-500">
            {steps.filter(s => s.status === 'completed').length} / {steps.length} ขั้นตอน
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              accentColor === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
            )}
            style={{
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'relative pl-20',
                step.status === 'upcoming' && 'opacity-60'
              )}
            >
              {/* Step Number Circle */}
              <div className={cn(
                'absolute left-0 w-16 h-16 rounded-2xl flex items-center justify-center z-10',
                step.status === 'completed' && (accentColor === 'purple' ? 'bg-purple-500' : 'bg-blue-500'),
                step.status === 'current' && (accentColor === 'purple' ? 'bg-purple-100 border-2 border-purple-500' : 'bg-blue-100 border-2 border-blue-500'),
                step.status === 'upcoming' && 'bg-gray-100 border-2 border-gray-300'
              )}>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-7 h-7 text-white" />
                ) : (
                  <span className={cn(
                    'text-xl font-bold',
                    step.status === 'current' && (accentColor === 'purple' ? 'text-purple-600' : 'text-blue-600'),
                    step.status === 'upcoming' && 'text-gray-400'
                  )}>
                    {step.number}
                  </span>
                )}
              </div>

              {/* Step Content Card */}
              <div className={cn(
                'rounded-2xl border-2 transition-all duration-300',
                step.status === 'completed' && 'bg-white border-gray-200',
                step.status === 'current' && (accentColor === 'purple'
                  ? 'bg-purple-50 border-purple-300 shadow-lg shadow-purple-100'
                  : 'bg-blue-50 border-blue-300 shadow-lg shadow-blue-100'),
                step.status === 'upcoming' && 'bg-gray-50 border-gray-200'
              )}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-xl',
                        step.status === 'completed' && 'bg-gray-100 text-gray-600',
                        step.status === 'current' && (accentColor === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'),
                        step.status === 'upcoming' && 'bg-gray-100 text-gray-400'
                      )}>
                        {step.icon}
                      </div>
                      <div>
                        <h3 className={cn(
                          'text-lg font-semibold',
                          step.status === 'upcoming' ? 'text-gray-500' : 'text-gray-900'
                        )}>
                          {step.title}
                        </h3>
                        {step.estimatedTime && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{step.estimatedTime}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {step.status === 'completed' && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                        เสร็จสิ้น
                      </span>
                    )}
                    {step.status === 'current' && (
                      <span className={cn(
                        'flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full',
                        accentColor === 'purple' ? 'bg-purple-200 text-purple-700' : 'bg-blue-200 text-blue-700'
                      )}>
                        <Circle className="w-4 h-4" />
                        กำลังดำเนินการ
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className={cn(
                    'mb-4',
                    step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {step.description}
                  </p>

                  {/* Details */}
                  {step.details && step.details.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className={cn(
                            'w-4 h-4 mt-0.5 flex-shrink-0',
                            step.status === 'upcoming' ? 'text-gray-300' : 'text-gray-400'
                          )} />
                          <span className={cn(
                            'text-sm',
                            step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-600'
                          )}>
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action Button */}
                  {step.action && step.status !== 'upcoming' && (
                    <Link
                      href={step.action.href}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        step.status === 'completed'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : accentColor === 'purple'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {step.action.label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Message */}
      {steps.every(s => s.status === 'completed') && (
        <div className={cn(
          'mt-12 p-8 rounded-2xl text-center',
          accentColor === 'purple' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'
        )}>
          <div className={cn(
            'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
            accentColor === 'purple' ? 'bg-purple-100' : 'bg-blue-100'
          )}>
            <Rocket className={cn(
              'w-8 h-8',
              accentColor === 'purple' ? 'text-purple-600' : 'text-blue-600'
            )} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ยินดีด้วย! คุณพร้อมใช้งานแล้ว
          </h3>
          <p className="text-gray-600 mb-6">
            คุณได้ดำเนินการครบทุกขั้นตอนแล้ว สามารถเริ่มใช้งาน API ได้ทันที
          </p>
          <Link
            href={type === 'organization' ? '/organization/catalog' : '/individual/catalog'}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-colors',
              accentColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            เริ่มใช้งาน API
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}

// Pre-configured steps for Individual users
export const individualOnboardingSteps: OnboardingStep[] = [
  {
    id: 'register',
    number: 1,
    title: 'สมัครสมาชิก',
    description: 'ลงทะเบียนด้วยอีเมลและยืนยันตัวตนผ่าน OTP เพื่อเริ่มต้นใช้งาน',
    icon: <User className="w-5 h-5" />,
    status: 'completed',
    details: [
      'กรอกข้อมูลส่วนตัว (ชื่อ, อีเมล)',
      'ยืนยันอีเมลด้วยรหัส OTP',
      'ตั้งรหัสผ่าน',
    ],
    estimatedTime: '5 นาที',
    action: {
      label: 'ดูข้อมูลบัญชี',
      href: '/individual/profile',
    },
  },
  {
    id: 'explore-catalog',
    number: 2,
    title: 'สำรวจ API Catalog',
    description: 'ค้นหาและเรียนรู้เกี่ยวกับ API ที่มีให้บริการ',
    icon: <Layers className="w-5 h-5" />,
    status: 'current',
    details: [
      'ดูรายการ API ทั้งหมดที่เปิดให้บริการ',
      'อ่านรายละเอียดและเอกสารประกอบ',
      'ศึกษาตัวอย่างการใช้งาน',
    ],
    estimatedTime: '10-15 นาที',
    action: {
      label: 'ไปยัง API Catalog',
      href: '/individual/catalog',
    },
  },
  {
    id: 'subscribe-api',
    number: 3,
    title: 'สมัครใช้งาน API',
    description: 'เลือก API ที่ต้องการและส่งคำขอสมัครใช้งาน',
    icon: <FileText className="w-5 h-5" />,
    status: 'upcoming',
    details: [
      'เลือก API ที่ต้องการจาก Catalog',
      'กรอกข้อมูลวัตถุประสงค์การใช้งาน',
      'ยอมรับเงื่อนไขการใช้บริการ',
      'ส่งคำขอเพื่อรอการอนุมัติ',
    ],
    estimatedTime: '5 นาที',
    action: {
      label: 'เลือก API',
      href: '/individual/catalog',
    },
  },
  {
    id: 'get-credentials',
    number: 4,
    title: 'รับ API Credentials',
    description: 'หลังจากได้รับการอนุมัติ คุณจะได้รับ API Key สำหรับเรียกใช้งาน',
    icon: <Key className="w-5 h-5" />,
    status: 'upcoming',
    details: [
      'รอการพิจารณาจากเจ้าหน้าที่ (1-3 วันทำการ)',
      'รับ API Key ผ่านอีเมลและระบบ',
      'เก็บรักษา API Key อย่างปลอดภัย',
    ],
    estimatedTime: '1-3 วันทำการ',
    action: {
      label: 'จัดการ Credentials',
      href: '/individual/credentials',
    },
  },
  {
    id: 'start-using',
    number: 5,
    title: 'เริ่มต้นใช้งาน',
    description: 'เริ่มเรียกใช้ API และติดตามการใช้งานของคุณ',
    icon: <Rocket className="w-5 h-5" />,
    status: 'upcoming',
    details: [
      'ทดสอบการเรียก API ด้วย API Key',
      'ติดตามสถิติการใช้งาน',
      'ตรวจสอบ Rate Limit และ Quota',
    ],
    estimatedTime: 'ตลอดการใช้งาน',
    action: {
      label: 'ดูการใช้งาน',
      href: '/individual/usage',
    },
  },
];

// Pre-configured steps for Organization users
export const organizationOnboardingSteps: OnboardingStep[] = [
  {
    id: 'register',
    number: 1,
    title: 'ลงทะเบียนหน่วยงาน',
    description: 'ส่งคำขอลงทะเบียนหน่วยงานพร้อมเอกสารประกอบ',
    icon: <Building2 className="w-5 h-5" />,
    status: 'completed',
    details: [
      'กรอกข้อมูลหน่วยงาน (ชื่อ, เลขทะเบียนนิติบุคคล)',
      'อัปโหลดเอกสารยืนยัน',
      'ระบุข้อมูลผู้ติดต่อ',
    ],
    estimatedTime: '15-20 นาที',
    action: {
      label: 'ดูข้อมูลหน่วยงาน',
      href: '/organization/settings',
    },
  },
  {
    id: 'verification',
    number: 2,
    title: 'รอการตรวจสอบ',
    description: 'เจ้าหน้าที่จะตรวจสอบข้อมูลและเอกสารของหน่วยงาน',
    icon: <UserCheck className="w-5 h-5" />,
    status: 'current',
    details: [
      'เจ้าหน้าที่ตรวจสอบเอกสาร',
      'ยืนยันความถูกต้องของข้อมูลนิติบุคคล',
      'แจ้งผลการพิจารณาทางอีเมล',
    ],
    estimatedTime: '3-5 วันทำการ',
    action: {
      label: 'ตรวจสอบสถานะ',
      href: '/organization/requests',
    },
  },
  {
    id: 'setup-team',
    number: 3,
    title: 'ตั้งค่าทีมงาน',
    description: 'เพิ่มสมาชิกในทีมและกำหนดสิทธิ์การเข้าถึง',
    icon: <Shield className="w-5 h-5" />,
    status: 'upcoming',
    details: [
      'เชิญสมาชิกเข้าร่วมหน่วยงาน',
      'กำหนดบทบาท (Admin, Developer, Viewer)',
      'ตั้งค่าสิทธิ์การเข้าถึง API',
    ],
    estimatedTime: '10 นาที',
    action: {
      label: 'จัดการทีม',
      href: '/organization/team',
    },
  },
  {
    id: 'explore-subscribe',
    number: 4,
    title: 'สมัครใช้งาน API',
    description: 'สำรวจ API Catalog และสมัครใช้งาน API ที่ต้องการ',
    icon: <Layers className="w-5 h-5" />,
    status: 'upcoming',
    details: [
      'เลือก API จาก Catalog',
      'กรอกข้อมูลการใช้งานสำหรับหน่วยงาน',
      'เลือกแผนการใช้งานที่เหมาะสม',
      'ส่งคำขอเพื่อรอการอนุมัติ',
    ],
    estimatedTime: '10-15 นาที',
    action: {
      label: 'ไปยัง API Catalog',
      href: '/organization/catalog',
    },
  },
  {
    id: 'get-credentials',
    number: 5,
    title: 'รับ API Credentials',
    description: 'สร้างและจัดการ API Keys สำหรับแอปพลิเคชันของหน่วยงาน',
    icon: <Key className="w-5 h-5" />,
    status: 'upcoming',
    details: [
      'สร้าง API Key สำหรับแต่ละแอปพลิเคชัน',
      'ตั้งค่า IP Whitelist (ถ้าต้องการ)',
      'กำหนด Scope การเข้าถึง',
    ],
    estimatedTime: '5-10 นาที',
    action: {
      label: 'จัดการ Credentials',
      href: '/organization/credentials',
    },
  },
  {
    id: 'start-using',
    number: 6,
    title: 'เริ่มต้นใช้งาน',
    description: 'เริ่ม Integrate API เข้ากับระบบของหน่วยงานและติดตามการใช้งาน',
    icon: <Rocket className="w-5 h-5" />,
    status: 'upcoming',
    details: [
      'ทดสอบ API ในสภาพแวดล้อม Sandbox',
      'Integrate กับระบบ Production',
      'ติดตามการใช้งานและประสิทธิภาพ',
    ],
    estimatedTime: 'ตลอดการใช้งาน',
    action: {
      label: 'ดูการใช้งาน',
      href: '/organization/usage',
    },
  },
];
