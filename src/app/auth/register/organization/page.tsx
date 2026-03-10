'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle, ArrowLeft, FileText, Upload, Check, Edit3 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { OrganizationTermsDialog } from '@/components/OrganizationTermsDialog';
import { isValidEmail, isValidEmailDomain } from '@/lib/validators/email';
import { Altcha } from '@/components/Altcha';
import { ThaiAddressDropdown, type ThaiAddressData } from '@/components/ThaiAddressDropdown';
import { FileUploadZone } from '@/components/FileUploadZone';

export const dynamic = 'force-dynamic';

type RegistrationStep =
  | 'terms'
  | 'email-verify'
  | 'organization-info'
  | 'contact-person'
  | 'service-purposes'
  | 'document-upload'
  | 'summary'
  | 'success';

const STEP_NUMBERS: Record<RegistrationStep, number> = {
  'terms': 1,
  'email-verify': 2,
  'organization-info': 3,
  'contact-person': 4,
  'service-purposes': 5,
  'document-upload': 6,
  'summary': 7,
  'success': 8,
};

export default function OrganizationRegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <OrganizationRegisterFlow />
    </Suspense>
  );
}

function OrganizationRegisterFlow() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('terms');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');

  // Organization data state
  const [organizationData, setOrganizationData] = useState({
    // Organization Info
    organizationType: '',
    organizationName: '',
    taxId: '',
    address: '',
    building: '',
    floor: '',
    village: '',
    soi: '',
    road: '',
    phone: '',
    fax: '',
    website: '',
    // Contact Person
    contactTitle: '',
    contactFirstName: '',
    contactLastName: '',
    contactPosition: '',
    contactEmail: '',
    contactPhone: '',
    contactMobile: '',
    // Service Purposes
    purposes: [] as string[],
    otherPurpose: '',
    // Documents
    documents: {
      orgCertificate: null as File | null,
      authorizedLetter: null as File | null,
      idCard: null as File | null,
      other: null as File | null,
    },
  });

  // Address dropdown data (separate state for API-driven dropdowns)
  const [addressData, setAddressData] = useState<ThaiAddressData>({
    province: '',
    provinceCode: '',
    district: '',
    districtCode: '',
    subdistrict: '',
    subdistrictCode: '',
    postalCode: '',
  });

  const handleTermsAccept = () => {
    setCurrentStep('email-verify');
  };

  const handleTermsCancel = () => {
    router.push('/auth/register');
  };

  const handleEmailVerified = (email: string, token: string) => {
    setVerifiedEmail(email);
    setVerificationToken(token);
    // Update contact email with verified email
    setOrganizationData(prev => ({ ...prev, contactEmail: email }));
    setCurrentStep('organization-info');
  };

  const handleOrganizationInfoNext = () => {
    setCurrentStep('contact-person');
  };

  const handleContactPersonNext = () => {
    setCurrentStep('service-purposes');
  };

  const handleServicePurposesNext = () => {
    setCurrentStep('document-upload');
  };

  const handleDocumentUploadNext = () => {
    setCurrentStep('summary');
  };

  // Map organization type to API enum
  const mapOrgType = (type: string): string => {
    const mapping: Record<string, string> = {
      'government': 'government',
      'state_enterprise': 'state_enterprise',
      'private': 'private_company',
      'foundation': 'foundation',
      'association': 'association',
      'cooperative': 'cooperative',
      'other': 'other',
    };
    return mapping[type] || 'other';
  };

  // State for tracking code after submission
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);

    try {
      // Build the registration data object
      const registrationData = {
        org_type: mapOrgType(organizationData.organizationType),
        org_name_th: organizationData.organizationName,
        org_name_en: '', // Optional
        tax_id: organizationData.taxId.replace(/[^0-9]/g, ''), // Remove formatting
        registration_number: '',

        // Address
        address_line1: [
          organizationData.address,
          organizationData.building && `อาคาร ${organizationData.building}`,
          organizationData.floor && `ชั้น ${organizationData.floor}`,
          organizationData.village && `หมู่บ้าน ${organizationData.village}`,
          organizationData.soi && `ซอย ${organizationData.soi}`,
          organizationData.road && `ถนน ${organizationData.road}`,
        ].filter(Boolean).join(' '),
        address_line2: '',
        province_code: addressData.provinceCode,
        province_name: addressData.province,
        district_code: addressData.districtCode,
        district_name: addressData.district,
        subdistrict_code: addressData.subdistrictCode,
        subdistrict_name: addressData.subdistrict,
        postal_code: addressData.postalCode,

        // Contact Person
        contact_title: organizationData.contactTitle,
        contact_first_name: organizationData.contactFirstName,
        contact_last_name: organizationData.contactLastName,
        contact_position: organizationData.contactPosition,
        contact_email: organizationData.contactEmail,
        contact_phone: organizationData.phone || organizationData.contactPhone,
        contact_mobile: organizationData.contactMobile,

        // Purposes
        purposes: organizationData.purposes,
        purposes_other: organizationData.otherPurpose,
      };

      // Create FormData for file uploads
      const formData = new FormData();

      // Add registration data as JSON string
      formData.append('data', JSON.stringify(registrationData));

      // Add files if they exist
      if (organizationData.documents.orgCertificate) {
        formData.append('org_certificate', organizationData.documents.orgCertificate);
      }
      if (organizationData.documents.authorizedLetter) {
        formData.append('authorized_letter', organizationData.documents.authorizedLetter);
      }
      if (organizationData.documents.idCard) {
        formData.append('id_card', organizationData.documents.idCard);
      }
      if (organizationData.documents.other) {
        formData.append('other_document', organizationData.documents.other);
      }

      // Send FormData to API endpoint
      const response = await fetch('/api/registrations/organization', {
        method: 'POST',
        body: formData, // Don't set Content-Type header - browser sets it automatically with boundary
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save tracking code for success page
      setTrackingCode(data.data?.tracking_code || '');
      setCurrentStep('success');
    } catch (err) {
      console.error('Registration error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleBack = (step: RegistrationStep) => {
    setCurrentStep(step);
  };

  const handleEditStep = (step: RegistrationStep) => {
    setCurrentStep(step);
  };

  if (currentStep === 'terms') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <OrganizationTermsDialog
          open={true}
          onAccept={handleTermsAccept}
          onCancel={handleTermsCancel}
        />
      </div>
    );
  }

  if (currentStep === 'email-verify') {
    return (
      <EmailVerificationStep
        onVerified={handleEmailVerified}
        onBack={handleTermsCancel}
        stepNumber={STEP_NUMBERS['email-verify']}
      />
    );
  }

  if (currentStep === 'organization-info') {
    return (
      <OrganizationInfoStep
        data={organizationData}
        setData={setOrganizationData}
        addressData={addressData}
        setAddressData={setAddressData}
        onNext={handleOrganizationInfoNext}
        onBack={() => handleBack('email-verify')}
        verifiedEmail={verifiedEmail}
        stepNumber={STEP_NUMBERS['organization-info']}
      />
    );
  }

  if (currentStep === 'contact-person') {
    return (
      <ContactPersonStep
        data={organizationData}
        setData={setOrganizationData}
        onNext={handleContactPersonNext}
        onBack={() => handleBack('organization-info')}
        stepNumber={STEP_NUMBERS['contact-person']}
      />
    );
  }

  if (currentStep === 'service-purposes') {
    return (
      <ServicePurposesStep
        data={organizationData}
        setData={setOrganizationData}
        onNext={handleServicePurposesNext}
        onBack={() => handleBack('contact-person')}
        stepNumber={STEP_NUMBERS['service-purposes']}
      />
    );
  }

  if (currentStep === 'document-upload') {
    return (
      <DocumentUploadStep
        data={organizationData}
        setData={setOrganizationData}
        onNext={handleDocumentUploadNext}
        onBack={() => handleBack('service-purposes')}
        stepNumber={STEP_NUMBERS['document-upload']}
      />
    );
  }

  if (currentStep === 'summary') {
    return (
      <SummaryStep
        verifiedEmail={verifiedEmail}
        verificationToken={verificationToken}
        organizationData={organizationData}
        addressData={addressData}
        onEdit={handleEditStep}
        onSubmit={handleSubmit}
        onBack={() => handleBack('document-upload')}
        stepNumber={STEP_NUMBERS['summary']}
      />
    );
  }

  if (currentStep === 'success') {
    return <SuccessStep trackingCode={trackingCode} contactEmail={organizationData.contactEmail} />;
  }

  return null;
}

