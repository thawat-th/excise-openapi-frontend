'use client';

import { ReactNode } from 'react';
import { ProgressStepper, RegistrationStep } from './ProgressStepper';

interface RegistrationLayoutProps {
  currentStep: RegistrationStep;
  language?: 'th' | 'en';
  children: ReactNode;
  showProgress?: boolean;
}

export function RegistrationLayout({
  currentStep,
  language = 'th',
  children,
  showProgress = true
}: RegistrationLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Stepper */}
        {showProgress && <ProgressStepper currentStep={currentStep} language={language} />}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
