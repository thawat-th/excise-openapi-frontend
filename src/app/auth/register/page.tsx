'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, CheckCircle, ArrowLeft, User, MapPin, FileText, Edit3 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { TermsDialog } from '@/components/TermsDialog';
import { validateThaiCitizenId } from '@/lib/validators/citizenId';
import { validatePassword, isPasswordValid } from '@/lib/validators/password';
import { isValidEmail, isValidEmailDomain } from '@/lib/validators/email';
import { validateUsername, normalizeUsername, getUsernameRules } from '@/lib/validators/username';
import { Altcha } from '@/components/Altcha';
import { AccountTypeSelect, type AccountType } from '@/components/auth';
import { ThaiAddressDropdown, type ThaiAddressData } from '@/components/ThaiAddressDropdown';
import { OccupationDropdown, type OccupationData } from '@/components/OccupationDropdown';
import { ProgressStepper } from '@/components/auth/ProgressStepper';

export const dynamic = 'force-dynamic';

type RegistrationStep = 'account-type' | 'terms' | 'email-verify' | 'personal-info' | 'address-info' | 'summary';

// Shared form data type
interface PersonalFormData {
  username?: string; // NEW: Optional username field
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  citizenId: string;
  mobile: string;
  birthdate: string;
}

interface AddressFormData {
  address: string;
  building: string;
  floor: string;
  village: string;
  soi: string;
  road: string;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterFlow />
    </Suspense>
  );
}

function RegisterFlow() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('account-type');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');

  // Initial loading effect
  useEffect(() => {
    // Short delay to show loading state for consistency with login page
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Shared form state across steps
  const [personalData, setPersonalData] = useState<PersonalFormData>({
    username: '', // NEW
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    citizenId: '',
    mobile: '',
    birthdate: '',
  });

  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    address: '',
    building: '',
    floor: '',
    village: '',
    soi: '',
    road: '',
  });

  const [occupationData, setOccupationData] = useState<OccupationData>({
    code: '',
    name: '',
    isOther: false,
    otherText: '',
  });

  const [addressData, setAddressData] = useState<ThaiAddressData>({
    province: '',
    provinceCode: '',
    district: '',
    districtCode: '',
    subdistrict: '',
    subdistrictCode: '',
    postalCode: '',
  });

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    if (type === 'organization') {
      router.push('/auth/register/organization');
    } else {
      setCurrentStep('terms');
    }
  };

  const handleTermsAccept = () => {
    setCurrentStep('email-verify');
  };

  const handleTermsCancel = () => {
    router.push('/auth/login');
  };

  const handleBackToAccountType = () => {
    router.push('/auth/login'); // Changed: Go back to login instead of account-type
  };

  const handleEmailVerified = (email: string, token: string) => {
    setVerifiedEmail(email);
    setVerificationToken(token);
    setCurrentStep('personal-info');
  };

  const handlePersonalInfoNext = () => {
    setCurrentStep('address-info');
  };

  const handleAddressInfoNext = () => {
    setCurrentStep('summary');
  };

  const handleBackToPersonalInfo = () => {
    setCurrentStep('personal-info');
  };

  const handleBackToAddressInfo = () => {
    setCurrentStep('address-info');
  };

  const handleBackToEmail = () => {
    setCurrentStep('email-verify');
  };

  const handleEditStep = (step: RegistrationStep) => {
    setCurrentStep(step);
  };

  // Show loading state for consistency with login page
  if (loading) {
    return <RegisterFallback />;
  }

  if (currentStep === 'account-type') {
    return (
      <AccountTypeSelect
        onSelect={handleAccountTypeSelect}
        onBack={handleTermsCancel}
      />
    );
  }

  if (currentStep === 'terms') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Progress Stepper */}
          <ProgressStepper currentStep={currentStep} language={language} />

          {/* Terms Dialog */}
          <TermsDialog
            open={true}
            onAccept={handleTermsAccept}
            onCancel={handleBackToAccountType}
            accountType="individual"
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'email-verify') {
    return <EmailVerificationStep onVerified={handleEmailVerified} onBack={handleBackToAccountType} />;
  }

  if (currentStep === 'personal-info') {
    return (
      <PersonalInfoStep
        verifiedEmail={verifiedEmail}
        data={personalData}
        setData={setPersonalData}
        onNext={handlePersonalInfoNext}
        onBack={handleBackToEmail}
      />
    );
  }

  if (currentStep === 'address-info') {
    return (
      <AddressInfoStep
        verifiedEmail={verifiedEmail}
        addressFormData={addressFormData}
        setAddressFormData={setAddressFormData}
        addressData={addressData}
        setAddressData={setAddressData}
        occupationData={occupationData}
        setOccupationData={setOccupationData}
        onNext={handleAddressInfoNext}
        onBack={handleBackToPersonalInfo}
      />
    );
  }

  return (
    <SummaryStep
      verifiedEmail={verifiedEmail}
      verificationToken={verificationToken}
      personalData={personalData}
      addressFormData={addressFormData}
      addressData={addressData}
      occupationData={occupationData}
      onEdit={handleEditStep}
      onBack={handleBackToAddressInfo}
    />
  );
}

