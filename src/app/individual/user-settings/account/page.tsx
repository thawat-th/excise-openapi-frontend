'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, User, CheckCircle, AlertCircle, Loader2, Camera, Upload, X, Eye, EyeOff, Key } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { SkeletonAccountSettings } from '@/components/ui/Skeleton';
import { getInitials } from '@/lib/utils';
import { apiGet } from '@/lib/fetch-helpers';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  emailVerified: boolean;
  avatar?: string;
}

const MAX_FILE_SIZE = 150 * 1024; // 150KB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

function SettingCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ icon: Icon, label, children, action }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-200 dark:border-slate-600 last:border-0">
      <div className="p-2 rounded-lg bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500">
        <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export default function AccountSettingsPage() {
  const { language } = useLanguage();
  const prefix = 'dashboard.pages.individual.settings.account';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Email change modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailChanging, setEmailChanging] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Phone change modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [showPhonePassword, setShowPhonePassword] = useState(false);
  const [phoneChanging, setPhoneChanging] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);

  // Display name change modal state
  const [showNameModal, setShowNameModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [nameChanging, setNameChanging] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const result = await apiGet<UserProfile>('/api/account/profile', 'account');

      if (result.success && result.data) {
        setProfile(result.data);
        if (result.data.avatar) {
          setAvatarPreview(result.data.avatar);
        }
      } else {
        setError(t(language, 'common.error'));
      }

      setLoading(false);
    }

    fetchProfile();
  }, [language]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError(t(language, `${prefix}.avatarInvalidType`));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError(t(language, `${prefix}.avatarTooLarge`));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/account/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      if (data.avatar) {
        setAvatarPreview(data.avatar);
      }
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarPreview(null);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Call API to remove avatar
    try {
      await fetch('/api/account/avatar', {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to remove avatar:', err);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!newEmail || !emailPassword) return;

    setEmailChanging(true);

    try {
      const response = await fetch('/api/account/email/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail,
          password: emailPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change email');
      }

      setEmailSuccess(
        language === 'th'
          ? `ส่งอีเมลยืนยันไปที่ ${newEmail} แล้ว กรุณาตรวจสอบและยืนยันเพื่อเปลี่ยนอีเมล`
          : `Verification email sent to ${newEmail}. Please check your inbox and verify to complete the change.`
      );

      // Clear form but keep modal open to show success message
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to change email');
    } finally {
      setEmailChanging(false);
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setNewEmail('');
    setEmailPassword('');
    setEmailError(null);
    setEmailSuccess(null);
    setShowEmailPassword(false);
  };

  const handlePhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setPhoneSuccess(null);

    if (!newPhone || !phonePassword) return;

    setPhoneChanging(true);

    try {
      const response = await fetch('/api/account/phone/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPhone,
          password: phonePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change phone number');
      }

      setPhoneSuccess(
        language === 'th'
          ? `ส่งรหัส OTP ไปที่ ${newPhone} แล้ว กรุณายืนยันเพื่อเปลี่ยนเบอร์โทรศัพท์`
          : `OTP sent to ${newPhone}. Please verify to complete the change.`
      );

      // Clear form but keep modal open to show success message
      setNewPhone('');
      setPhonePassword('');
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : 'Failed to change phone number');
    } finally {
      setPhoneChanging(false);
    }
  };

  const closePhoneModal = () => {
    setShowPhoneModal(false);
    setNewPhone('');
    setPhonePassword('');
    setPhoneError(null);
    setPhoneSuccess(null);
    setShowPhonePassword(false);
  };

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(null);

    if (!newFirstName && !newLastName) return;

    setNameChanging(true);

    try {
      const response = await fetch('/api/account/name/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirstName || profile?.firstName,
          lastName: newLastName || profile?.lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update display name');
      }

      setNameSuccess(
        language === 'th'
          ? 'เปลี่ยนชื่อสำเร็จแล้ว'
          : 'Display name updated successfully'
      );

      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          firstName: newFirstName || profile.firstName,
          lastName: newLastName || profile.lastName,
        });
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        closeNameModal();
      }, 1500);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to update display name');
    } finally {
      setNameChanging(false);
    }
  };

  const closeNameModal = () => {
    setShowNameModal(false);
    setNewFirstName('');
    setNewLastName('');
    setNameError(null);
    setNameSuccess(null);
  };

  const openNameModal = () => {
    setNewFirstName(profile?.firstName || '');
    setNewLastName(profile?.lastName || '');
    setShowNameModal(true);
  };

  if (loading) {
    return <SkeletonAccountSettings />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || t(language, `${prefix}.notSet`);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar Section */}
      <SettingCard
        title={t(language, `${prefix}.avatar`)}
        description={t(language, `${prefix}.avatarDesc`)}
      >
        <div className="flex items-center gap-6">
          {/* Avatar Preview */}
          <div className="relative">
            <div
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 border-primary-300 dark:border-primary-700"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-semibold text-white">
                  {getInitials(profile?.firstName, profile?.lastName)}
                </span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {t(language, `${prefix}.uploadAvatar`)}
              </button>
              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  {t(language, `${prefix}.removeAvatar`)}
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              {t(language, `${prefix}.avatarHint`)}
            </p>
            {avatarError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {avatarError}
              </p>
            )}
          </div>
        </div>
      </SettingCard>

      {/* Contact Information */}
      <SettingCard
        title={t(language, `${prefix}.contactInfo`)}
        description={t(language, `${prefix}.contactInfoDesc`)}
      >
        <SettingRow
          icon={Mail}
          label={t(language, `${prefix}.email`)}
          action={
            <button
              onClick={() => setShowEmailModal(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {t(language, `${prefix}.edit`)}
            </button>
          }
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">{profile?.email || t(language, `${prefix}.notSet`)}</span>
            {profile?.emailVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                <CheckCircle className="w-3 h-3" />
                {t(language, `${prefix}.verified`)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                <AlertCircle className="w-3 h-3" />
                {t(language, `${prefix}.notVerified`)}
              </span>
            )}
          </div>
        </SettingRow>

        <SettingRow
          icon={Phone}
          label={t(language, `${prefix}.phone`)}
          action={
            <button
              onClick={() => setShowPhoneModal(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {profile?.mobile ? t(language, `${prefix}.edit`) : t(language, `${prefix}.add`)}
            </button>
          }
        >
          {profile?.mobile ? (
            <span className="font-medium text-gray-900 dark:text-white">{profile.mobile}</span>
          ) : (
            <span className="text-gray-400 dark:text-slate-500">{t(language, `${prefix}.notSet`)}</span>
          )}
        </SettingRow>
      </SettingCard>

      {/* Profile Information */}
      <SettingCard
        title={t(language, `${prefix}.profileInfo`)}
        description={t(language, `${prefix}.profileInfoDesc`)}
      >
        <SettingRow
          icon={User}
          label={t(language, `${prefix}.displayName`)}
          action={
            <button
              onClick={openNameModal}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {t(language, `${prefix}.edit`)}
            </button>
          }
        >
          {displayName !== t(language, `${prefix}.notSet`) ? (
            <span className="font-medium text-gray-900 dark:text-white">{displayName}</span>
          ) : (
            <span className="text-gray-400 dark:text-slate-500">{t(language, `${prefix}.notSet`)}</span>
          )}
        </SettingRow>
      </SettingCard>

      {/* Display Name Change Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t(language, `${prefix}.editDisplayName`)}
              </h3>
              <button
                onClick={closeNameModal}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {nameError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{nameError}</p>
              </div>
            )}

            {/* Success Message */}
            {nameSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">{nameSuccess}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleNameChange} className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t(language, `${prefix}.firstName`)}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    disabled={nameChanging || !!nameSuccess}
                    placeholder={t(language, `${prefix}.enterFirstName`)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t(language, `${prefix}.lastName`)}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    disabled={nameChanging || !!nameSuccess}
                    placeholder={t(language, `${prefix}.enterLastName`)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Buttons */}
              {!nameSuccess && (
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={(!newFirstName && !newLastName) || nameChanging}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {nameChanging && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t(language, `${prefix}.save`)}
                  </button>
                  <button
                    type="button"
                    onClick={closeNameModal}
                    disabled={nameChanging}
                    className="px-4 py-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                  >
                    {t(language, `${prefix}.cancel`)}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Phone Change Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t(language, `${prefix}.changePhone`)}
              </h3>
              <button
                onClick={closePhoneModal}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Phone */}
            {profile?.mobile && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {t(language, `${prefix}.currentPhone`)}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">{profile.mobile}</p>
              </div>
            )}

            {/* Error Message */}
            {phoneError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{phoneError}</p>
              </div>
            )}

            {/* Success Message */}
            {phoneSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">{phoneSuccess}</p>
                </div>
              </div>
            )}

            {!phoneSuccess && (
              <form onSubmit={handlePhoneChange} className="space-y-4">
                {/* New Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {language === 'th' ? 'เบอร์โทรศัพท์ใหม่' : 'New phone number'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      disabled={phoneChanging}
                      placeholder={language === 'th' ? 'กรอกเบอร์โทรศัพท์ใหม่ (10 หลัก)' : 'Enter new phone number (10 digits)'}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 ${
                        newPhone && newPhone === profile?.mobile
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                      maxLength={10}
                    />
                  </div>
                  {newPhone && newPhone === profile?.mobile && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {language === 'th' ? 'เบอร์โทรใหม่ต้องไม่เหมือนกับเบอร์โทรปัจจุบัน' : 'New phone must be different from current phone'}
                    </p>
                  )}
                </div>

                {/* Password Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {language === 'th' ? 'ยืนยันด้วยรหัสผ่าน' : 'Confirm with password'}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPhonePassword ? 'text' : 'password'}
                      value={phonePassword}
                      onChange={(e) => setPhonePassword(e.target.value)}
                      disabled={phoneChanging}
                      placeholder={language === 'th' ? 'กรอกรหัสผ่านปัจจุบัน' : 'Enter current password'}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPhonePassword(!showPhonePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPhonePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {language === 'th'
                      ? 'ระบบจะส่งรหัส OTP ไปที่เบอร์โทรศัพท์ใหม่ คุณต้องยืนยันก่อนที่เบอร์โทรศัพท์จะถูกเปลี่ยน'
                      : 'An OTP will be sent to your new phone number. You must verify it before the change takes effect.'}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!newPhone || newPhone.length !== 10 || !phonePassword || phoneChanging || newPhone === profile?.mobile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {phoneChanging && <Loader2 className="w-4 h-4 animate-spin" />}
                    {language === 'th' ? 'ส่งรหัส OTP' : 'Send OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={closePhoneModal}
                    disabled={phoneChanging}
                    className="px-4 py-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                </div>
              </form>
            )}

            {phoneSuccess && (
              <button
                onClick={closePhoneModal}
                className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {language === 'th' ? 'ปิด' : 'Close'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'th' ? 'เปลี่ยนอีเมล' : 'Change Email'}
              </h3>
              <button
                onClick={closeEmailModal}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Email */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {language === 'th' ? 'อีเมลปัจจุบัน' : 'Current email'}
              </p>
              <p className="font-medium text-gray-900 dark:text-white">{profile?.email}</p>
            </div>

            {/* Error Message */}
            {emailError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{emailError}</p>
              </div>
            )}

            {/* Success Message */}
            {emailSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">{emailSuccess}</p>
                </div>
              </div>
            )}

            {!emailSuccess && (
              <form onSubmit={handleEmailChange} className="space-y-4">
                {/* New Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {language === 'th' ? 'อีเมลใหม่' : 'New email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={emailChanging}
                      placeholder={language === 'th' ? 'กรอกอีเมลใหม่' : 'Enter new email'}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 ${
                        newEmail && newEmail.toLowerCase() === profile?.email?.toLowerCase()
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                  </div>
                  {newEmail && newEmail.toLowerCase() === profile?.email?.toLowerCase() && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {language === 'th' ? 'อีเมลใหม่ต้องไม่เหมือนกับอีเมลปัจจุบัน' : 'New email must be different from current email'}
                    </p>
                  )}
                </div>

                {/* Password Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {language === 'th' ? 'ยืนยันด้วยรหัสผ่าน' : 'Confirm with password'}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showEmailPassword ? 'text' : 'password'}
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      disabled={emailChanging}
                      placeholder={language === 'th' ? 'กรอกรหัสผ่านปัจจุบัน' : 'Enter current password'}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showEmailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {language === 'th'
                      ? 'ระบบจะส่งอีเมลยืนยันไปที่อีเมลใหม่ คุณต้องยืนยันก่อนที่อีเมลจะถูกเปลี่ยน'
                      : 'A verification email will be sent to your new email. You must verify it before the change takes effect.'}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!newEmail || !emailPassword || emailChanging || newEmail.toLowerCase() === profile?.email?.toLowerCase()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {emailChanging && <Loader2 className="w-4 h-4 animate-spin" />}
                    {language === 'th' ? 'ส่งอีเมลยืนยัน' : 'Send Verification'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEmailModal}
                    disabled={emailChanging}
                    className="px-4 py-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                </div>
              </form>
            )}

            {emailSuccess && (
              <button
                onClick={closeEmailModal}
                className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {language === 'th' ? 'ปิด' : 'Close'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
