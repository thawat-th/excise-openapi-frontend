'use client';

import { Check } from 'lucide-react';

export type RegistrationStep = 'account-type' | 'terms' | 'email-verify' | 'personal-info' | 'address-info' | 'summary';

interface Step {
  id: RegistrationStep;
  labelTh: string;
  labelEn: string;
  order: number;
}

const steps: Step[] = [
  { id: 'account-type', labelTh: 'เลือกประเภท', labelEn: 'Account Type', order: 0 },
  { id: 'terms', labelTh: 'ข้อตกลง', labelEn: 'Terms', order: 1 },
  { id: 'email-verify', labelTh: 'ยืนยันอีเมล', labelEn: 'Verify Email', order: 2 },
  { id: 'personal-info', labelTh: 'ข้อมูลส่วนตัว', labelEn: 'Personal Info', order: 3 },
  { id: 'address-info', labelTh: 'ที่อยู่', labelEn: 'Address', order: 4 },
  { id: 'summary', labelTh: 'ตรวจสอบ', labelEn: 'Review', order: 5 },
];

interface ProgressStepperProps {
  currentStep: RegistrationStep;
  language?: 'th' | 'en';
}

export function ProgressStepper({ currentStep, language = 'th' }: ProgressStepperProps) {
  const currentOrder = steps.find(s => s.id === currentStep)?.order ?? 0;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.order < currentOrder;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.order > currentOrder;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                    ${isCompleted ? 'bg-primary-600 text-white' : ''}
                    ${isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900' : ''}
                    ${isUpcoming ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.order + 1}</span>
                  )}
                </div>
                <div className={`
                  mt-2 text-xs font-medium text-center
                  ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}
                `}>
                  {language === 'th' ? step.labelTh : step.labelEn}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  h-0.5 flex-1 mx-2 transition-all
                  ${step.order < currentOrder ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