// Step 2: Email Verification with OTP
function EmailVerificationStep({
  onVerified,
  onBack,
}: {
  onVerified: (email: string, token: string) => void;
  onBack: () => void;
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
  const [expiresIn, setExpiresIn] = useState(0);
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
      setExpiresIn(data.expiresIn);
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

          {/* Progress indicator - 4 steps now */}
          <ProgressIndicator currentStep={2} totalSteps={5} />

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
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-500 pointer-events-none" />
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
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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

// Step 3: Personal Info
function PersonalInfoStep({
  verifiedEmail,
  data,
  setData,
  onNext,
  onBack,
}: {
  verifiedEmail: string;
  data: PersonalFormData;
  setData: React.Dispatch<React.SetStateAction<PersonalFormData>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const { language } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordChecks, setPasswordChecks] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasDigit: false,
    hasSpecialChar: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [citizenIdChecking, setCitizenIdChecking] = useState(false);
  const [citizenIdExists, setCitizenIdExists] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);

  // Check citizen ID duplicate when 13 digits entered
  useEffect(() => {
    const checkCitizenId = async () => {
      const cleanedId = data.citizenId.replace(/\D/g, '');
      if (cleanedId.length !== 13) {
        setCitizenIdExists(false);
        return;
      }

      setCitizenIdChecking(true);
      try {
        const response = await fetch('/api/auth/check-citizen-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ citizenId: cleanedId }),
        });
        const result = await response.json();
        setCitizenIdExists(result.exists === true);
        if (result.exists) {
          setValidationErrors((prev) => ({
            ...prev,
            citizenId: language === 'th' ? result.message : result.messageEn,
          }));
        }
      } catch (err) {
        console.error('Failed to check citizen ID:', err);
      } finally {
        setCitizenIdChecking(false);
      }
    };

    const timer = setTimeout(checkCitizenId, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [data.citizenId, language]);

  // Check username duplicate when username entered
  useEffect(() => {
    const checkUsername = async () => {
      const username = data.username?.trim();
      if (!username || username.length < 3) {
        setUsernameExists(false);
        return;
      }

      // Validate format first
      const validation = validateUsername(username);
      if (!validation.valid) {
        setUsernameExists(false);
        return;
      }

      setUsernameChecking(true);
      try {
        const response = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: normalizeUsername(username) }),
        });
        const result = await response.json();
        setUsernameExists(result.exists === true);
        if (result.exists) {
          setValidationErrors((prev) => ({
            ...prev,
            username: language === 'th' ? result.message : result.messageEn,
          }));
        }
      } catch (err) {
        console.error('Failed to check username:', err);
      } finally {
        setUsernameChecking(false);
      }
    };

    const timer = setTimeout(checkUsername, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [data.username, language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordChecks(validatePassword(value));
    }

    if (name === 'citizenId') {
      setCitizenIdExists(false);
    }

    if (name === 'username') {
      setUsernameExists(false);
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation (optional field)
    if (data.username && data.username.trim()) {
      const usernameValidation = validateUsername(data.username);
      if (!usernameValidation.valid) {
        errors.username = language === 'th' ? (usernameValidation.error || '') : (usernameValidation.errorEn || '');
      } else if (usernameExists) {
        errors.username = t(language, 'auth.register.errors.usernameExists');
      }
    }

    if (!data.password) errors.password = t(language, 'auth.register.errors.passwordRequired');
    else if (!isPasswordValid(data.password)) {
      errors.password = t(language, 'auth.register.errors.passwordInvalid');
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = t(language, 'auth.register.errors.confirmPasswordRequired');
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = t(language, 'auth.register.errors.passwordMismatch');
    }

    if (!data.firstName) errors.firstName = t(language, 'auth.register.errors.firstNameRequired');
    if (!data.lastName) errors.lastName = t(language, 'auth.register.errors.lastNameRequired');

    if (!data.citizenId) {
      errors.citizenId = t(language, 'auth.register.errors.citizenIdRequired');
    } else if (citizenIdExists) {
      errors.citizenId = language === 'th'
        ? 'เลขประจำตัวประชาชนนี้ถูกใช้ลงทะเบียนแล้ว'
        : 'This citizen ID is already registered.';
    } else {
      const citizenIdValidation = validateThaiCitizenId(data.citizenId);
      if (!citizenIdValidation.valid) {
        errors.citizenId = citizenIdValidation.error || t(language, 'auth.register.errors.citizenIdInvalid');
      }
    }

    if (!data.mobile) errors.mobile = t(language, 'auth.register.errors.mobileRequired');
    else if (!/^\d{10}$/.test(data.mobile.replace(/[\s-]/g, ''))) {
      errors.mobile = t(language, 'auth.register.errors.mobileInvalid');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (citizenIdChecking || usernameChecking) return; // Don't proceed while checking
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-excise-900 dark:text-white mb-2">
              {t(language, 'auth.register.personalInfo.title')}
            </h1>
            <p className="text-sm sm:text-base text-excise-600 dark:text-slate-400">
              {t(language, 'auth.register.personalInfo.subtitle')}
            </p>
          </div>

          {/* Progress indicator */}
          <ProgressIndicator currentStep={3} totalSteps={5} />

          {/* Verified email badge */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">{t(language, 'auth.register.emailVerified')}</p>
              <p className="text-sm text-green-600 dark:text-green-500">{verifiedEmail}</p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {/* First Name / Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.register.firstName')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={data.firstName}
                  onChange={handleInputChange}
                  className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${validationErrors.firstName ? 'border-red-500' : ''}`}
                  placeholder={t(language, 'auth.register.firstName')}
                />
                {validationErrors.firstName && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.register.lastName')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={data.lastName}
                  onChange={handleInputChange}
                  className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${validationErrors.lastName ? 'border-red-500' : ''}`}
                  placeholder={t(language, 'auth.register.lastName')}
                />
                {validationErrors.lastName && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Citizen ID */}
            <div>
              <label htmlFor="citizenId" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.register.citizenId')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="citizenId"
                  type="text"
                  name="citizenId"
                  value={data.citizenId}
                  onChange={handleInputChange}
                  className={`input-field pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${validationErrors.citizenId || citizenIdExists ? 'border-red-500' : ''}`}
                  placeholder="X-XXXX-XXXXX-XX-X"
                  maxLength={13}
                />
                {citizenIdChecking && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  </div>
                )}
                {!citizenIdChecking && data.citizenId.replace(/\D/g, '').length === 13 && !citizenIdExists && !validationErrors.citizenId && (
                  <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              {validationErrors.citizenId && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.citizenId}</p>
              )}
              {citizenIdChecking && (
                <p className="text-excise-500 dark:text-slate-400 text-xs mt-1">
                  {language === 'th' ? 'กำลังตรวจสอบ...' : 'Checking...'}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.register.mobile')} <span className="text-red-500">*</span>
              </label>
              <input
                id="mobile"
                type="tel"
                name="mobile"
                value={data.mobile}
                onChange={handleInputChange}
                className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${validationErrors.mobile ? 'border-red-500' : ''}`}
                placeholder="08X-XXX-XXXX"
                maxLength={10}
              />
              {validationErrors.mobile && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.mobile}</p>
              )}
            </div>

            {/* Birthdate */}
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.register.birthdate')}
              </label>
              <input
                id="birthdate"
                type="date"
                name="birthdate"
                value={data.birthdate}
                onChange={handleInputChange}
                className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            {/* Username (Optional) */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.register.usernameOptional')}
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={data.username || ''}
                  onChange={handleInputChange}
                  className={`input-field pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${validationErrors.username || usernameExists ? 'border-red-500' : ''}`}
                  placeholder={t(language, 'auth.register.usernamePlaceholder')}
                  maxLength={20}
                />
                {usernameChecking && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  </div>
                )}
                {!usernameChecking && data.username && data.username.length >= 3 && !usernameExists && !validationErrors.username && validateUsername(data.username).valid && (
                  <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              {validationErrors.username && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.username}</p>
              )}
              {usernameChecking && (
                <p className="text-excise-500 dark:text-slate-400 text-xs mt-1">
                  {t(language, 'auth.register.usernameChecking')}
                </p>
              )}
              {data.username && data.username.length >= 3 && (
                <div className="mt-2 p-3 bg-excise-50 dark:bg-slate-700 rounded border border-excise-200 dark:border-slate-600">
                  <p className="text-xs font-semibold text-excise-700 dark:text-slate-300 mb-2">{t(language, 'auth.register.usernameRules')}:</p>
                  <ul className="space-y-1 text-xs text-excise-600 dark:text-slate-400">
                    {getUsernameRules(language).map((rule, index) => (
                      <li key={index} className="text-green-600 dark:text-green-400">○ {rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.register.password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={data.password}
                  onChange={handleInputChange}
                  className={`input-field pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${validationErrors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {data.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-excise-500 dark:text-slate-400 hover:text-excise-700 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {validationErrors.password && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.password}</p>
              )}
              {data.password && (
                <div className="mt-3 p-3 bg-excise-50 dark:bg-slate-700 rounded border border-excise-200 dark:border-slate-600">
                  <p className="text-xs font-semibold text-excise-700 dark:text-slate-300 mb-2">{t(language, 'auth.register.passwordRequirements')}:</p>
                  <ul className="space-y-1 text-xs text-excise-600 dark:text-slate-400">
                    <li className={passwordChecks.hasMinLength ? 'text-green-600 dark:text-green-400' : ''}>
                      {passwordChecks.hasMinLength ? '✓' : '○'} {t(language, 'auth.register.passwordRules.minLength')}
                    </li>
                    <li className={passwordChecks.hasUppercase ? 'text-green-600 dark:text-green-400' : ''}>
                      {passwordChecks.hasUppercase ? '✓' : '○'} {t(language, 'auth.register.passwordRules.uppercase')}
                    </li>
                    <li className={passwordChecks.hasLowercase ? 'text-green-600 dark:text-green-400' : ''}>
                      {passwordChecks.hasLowercase ? '✓' : '○'} {t(language, 'auth.register.passwordRules.lowercase')}
                    </li>
                    <li className={passwordChecks.hasDigit ? 'text-green-600 dark:text-green-400' : ''}>
                      {passwordChecks.hasDigit ? '✓' : '○'} {t(language, 'auth.register.passwordRules.digit')}
                    </li>
                    <li className={passwordChecks.hasSpecialChar ? 'text-green-600 dark:text-green-400' : ''}>
                      {passwordChecks.hasSpecialChar ? '✓' : '○'} {t(language, 'auth.register.passwordRules.special')}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.register.confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={handleInputChange}
                  className={`input-field pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {data.confirmPassword && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-excise-500 dark:text-slate-400 hover:text-excise-700 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={citizenIdChecking || citizenIdExists || usernameChecking || usernameExists}
              className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(citizenIdChecking || usernameChecking) ? (language === 'th' ? 'กำลังตรวจสอบ...' : 'Checking...') : t(language, 'auth.register.nextStep')}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200">
              <ArrowLeft className="w-4 h-4" />
              {t(language, 'common.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Address Info
function AddressInfoStep({
  verifiedEmail,
  addressFormData,
  setAddressFormData,
  addressData,
  setAddressData,
  occupationData,
  setOccupationData,
  onNext,
  onBack,
}: {
  verifiedEmail: string;
  addressFormData: AddressFormData;
  setAddressFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
  addressData: ThaiAddressData;
  setAddressData: React.Dispatch<React.SetStateAction<ThaiAddressData>>;
  occupationData: OccupationData;
  setOccupationData: React.Dispatch<React.SetStateAction<OccupationData>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const { language } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!addressFormData.address) errors.address = t(language, 'auth.register.errors.addressRequired');
    if (!addressData.province) errors.province = t(language, 'auth.register.errors.provinceRequired');
    if (!addressData.district) errors.district = t(language, 'auth.register.errors.districtRequired');
    if (!addressData.subdistrict) errors.subdistrict = t(language, 'auth.register.errors.subdistrictRequired');
    if (!addressData.postalCode) errors.postalCode = t(language, 'auth.register.errors.postalCodeRequired');
    else if (!/^\d{5}$/.test(addressData.postalCode)) {
      errors.postalCode = t(language, 'auth.register.errors.postalCodeInvalid');
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-excise-900 dark:text-white mb-2">
              {t(language, 'auth.register.addressInfo.title')}
            </h1>
            <p className="text-sm sm:text-base text-excise-600 dark:text-slate-400">
              {t(language, 'auth.register.addressInfo.subtitle')}
            </p>
          </div>

          {/* Progress indicator */}
          <ProgressIndicator currentStep={4} totalSteps={5} />

          {/* Verified email badge */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">{t(language, 'auth.register.emailVerified')}</p>
              <p className="text-sm text-green-600 dark:text-green-500">{verifiedEmail}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Address (house number) */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.register.addressNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                name="address"
                value={addressFormData.address}
                onChange={handleInputChange}
                className={`input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${validationErrors.address ? 'border-red-500' : ''}`}
                placeholder={t(language, 'auth.register.addressNumberPlaceholder')}
              />
              {validationErrors.address && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.address}</p>
              )}
            </div>

            {/* Building / Floor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="building" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.register.building')}
                </label>
                <input
                  id="building"
                  type="text"
                  name="building"
                  value={addressFormData.building}
                  onChange={handleInputChange}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                  placeholder={t(language, 'auth.register.buildingPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.register.floor')}
                </label>
                <input
                  id="floor"
                  type="text"
                  name="floor"
                  value={addressFormData.floor}
                  onChange={handleInputChange}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                  placeholder={t(language, 'auth.register.floorPlaceholder')}
                />
              </div>
            </div>

            {/* Village / Soi */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="village" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.register.village')}
                </label>
                <input
                  id="village"
                  type="text"
                  name="village"
                  value={addressFormData.village}
                  onChange={handleInputChange}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="soi" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.register.soi')}
                </label>
                <input
                  id="soi"
                  type="text"
                  name="soi"
                  value={addressFormData.soi}
                  onChange={handleInputChange}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                  />
              </div>
            </div>

            {/* Road */}
            <div>
              <label htmlFor="road" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.register.road')}
              </label>
              <input
                id="road"
                type="text"
                name="road"
                value={addressFormData.road}
                onChange={handleInputChange}
                className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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

            {/* Occupation */}
            <OccupationDropdown
              value={occupationData}
              onChange={setOccupationData}
            />

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="w-full btn-primary mt-6"
            >
              {t(language, 'auth.register.nextStep')}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200">
              <ArrowLeft className="w-4 h-4" />
              {t(language, 'common.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 5: Summary
function SummaryStep({
  verifiedEmail,
  verificationToken,
  personalData,
  addressFormData,
  addressData,
  occupationData,
  onEdit,
  onBack,
}: {
  verifiedEmail: string;
  verificationToken: string;
  personalData: PersonalFormData;
  addressFormData: AddressFormData;
  addressData: ThaiAddressData;
  occupationData: OccupationData;
  onEdit: (step: RegistrationStep) => void;
  onBack: () => void;
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Build full address for display
  const fullAddressDisplay = [
    addressFormData.address,
    addressFormData.building && `อาคาร ${addressFormData.building}`,
    addressFormData.floor && `ชั้น ${addressFormData.floor}`,
    addressFormData.village && `หมู่ ${addressFormData.village}`,
    addressFormData.soi && `ซอย ${addressFormData.soi}`,
    addressFormData.road && `ถนน ${addressFormData.road}`,
  ].filter(Boolean).join(' ');

  const locationDisplay = `${addressData.subdistrict}, ${addressData.district}, ${addressData.province} ${addressData.postalCode}`;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      // Build full address string
      const fullAddress = [
        addressFormData.address,
        addressFormData.building ? `อาคาร ${addressFormData.building}` : null,
        addressFormData.floor ? `ชั้น ${addressFormData.floor}` : null,
        addressFormData.village ? `หมู่ ${addressFormData.village}` : null,
        addressFormData.soi ? `ซอย ${addressFormData.soi}` : null,
        addressFormData.road ? `ถนน ${addressFormData.road}` : null,
        `ตำบล/แขวง ${addressData.subdistrict}`,
        `อำเภอ/เขต ${addressData.district}`,
        `จังหวัด ${addressData.province}`,
        addressData.postalCode,
      ].filter(Boolean).join(' ');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifiedEmail,
          verificationToken,
          password: personalData.password,
          traits: {
            email: verifiedEmail,
            username: personalData.username || undefined, // NEW: Include username
            first_name: personalData.firstName,
            last_name: personalData.lastName,
            citizen_id: personalData.citizenId,
            mobile: personalData.mobile,
            birthdate: personalData.birthdate || undefined,
            address: fullAddress,
            address_details: {
              address: addressFormData.address,
              building: addressFormData.building || undefined,
              floor: addressFormData.floor || undefined,
              village: addressFormData.village || undefined,
              soi: addressFormData.soi || undefined,
              road: addressFormData.road || undefined,
              subdistrict: addressData.subdistrict,
              subdistrict_code: addressData.subdistrictCode,
              district: addressData.district,
              district_code: addressData.districtCode,
              province: addressData.province,
              province_code: addressData.provinceCode,
              postal_code: addressData.postalCode,
            },
            occupation: occupationData.isOther
              ? (occupationData.otherText || undefined)
              : (occupationData.name || undefined),
            occupation_code: occupationData.code || undefined,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      router.push('/auth/login?registered=true');
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

  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1">
      <span className="text-excise-600 dark:text-slate-400 text-sm">{label}</span>
      <span className="text-excise-900 dark:text-white text-sm font-medium text-right max-w-[60%]">{value || '-'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-excise-900 dark:text-white mb-2">
              {t(language, 'auth.register.summary.title')}
            </h1>
            <p className="text-sm sm:text-base text-excise-600 dark:text-slate-400">
              {t(language, 'auth.register.summary.subtitle')}
            </p>
          </div>

          {/* Progress indicator - 5 steps now */}
          <ProgressIndicator currentStep={5} totalSteps={5} />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">{t(language, 'auth.register.emailVerified')}</p>
              <p className="text-sm text-green-600 dark:text-green-500">{verifiedEmail}</p>
            </div>
          </div>

          {/* Personal Info Section */}
          <SummarySection title={t(language, 'auth.register.personalInfo.title')} onEditClick={() => onEdit('personal-info')}>
            {personalData.username && (
              <SummaryRow label={t(language, 'auth.register.username')} value={personalData.username} />
            )}
            <SummaryRow label={t(language, 'auth.register.firstName')} value={personalData.firstName} />
            <SummaryRow label={t(language, 'auth.register.lastName')} value={personalData.lastName} />
            <SummaryRow label={t(language, 'auth.register.citizenId')} value={personalData.citizenId.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5')} />
            <SummaryRow label={t(language, 'auth.register.mobile')} value={personalData.mobile.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')} />
            {personalData.birthdate && (
              <SummaryRow label={t(language, 'auth.register.birthdate')} value={new Date(personalData.birthdate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')} />
            )}
          </SummarySection>

          {/* Address Section */}
          <SummarySection title={t(language, 'auth.register.addressInfo.title')} onEditClick={() => onEdit('address-info')}>
            <SummaryRow label={t(language, 'auth.register.addressSection')} value={fullAddressDisplay} />
            <SummaryRow label={t(language, 'auth.register.summary.location')} value={locationDisplay} />
            {(occupationData.name || occupationData.otherText) && (
              <SummaryRow
                label={t(language, 'auth.register.occupation')}
                value={occupationData.isOther ? occupationData.otherText : occupationData.name}
              />
            )}
          </SummarySection>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? t(language, 'auth.register.registering') : t(language, 'auth.register.confirmAndRegister')}
          </button>

          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <button onClick={onBack} disabled={submitting} className="flex items-center gap-2 text-sm text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200 disabled:opacity-50">
              <ArrowLeft className="w-4 h-4" />
              {t(language, 'common.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Indicator Component
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center mb-6 px-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                  ? 'bg-primary-500 text-white'
                  : 'bg-excise-200 dark:bg-slate-600 text-excise-500 dark:text-slate-400'
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-6 sm:w-8 h-1 flex-shrink-0 ${
                  isCompleted ? 'bg-green-500' : 'bg-excise-200 dark:bg-slate-600'
                }`}
              />
            )}
          </div>
        );
      })}
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