// Progress Indicator Component
function StepIndicator({ currentStep, totalSteps = 8 }: { currentStep: number; totalSteps?: number }) {
  const { language } = useLanguage();

  const steps = [
    { num: 1, label: t(language, 'auth.orgRegister.steps.terms') },
    { num: 2, label: t(language, 'auth.orgRegister.steps.emailVerify') },
    { num: 3, label: t(language, 'auth.orgRegister.steps.orgInfo') },
    { num: 4, label: t(language, 'auth.orgRegister.steps.contactPerson') },
    { num: 5, label: t(language, 'auth.orgRegister.steps.purposes') },
    { num: 6, label: t(language, 'auth.orgRegister.steps.documents') },
    { num: 7, label: t(language, 'auth.orgRegister.steps.summary') },
    { num: 8, label: t(language, 'auth.orgRegister.steps.complete') },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center px-2">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className={`
              w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0
              ${step.num < currentStep ? 'bg-green-500 text-white' :
                step.num === currentStep ? 'bg-primary-500 text-white' :
                'bg-excise-200 dark:bg-slate-600 text-excise-500 dark:text-slate-400'}
            `}>
              {step.num < currentStep ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : step.num}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-3 sm:w-5 h-1 flex-shrink-0 ${step.num < currentStep ? 'bg-green-500' : 'bg-excise-200 dark:bg-slate-600'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-excise-600 dark:text-slate-400 mt-2">
        {steps[currentStep - 1]?.label}
      </p>
    </div>
  );
}

// Step 2: Email Verification with OTP
function EmailVerificationStep({
  onVerified,
  onBack,
  stepNumber,
}: {
  onVerified: (email: string, token: string) => void;
  onBack: () => void;
  stepNumber: number;
}) {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [flowId, setFlowId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [altchaPayload, setAltchaPayload] = useState<string>('');

  const emailValid = email && isValidEmail(email) && isValidEmailDomain(email);
  const canSendOTP = emailValid && altchaPayload;

  const handleSendOTP = async () => {
    if (!canSendOTP) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, altchaPayload }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'rate_limited') {
          setCountdown(data.remainingSeconds);
          startCountdown(data.remainingSeconds);
          const msg = t(language, 'auth.register.emailVerification.rateLimited').replace('{seconds}', data.remainingSeconds);
          throw new Error(msg);
        }
        if (data.code === 'email_exists') {
          throw new Error(t(language, 'auth.register.errors.emailExists'));
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setFlowId(data.flowId);
      setCountdown(60);
      startCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) return;

    setVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, flowId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'invalid_code' || data.code === 'verification_failed') {
          throw new Error(t(language, 'auth.register.emailVerification.invalidCode'));
        }
        if (data.code === 'code_expired') {
          throw new Error(t(language, 'auth.register.emailVerification.codeExpired'));
        }
        throw new Error(t(language, 'auth.register.emailVerification.invalidCode'));
      }

      onVerified(data.email, data.verificationToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-excise-900 dark:text-white mb-2">
              {t(language, 'auth.register.title')}
            </h1>
            <p className="text-sm sm:text-base text-excise-600 dark:text-slate-400">
              {t(language, 'auth.register.subtitle')}
            </p>
          </div>

          <StepIndicator currentStep={stepNumber} />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {!otpSent ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.register.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input-field pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${emailValid ? 'border-green-500' : ''}`}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                  {emailValid && (
                    <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              {emailValid && (
                <Altcha
                  onVerify={(payload) => setAltchaPayload(payload)}
                  onError={() => setAltchaPayload('')}
                />
              )}

              <button
                onClick={handleSendOTP}
                disabled={!canSendOTP || loading || countdown > 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t(language, 'auth.register.emailVerification.sending') :
                 countdown > 0 ? `${t(language, 'auth.register.emailVerification.resendIn')} ${countdown}s` :
                 t(language, 'auth.register.emailVerification.sendOTP')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">{t(language, 'auth.register.emailVerification.otpSent')}</p>
                <p className="text-green-600 dark:text-green-500">{email}</p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.register.emailVerification.enterOTP')}
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="000000"
                  maxLength={6}
                  disabled={verifying}
                />
                <p className="text-excise-500 dark:text-slate-500 text-xs mt-2">
                  {t(language, 'auth.register.emailVerification.otpExpires')}
                </p>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || verifying}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? t(language, 'auth.register.emailVerification.verifying') : t(language, 'auth.register.emailVerification.verifyOTP')}
              </button>

              <div className="text-center">
                <button
                  onClick={handleSendOTP}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:text-excise-400 dark:disabled:text-slate-500"
                >
                  {countdown > 0 ? `${t(language, 'auth.register.emailVerification.resendIn')} ${countdown}s` : t(language, 'auth.register.emailVerification.resendOTP')}
                </button>
              </div>

              <button
                onClick={() => { setOtpSent(false); setOtp(''); setError(null); }}
                className="w-full text-sm text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200"
              >
                {t(language, 'auth.register.emailVerification.changeEmail')}
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200">
              <ArrowLeft className="w-4 h-4" />
              {t(language, 'auth.register.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Organization data type
interface OrganizationFormData {
  organizationType: string;
  organizationName: string;
  taxId: string;
  address: string;
  building: string;
  floor: string;
  village: string;
  soi: string;
  road: string;
  phone: string;
  fax: string;
  website: string;
  contactTitle: string;
  contactFirstName: string;
  contactLastName: string;
  contactPosition: string;
  contactEmail: string;
  contactPhone: string;
  contactMobile: string;
  purposes: string[];
  otherPurpose: string;
  documents: {
    orgCertificate: File | null;
    authorizedLetter: File | null;
    idCard: File | null;
    other: File | null;
  };
}

// Step 3: Organization Info
function OrganizationInfoStep({
  data,
  setData,
  addressData,
  setAddressData,
  onNext,
  onBack,
  verifiedEmail,
  stepNumber,
}: {
  data: OrganizationFormData;
  setData: React.Dispatch<React.SetStateAction<OrganizationFormData>>;
  addressData: ThaiAddressData;
  setAddressData: React.Dispatch<React.SetStateAction<ThaiAddressData>>;
  onNext: () => void;
  onBack: () => void;
  verifiedEmail: string;
  stepNumber: number;
}) {
  const { language } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const organizationTypes = [
    { value: 'company', label: t(language, 'auth.orgRegister.orgTypes.company') },
    { value: 'partnership', label: t(language, 'auth.orgRegister.orgTypes.partnership') },
    { value: 'government', label: t(language, 'auth.orgRegister.orgTypes.government') },
    { value: 'stateEnterprise', label: t(language, 'auth.orgRegister.orgTypes.stateEnterprise') },
    { value: 'association', label: t(language, 'auth.orgRegister.orgTypes.association') },
    { value: 'other', label: t(language, 'auth.orgRegister.orgTypes.other') },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!data.organizationType) errors.organizationType = t(language, 'auth.orgRegister.errors.required');
    if (!data.organizationName) errors.organizationName = t(language, 'auth.orgRegister.errors.required');
    if (!data.taxId) errors.taxId = t(language, 'auth.orgRegister.errors.required');
    else if (!/^\d{13}$/.test(data.taxId.replace(/[\s-]/g, ''))) {
      errors.taxId = t(language, 'auth.orgRegister.errors.invalidTaxId');
    }
    if (!data.address) errors.address = t(language, 'auth.orgRegister.errors.required');
    if (!addressData.province) errors.province = t(language, 'auth.orgRegister.errors.required');
    if (!addressData.district) errors.district = t(language, 'auth.orgRegister.errors.required');
    if (!addressData.subdistrict) errors.subdistrict = t(language, 'auth.orgRegister.errors.required');
    if (!addressData.postalCode) errors.postalCode = t(language, 'auth.orgRegister.errors.required');
    if (!data.phone) errors.phone = t(language, 'auth.orgRegister.errors.required');

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src="/images/logos/excise-logo-blue.svg"
                alt="Excise Department Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <StepIndicator currentStep={stepNumber} />

          {/* Verified email badge */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">{t(language, 'auth.register.emailVerified')}</p>
              <p className="text-sm text-green-600 dark:text-green-500">{verifiedEmail}</p>
            </div>
          </div>

          {/* DBD Verification Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {t(language, 'auth.orgRegister.dbdNotice.title')}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {t(language, 'auth.orgRegister.dbdNotice.description')}
              </p>
              <a
                href="https://datawarehouse.dbd.go.th/juristic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
              >
                <span>{t(language, 'auth.orgRegister.dbdNotice.link')}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <form className="space-y-4 sm:space-y-5">
            {/* Organization Type & Name - 2 columns on lg+ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Organization Type */}
              <div>
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.orgInfo.organizationType')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="organizationType"
                  value={data.organizationType}
                  onChange={handleChange}
                  className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.organizationType ? 'border-red-500' : ''}`}
                >
                  <option value="">{t(language, 'auth.orgRegister.orgInfo.selectType')}</option>
                  {organizationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {validationErrors.organizationType && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.organizationType}</p>
                )}
              </div>

              {/* Tax ID */}
              <div>
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.orgInfo.taxId')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={data.taxId}
                  onChange={handleChange}
                  className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.taxId ? 'border-red-500' : ''}`}
                  placeholder={t(language, 'auth.orgRegister.orgInfo.taxIdPlaceholder')}
                  maxLength={13}
                />
                {validationErrors.taxId && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.taxId}</p>
                )}
              </div>
            </div>

            {/* Organization Name - Full width */}
            <div>
              <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.orgRegister.orgInfo.organizationName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="organizationName"
                value={data.organizationName}
                onChange={handleChange}
                className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.organizationName ? 'border-red-500' : ''}`}
                placeholder={t(language, 'auth.orgRegister.orgInfo.organizationNamePlaceholder')}
              />
              {validationErrors.organizationName && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.organizationName}</p>
              )}
            </div>

            {/* Address Section */}
            <div className="border-t border-excise-200 dark:border-slate-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-excise-900 dark:text-white mb-4">{t(language, 'auth.orgRegister.orgInfo.addressSection')}</h3>

              {/* Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.orgInfo.address')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={data.address}
                  onChange={handleChange}
                  className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.address ? 'border-red-500' : ''}`}
                  placeholder={t(language, 'auth.orgRegister.orgInfo.addressPlaceholder')}
                />
                {validationErrors.address && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.address}</p>
                )}
              </div>

              {/* Building / Floor / Village / Soi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                    {t(language, 'auth.orgRegister.orgInfo.building')}
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={data.building}
                    onChange={handleChange}
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder={t(language, 'auth.orgRegister.orgInfo.buildingPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                    {t(language, 'auth.orgRegister.orgInfo.floor')}
                  </label>
                  <input
                    type="text"
                    name="floor"
                    value={data.floor}
                    onChange={handleChange}
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder={t(language, 'auth.orgRegister.orgInfo.floorPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                    {t(language, 'auth.orgRegister.orgInfo.village')}
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={data.village}
                    onChange={handleChange}
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                    {t(language, 'auth.orgRegister.orgInfo.soi')}
                  </label>
                  <input
                    type="text"
                    name="soi"
                    value={data.soi}
                    onChange={handleChange}
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Road - Full width */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.orgInfo.road')}
                </label>
                <input
                  type="text"
                  name="road"
                  value={data.road}
                  onChange={handleChange}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* Province / District / Subdistrict / Postal Code - Dropdown from API */}
              <ThaiAddressDropdown
                value={addressData}
                onChange={setAddressData}
                errors={{
                  province: validationErrors.province,
                  district: validationErrors.district,
                  subdistrict: validationErrors.subdistrict,
                  postalCode: validationErrors.postalCode,
                }}
              />
            </div>

            {/* Contact Info Section */}
            <div className="border-t border-excise-200 dark:border-slate-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-excise-900 dark:text-white mb-4">{t(language, 'auth.orgRegister.orgInfo.contactSection')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                    {t(language, 'auth.orgRegister.orgInfo.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={data.phone}
                    onChange={handleChange}
                    className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="02-XXX-XXXX"
                  />
                  {validationErrors.phone && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                    {t(language, 'auth.orgRegister.orgInfo.fax')}
                  </label>
                  <input
                    type="tel"
                    name="fax"
                    value={data.fax}
                    onChange={handleChange}
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="02-XXX-XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.orgInfo.website')}
                </label>
                <input
                  type="url"
                  name="website"
                  value={data.website}
                  onChange={handleChange}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-excise-200 dark:border-slate-700 mt-6">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {t(language, 'auth.orgRegister.back')}
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                {t(language, 'auth.orgRegister.next')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Step 4: Contact Person (เจ้าหน้าที่ผู้รับผิดชอบ)
function ContactPersonStep({
  data,
  setData,
  onNext,
  onBack,
  stepNumber,
}: {
  data: OrganizationFormData;
  setData: React.Dispatch<React.SetStateAction<OrganizationFormData>>;
  onNext: () => void;
  onBack: () => void;
  stepNumber: number;
}) {
  const { language } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const titles = [
    { value: 'mr', label: t(language, 'auth.orgRegister.contactPerson.titles.mr') },
    { value: 'mrs', label: t(language, 'auth.orgRegister.contactPerson.titles.mrs') },
    { value: 'miss', label: t(language, 'auth.orgRegister.contactPerson.titles.miss') },
    { value: 'other', label: t(language, 'auth.orgRegister.contactPerson.titles.other') },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!data.contactTitle) errors.contactTitle = t(language, 'auth.orgRegister.errors.required');
    if (!data.contactFirstName) errors.contactFirstName = t(language, 'auth.orgRegister.errors.required');
    if (!data.contactLastName) errors.contactLastName = t(language, 'auth.orgRegister.errors.required');
    if (!data.contactPosition) errors.contactPosition = t(language, 'auth.orgRegister.errors.required');
    if (!data.contactMobile) errors.contactMobile = t(language, 'auth.orgRegister.errors.required');
    else if (!/^\d{10}$/.test(data.contactMobile.replace(/[\s-]/g, ''))) {
      errors.contactMobile = t(language, 'auth.orgRegister.errors.invalidMobile');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src="/images/logos/excise-logo-blue.svg"
                alt="Excise Department Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <StepIndicator currentStep={stepNumber} />

          <form className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.orgRegister.contactPerson.titleField')} <span className="text-red-500">*</span>
              </label>
              <select
                name="contactTitle"
                value={data.contactTitle}
                onChange={handleChange}
                className={`input-field max-w-[200px] ${validationErrors.contactTitle ? 'border-red-500' : ''}`}
              >
                <option value="">{t(language, 'auth.orgRegister.contactPerson.selectTitle')}</option>
                {titles.map(title => (
                  <option key={title.value} value={title.value}>{title.label}</option>
                ))}
              </select>
              {validationErrors.contactTitle && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.contactTitle}</p>
              )}
            </div>

            {/* First Name / Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.contactPerson.firstName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactFirstName"
                  value={data.contactFirstName}
                  onChange={handleChange}
                  className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.contactFirstName ? 'border-red-500' : ''}`}
                />
                {validationErrors.contactFirstName && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.contactFirstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.contactPerson.lastName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactLastName"
                  value={data.contactLastName}
                  onChange={handleChange}
                  className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.contactLastName ? 'border-red-500' : ''}`}
                />
                {validationErrors.contactLastName && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.contactLastName}</p>
                )}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.orgRegister.contactPerson.position')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPosition"
                value={data.contactPosition}
                onChange={handleChange}
                className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.contactPosition ? 'border-red-500' : ''}`}
                placeholder={t(language, 'auth.orgRegister.contactPerson.positionPlaceholder')}
              />
              {validationErrors.contactPosition && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.contactPosition}</p>
              )}
            </div>

            {/* Email (read-only, verified) */}
            <div>
              <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.orgRegister.contactPerson.email')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  name="contactEmail"
                  value={data.contactEmail}
                  readOnly
                  className="input-field bg-excise-50 dark:bg-slate-600 text-excise-600 dark:text-slate-400"
                />
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>
              <p className="text-xs text-excise-500 dark:text-slate-500 mt-1">{t(language, 'auth.orgRegister.contactPerson.emailVerified')}</p>
            </div>

            {/* Phone / Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.contactPerson.phone')}
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={data.contactPhone}
                  onChange={handleChange}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="02-XXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.contactPerson.mobile')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactMobile"
                  value={data.contactMobile}
                  onChange={handleChange}
                  className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white ${validationErrors.contactMobile ? 'border-red-500' : ''}`}
                  placeholder="08X-XXX-XXXX"
                />
                {validationErrors.contactMobile && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.contactMobile}</p>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-excise-200 dark:border-slate-700 mt-6">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {t(language, 'auth.orgRegister.back')}
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                {t(language, 'auth.orgRegister.next')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Step 5: Service Purposes
function ServicePurposesStep({
  data,
  setData,
  onNext,
  onBack,
  stepNumber,
}: {
  data: OrganizationFormData;
  setData: React.Dispatch<React.SetStateAction<OrganizationFormData>>;
  onNext: () => void;
  onBack: () => void;
  stepNumber: number;
}) {
  const { language } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const purposeOptions = [
    { value: 'tax_calculation', label: t(language, 'auth.orgRegister.purposes.taxCalculation') },
    { value: 'license_check', label: t(language, 'auth.orgRegister.purposes.licenseCheck') },
    { value: 'product_info', label: t(language, 'auth.orgRegister.purposes.productInfo') },
    { value: 'report_submission', label: t(language, 'auth.orgRegister.purposes.reportSubmission') },
    { value: 'data_integration', label: t(language, 'auth.orgRegister.purposes.dataIntegration') },
    { value: 'other', label: t(language, 'auth.orgRegister.purposes.other') },
  ];

  const handlePurposeChange = (value: string) => {
    setData(prev => {
      const purposes = prev.purposes.includes(value)
        ? prev.purposes.filter(p => p !== value)
        : [...prev.purposes, value];
      return { ...prev, purposes };
    });
    if (validationErrors.purposes) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.purposes;
        return newErrors;
      });
    }
  };

  const handleOtherPurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData(prev => ({ ...prev, otherPurpose: e.target.value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (data.purposes.length === 0) {
      errors.purposes = t(language, 'auth.orgRegister.errors.selectPurpose');
    }

    if (data.purposes.includes('other') && !data.otherPurpose.trim()) {
      errors.otherPurpose = t(language, 'auth.orgRegister.errors.specifyOther');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src="/images/logos/excise-logo-blue.svg"
                alt="Excise Department Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <StepIndicator currentStep={stepNumber} />

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-excise-700 mb-4">
                {t(language, 'auth.orgRegister.purposes.selectPurposes')} <span className="text-red-500">*</span>
              </label>

              <div className="space-y-3">
                {purposeOptions.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      data.purposes.includes(option.value)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-excise-200 dark:border-slate-600 hover:border-excise-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={data.purposes.includes(option.value)}
                      onChange={() => handlePurposeChange(option.value)}
                      className="mt-1 rounded border-excise-300 dark:border-slate-600 dark:bg-slate-700"
                    />
                    <span className="text-excise-700 dark:text-slate-300">{option.label}</span>
                  </label>
                ))}
              </div>

              {validationErrors.purposes && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">{validationErrors.purposes}</p>
              )}
            </div>

            {/* Other Purpose Text Area */}
            {data.purposes.includes('other') && (
              <div>
                <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.orgRegister.purposes.specifyOther')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={data.otherPurpose}
                  onChange={handleOtherPurposeChange}
                  className={`input-field min-h-[100px] ${validationErrors.otherPurpose ? 'border-red-500' : ''}`}
                  placeholder={t(language, 'auth.orgRegister.purposes.otherPlaceholder')}
                  rows={4}
                />
                {validationErrors.otherPurpose && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.otherPurpose}</p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-excise-200 dark:border-slate-700 mt-6">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {t(language, 'auth.orgRegister.back')}
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                {t(language, 'auth.orgRegister.next')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Step 6: Document Upload
function DocumentUploadStep({
  data,
  setData,
  onNext,
  onBack,
  stepNumber,
}: {
  data: OrganizationFormData;
  setData: React.Dispatch<React.SetStateAction<OrganizationFormData>>;
  onNext: () => void;
  onBack: () => void;
  stepNumber: number;
}) {
  const { language } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const documentTypes: { key: keyof OrganizationFormData['documents']; label: string; description: string; required: boolean }[] = [
    {
      key: 'orgCertificate',
      label: t(language, 'auth.orgRegister.documents.orgCertificate'),
      description: t(language, 'auth.orgRegister.documents.orgCertificateDesc'),
      required: true
    },
    {
      key: 'authorizedLetter',
      label: t(language, 'auth.orgRegister.documents.authorizedLetter'),
      description: t(language, 'auth.orgRegister.documents.authorizedLetterDesc'),
      required: true
    },
    {
      key: 'idCard',
      label: t(language, 'auth.orgRegister.documents.idCard'),
      description: t(language, 'auth.orgRegister.documents.idCardDesc'),
      required: true
    },
    {
      key: 'other',
      label: t(language, 'auth.orgRegister.documents.other'),
      description: t(language, 'auth.orgRegister.documents.otherDesc'),
      required: false
    },
  ];

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (updated from 1MB)

  const handleFileChange = (key: keyof OrganizationFormData['documents'], file: File | null) => {
    setData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [key]: file,
      },
    }));

    // Clear validation error when file is selected
    if (file && validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    documentTypes.forEach(doc => {
      if (doc.required && !data.documents[doc.key]) {
        errors[doc.key] = t(language, 'auth.orgRegister.errors.documentRequired');
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src="/images/logos/excise-logo-blue.svg"
                alt="Excise Department Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <StepIndicator currentStep={stepNumber} />

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {t(language, 'auth.orgRegister.documents.fileRequirements')}
            </p>
          </div>

          <form className="space-y-6">
            {documentTypes.map(doc => (
              <FileUploadZone
                key={doc.key}
                id={`file-${doc.key}`}
                label={doc.label}
                description={doc.description}
                required={doc.required}
                accept={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
                maxSize={MAX_FILE_SIZE}
                file={data.documents[doc.key]}
                onChange={(file) => handleFileChange(doc.key, file)}
                error={validationErrors[doc.key]}
                showPreview={true}
              />
            ))}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-excise-200 dark:border-slate-700 mt-6">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {t(language, 'auth.orgRegister.back')}
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                {t(language, 'auth.orgRegister.next')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Step 7: Summary
function SummaryStep({
  verifiedEmail,
  verificationToken,
  organizationData,
  addressData,
  onEdit,
  onSubmit,
  onBack,
  stepNumber,
}: {
  verifiedEmail: string;
  verificationToken: string;
  organizationData: OrganizationFormData;
  addressData: ThaiAddressData;
  onEdit: (step: RegistrationStep) => void;
  onSubmit: () => void;
  onBack: () => void;
  stepNumber: number;
}) {
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Get organization type label
  const getOrgTypeLabel = (value: string) => {
    const types: Record<string, string> = {
      company: t(language, 'auth.orgRegister.orgTypes.company'),
      partnership: t(language, 'auth.orgRegister.orgTypes.partnership'),
      government: t(language, 'auth.orgRegister.orgTypes.government'),
      stateEnterprise: t(language, 'auth.orgRegister.orgTypes.stateEnterprise'),
      association: t(language, 'auth.orgRegister.orgTypes.association'),
      other: t(language, 'auth.orgRegister.orgTypes.other'),
    };
    return types[value] || value;
  };

  // Get title label
  const getTitleLabel = (value: string) => {
    const titles: Record<string, string> = {
      mr: t(language, 'auth.orgRegister.contactPerson.titles.mr'),
      mrs: t(language, 'auth.orgRegister.contactPerson.titles.mrs'),
      miss: t(language, 'auth.orgRegister.contactPerson.titles.miss'),
      other: t(language, 'auth.orgRegister.contactPerson.titles.other'),
    };
    return titles[value] || value;
  };

  // Get purpose labels
  const getPurposeLabels = (purposes: string[]) => {
    const purposeMap: Record<string, string> = {
      tax_calculation: t(language, 'auth.orgRegister.purposes.taxCalculation'),
      license_check: t(language, 'auth.orgRegister.purposes.licenseCheck'),
      product_info: t(language, 'auth.orgRegister.purposes.productInfo'),
      report_submission: t(language, 'auth.orgRegister.purposes.reportSubmission'),
      data_integration: t(language, 'auth.orgRegister.purposes.dataIntegration'),
      other: t(language, 'auth.orgRegister.purposes.other'),
    };
    return purposes.map(p => purposeMap[p] || p);
  };

  // Build full address for display
  const fullAddressDisplay = [
    organizationData.address,
    organizationData.building && `${t(language, 'auth.orgRegister.orgInfo.building')} ${organizationData.building}`,
    organizationData.floor && `${t(language, 'auth.orgRegister.orgInfo.floor')} ${organizationData.floor}`,
    organizationData.village && `${t(language, 'auth.orgRegister.orgInfo.village')} ${organizationData.village}`,
    organizationData.soi && `${t(language, 'auth.orgRegister.orgInfo.soi')} ${organizationData.soi}`,
    organizationData.road && `${t(language, 'auth.orgRegister.orgInfo.road')} ${organizationData.road}`,
  ].filter(Boolean).join(' ');

  const locationDisplay = `${addressData.subdistrict}, ${addressData.district}, ${addressData.province} ${addressData.postalCode}`;

  // Get uploaded document names
  const getUploadedDocuments = () => {
    const docs: string[] = [];
    if (organizationData.documents.orgCertificate) docs.push(t(language, 'auth.orgRegister.documents.orgCertificate'));
    if (organizationData.documents.authorizedLetter) docs.push(t(language, 'auth.orgRegister.documents.authorizedLetter'));
    if (organizationData.documents.idCard) docs.push(t(language, 'auth.orgRegister.documents.idCard'));
    if (organizationData.documents.other) docs.push(t(language, 'auth.orgRegister.documents.other'));
    return docs;
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      // TODO: Actually submit registration
      await onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setSubmitting(false);
    }
  };

  const SummarySection = ({
    title,
    onEditClick,
    children,
  }: {
    title: string;
    onEditClick: () => void;
    children: React.ReactNode;
  }) => (
    <div className="border border-excise-200 dark:border-slate-600 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-excise-900 dark:text-white">{title}</h3>
        <button
          onClick={onEditClick}
          disabled={submitting}
          className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50"
        >
          <Edit3 className="w-4 h-4" />
          {t(language, 'common.edit')}
        </button>
      </div>
      {children}
    </div>
  );

  const SummaryRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex justify-between py-1">
      <span className="text-excise-600 dark:text-slate-400 text-sm">{label}</span>
      <span className="text-excise-900 dark:text-white text-sm font-medium text-right max-w-[60%]">{value || '-'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src="/images/logos/excise-logo-blue.svg"
                alt="Excise Department Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <StepIndicator currentStep={stepNumber} />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Verified Email */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">{t(language, 'auth.register.emailVerified')}</p>
              <p className="text-sm text-green-600 dark:text-green-500">{verifiedEmail}</p>
            </div>
          </div>

          {/* Organization Info Section */}
          <SummarySection title={t(language, 'auth.orgRegister.orgInfo.title')} onEditClick={() => onEdit('organization-info')}>
            <SummaryRow label={t(language, 'auth.orgRegister.orgInfo.organizationType')} value={getOrgTypeLabel(organizationData.organizationType)} />
            <SummaryRow label={t(language, 'auth.orgRegister.orgInfo.organizationName')} value={organizationData.organizationName} />
            <SummaryRow label={t(language, 'auth.orgRegister.orgInfo.taxId')} value={organizationData.taxId} />
            <SummaryRow label={t(language, 'auth.orgRegister.orgInfo.addressSection')} value={fullAddressDisplay} />
            <SummaryRow label={t(language, 'auth.orgRegister.summary.location')} value={locationDisplay} />
            <SummaryRow label={t(language, 'auth.orgRegister.orgInfo.phone')} value={organizationData.phone} />
            {organizationData.fax && <SummaryRow label={t(language, 'auth.orgRegister.orgInfo.fax')} value={organizationData.fax} />}
            {organizationData.website && <SummaryRow label={t(language, 'auth.orgRegister.orgInfo.website')} value={organizationData.website} />}
          </SummarySection>

          {/* Contact Person Section */}
          <SummarySection title={t(language, 'auth.orgRegister.contactPerson.title')} onEditClick={() => onEdit('contact-person')}>
            <SummaryRow
              label={t(language, 'auth.orgRegister.summary.fullName')}
              value={`${getTitleLabel(organizationData.contactTitle)} ${organizationData.contactFirstName} ${organizationData.contactLastName}`}
            />
            <SummaryRow label={t(language, 'auth.orgRegister.contactPerson.position')} value={organizationData.contactPosition} />
            <SummaryRow label={t(language, 'auth.orgRegister.contactPerson.email')} value={organizationData.contactEmail} />
            {organizationData.contactPhone && <SummaryRow label={t(language, 'auth.orgRegister.contactPerson.phone')} value={organizationData.contactPhone} />}
            <SummaryRow label={t(language, 'auth.orgRegister.contactPerson.mobile')} value={organizationData.contactMobile.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')} />
          </SummarySection>

          {/* Service Purposes Section */}
          <SummarySection title={t(language, 'auth.orgRegister.purposes.title')} onEditClick={() => onEdit('service-purposes')}>
            <div className="space-y-1">
              {getPurposeLabels(organizationData.purposes).map((purpose, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-excise-900 dark:text-white">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{purpose}</span>
                </div>
              ))}
              {organizationData.otherPurpose && (
                <div className="mt-2 pl-6 text-sm text-excise-600 dark:text-slate-400">
                  {organizationData.otherPurpose}
                </div>
              )}
            </div>
          </SummarySection>

          {/* Documents Section */}
          <SummarySection title={t(language, 'auth.orgRegister.documents.title')} onEditClick={() => onEdit('document-upload')}>
            <div className="space-y-1">
              {getUploadedDocuments().map((doc, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-excise-900 dark:text-white">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </SummarySection>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? t(language, 'auth.orgRegister.submitting') : t(language, 'auth.orgRegister.confirmAndSubmit')}
          </button>

          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <button onClick={onBack} disabled={submitting} className="flex items-center gap-2 text-sm text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200 disabled:opacity-50">
              <ArrowLeft className="w-4 h-4" />
              {t(language, 'auth.orgRegister.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 8: Success Page
function SuccessStep({ trackingCode, contactEmail }: { trackingCode: string; contactEmail: string }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-excise-900 dark:text-white mb-2">
            {t(language, 'auth.orgRegister.success.title')}
          </h1>

          <p className="text-excise-600 dark:text-slate-400 mb-6">
            {t(language, 'auth.orgRegister.success.description')}
          </p>

          <div className="bg-excise-50 dark:bg-slate-700 border border-excise-200 dark:border-slate-600 rounded-lg p-4 mb-6">
            <p className="text-sm text-excise-600 dark:text-slate-400 mb-1">{t(language, 'auth.orgRegister.success.requestNumber')}</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{trackingCode}</p>
              <button
                onClick={handleCopyTrackingCode}
                className="p-1 text-excise-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                title="Copy"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-excise-500 dark:text-slate-500 mt-2">
              {language === 'th' ? 'เก็บรหัสนี้ไว้เพื่อติดตามสถานะคำขอ' : 'Keep this code to track your request status'}
            </p>
          </div>

          {/* Email notification info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6 text-left">
            <div className="flex items-start gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {language === 'th' ? 'การแจ้งเตือนจะถูกส่งไปที่' : 'Notifications will be sent to'}:
                </p>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{contactEmail}</p>
              </div>
            </div>
          </div>

          <div className="text-left space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                1
              </div>
              <p className="text-sm text-excise-600 dark:text-slate-400">{t(language, 'auth.orgRegister.success.step1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                2
              </div>
              <p className="text-sm text-excise-600 dark:text-slate-400">{t(language, 'auth.orgRegister.success.step2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                3
              </div>
              <p className="text-sm text-excise-600 dark:text-slate-400">{t(language, 'auth.orgRegister.success.step3')}</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full btn-primary"
          >
            {t(language, 'auth.orgRegister.success.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
