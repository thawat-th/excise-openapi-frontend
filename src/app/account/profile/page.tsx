'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { isPasswordValid, getPasswordErrors } from '@/lib/validators/password';
import { isValidEmail, isValidEmailDomain } from '@/lib/validators/email';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobile: '',
    citizenId: '',
  });

  const [originalEmail, setOriginalEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Password validation
  const passwordValid = isPasswordValid(passwordData.newPassword);
  const passwordErrors = getPasswordErrors(passwordData.newPassword, language);
  const passwordsMatch = passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword;

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Check if user is logged in
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        if (!sessionResponse.ok) {
          // Not logged in, redirect to login
          router.push('/auth/login');
          return;
        }

        const session = await sessionResponse.json();

        // Check if email is verified
        if (!session.identity?.verifiable_addresses?.[0]?.verified) {
          // Email not verified, redirect to verification
          router.push('/auth/verify-email?email=' + encodeURIComponent(session.identity?.traits?.email || ''));
          return;
        }

        // Pre-fill profile data from session
        const traits = session.identity?.traits || {};
        const email = traits.email || '';

        setProfileData({
          email: email,
          firstName: traits.first_name || '',
          lastName: traits.last_name || '',
          mobile: traits.mobile || '',
          citizenId: traits.citizen_id || '',
        });

        setOriginalEmail(email);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize profile:', err);
        setError(t(language, 'profile.loadError'));
        setLoading(false);
      }
    };

    initializeProfile();
  }, [router, language]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Real-time email validation
    if (name === 'email') {
      if (value) {
        setEmailValid(isValidEmail(value) && isValidEmailDomain(value));
      } else {
        setEmailValid(false);
      }
    }

    // Clear success message on change
    if (success) setSuccess(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate email
    if (!profileData.email || !emailValid) {
      setError(t(language, 'profile.emailInvalid'));
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: profileData.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          mobile: profileData.mobile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t(language, 'profile.updateFailed'));
      }

      const result = await response.json();
      setSuccess(t(language, 'profile.updateSuccess'));

      // If email was changed, update original email
      if (profileData.email !== originalEmail) {
        setOriginalEmail(profileData.email);
        // Note: User will need to verify new email via email flow
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      const errorMessage = err instanceof Error ? err.message : t(language, 'profile.updateFailed');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear success message on change
    if (success) setSuccess(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate
    if (!passwordData.currentPassword) {
      setError(t(language, 'profile.currentPasswordRequired'));
      return;
    }

    if (!passwordData.newPassword || !passwordValid) {
      setError(t(language, 'profile.passwordInvalid'));
      return;
    }

    if (!passwordsMatch) {
      setError(t(language, 'profile.passwordsMismatch'));
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t(language, 'profile.passwordChangeFailed'));
      }

      setSuccess(t(language, 'profile.passwordChangeSuccess'));

      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Password change failed:', err);
      const errorMessage = err instanceof Error ? err.message : t(language, 'profile.passwordChangeFailed');
      setError(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <ProfileFallback />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-excise-900">{t(language, 'profile.title')}</h1>
          <p className="text-excise-600 text-sm mt-2">{t(language, 'profile.subtitle')}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Profile Information Card */}
        <div className="card mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-excise-900 mb-2">
              {t(language, 'profile.profileSection')}
            </h2>
            <p className="text-excise-600 text-sm">{t(language, 'profile.profileDescription')}</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-excise-700 mb-2">
                {t(language, 'profile.email')}
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className={`input-field ${!emailValid && profileData.email ? 'border-red-500' : emailValid && profileData.email ? 'border-green-500' : ''}`}
                  placeholder="you@example.com"
                  disabled={saving}
                />
                {profileData.email && emailValid && (
                  <span className="absolute right-3 top-3 text-green-600 text-lg">✓</span>
                )}
              </div>
              {!emailValid && profileData.email && (
                <p className="text-red-600 text-xs mt-1">{t(language, 'profile.emailInvalid')}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-excise-700 mb-2">
                {t(language, 'profile.firstName')}
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                className="input-field"
                placeholder={t(language, 'profile.firstName')}
                disabled={saving}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-excise-700 mb-2">
                {t(language, 'profile.lastName')}
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                className="input-field"
                placeholder={t(language, 'profile.lastName')}
                disabled={saving}
              />
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-excise-700 mb-2">
                {t(language, 'profile.mobile')}
              </label>
              <input
                id="mobile"
                type="tel"
                name="mobile"
                value={profileData.mobile}
                onChange={handleProfileChange}
                className="input-field"
                placeholder={t(language, 'profile.mobileFormat')}
                disabled={saving}
              />
            </div>

            {/* Citizen ID (Read-only) */}
            <div>
              <label htmlFor="citizenId" className="block text-sm font-medium text-excise-700 mb-2">
                {t(language, 'profile.citizenId')}
              </label>
              <input
                id="citizenId"
                type="text"
                value={profileData.citizenId}
                className="input-field bg-excise-100 text-excise-700 cursor-not-allowed"
                disabled
              />
              <p className="text-excise-600 text-xs mt-1">{t(language, 'profile.citizenIdReadOnly')}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || !emailValid}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {saving ? t(language, 'common.processing') : t(language, 'profile.updateButton')}
            </button>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-excise-900 mb-2">
              {t(language, 'profile.securitySection')}
            </h2>
            <p className="text-excise-600 text-sm">{t(language, 'profile.securityDescription')}</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-excise-700 mb-2">
                {t(language, 'profile.currentPassword')}
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  disabled={changingPassword}
                />
                {passwordData.currentPassword && (
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-excise-500 hover:text-excise-700 transition-colors"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                    disabled={changingPassword}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-excise-700 mb-2">
                {t(language, 'profile.newPassword')}
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`input-field pr-10 ${
                    passwordData.newPassword && passwordValid ? 'border-green-500' : passwordData.newPassword && !passwordValid ? 'border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  disabled={changingPassword}
                />
                {passwordData.newPassword && (
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-excise-500 hover:text-excise-700 transition-colors"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    disabled={changingPassword}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>

              {/* Password Requirements */}
              {passwordData.newPassword && (
                <div className="mt-3 space-y-1 text-xs">
                  <p className={passwordErrors.includes('length') ? 'text-red-600' : 'text-green-600'}>
                    {passwordErrors.includes('length') ? '○' : '✓'} {t(language, 'auth.register.passwordLength')}
                  </p>
                  <p className={passwordErrors.includes('uppercase') ? 'text-red-600' : 'text-green-600'}>
                    {passwordErrors.includes('uppercase') ? '○' : '✓'} {t(language, 'auth.register.passwordUppercase')}
                  </p>
                  <p className={passwordErrors.includes('lowercase') ? 'text-red-600' : 'text-green-600'}>
                    {passwordErrors.includes('lowercase') ? '○' : '✓'} {t(language, 'auth.register.passwordLowercase')}
                  </p>
                  <p className={passwordErrors.includes('number') ? 'text-red-600' : 'text-green-600'}>
                    {passwordErrors.includes('number') ? '○' : '✓'} {t(language, 'auth.register.passwordNumber')}
                  </p>
                  <p className={passwordErrors.includes('special') ? 'text-red-600' : 'text-green-600'}>
                    {passwordErrors.includes('special') ? '○' : '✓'} {t(language, 'auth.register.passwordSpecial')}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-excise-700 mb-2">
                {t(language, 'profile.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`input-field pr-10 ${
                    passwordData.confirmPassword && passwordsMatch ? 'border-green-500' : passwordData.confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  disabled={changingPassword}
                />
                {passwordData.confirmPassword && passwordsMatch && (
                  <span className="absolute right-3 top-3 text-green-600 text-lg">✓</span>
                )}
                {passwordData.confirmPassword && !passwordsMatch && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-excise-500 hover:text-excise-700 transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    disabled={changingPassword}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {passwordData.confirmPassword && !passwordsMatch && (
                <p className="text-red-600 text-xs mt-1">{t(language, 'profile.passwordsMismatch')}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={changingPassword || !passwordValid || !passwordsMatch || !passwordData.currentPassword}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {changingPassword ? t(language, 'common.processing') : t(language, 'profile.changePasswordButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProfileFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 flex items-center justify-center p-4">
      <div className="card text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600">Loading...</p>
      </div>
    </div>
  );
}
