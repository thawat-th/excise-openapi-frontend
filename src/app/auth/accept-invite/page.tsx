'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

export const dynamic = 'force-dynamic';

interface InvitationData {
  token: string;
  member: {
    id: string;
    organization_id: string;
    organization_name?: string;
    email: string;
    role: string;
    status: string;
  } | null;
}

type PageState = 'loading' | 'valid' | 'expired' | 'error' | 'accepted' | 'rejected' | 'processing';

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInviteFallback />}>
      <AcceptInviteForm />
    </Suspense>
  );
}

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const token = searchParams.get('token');

  const validateToken = useCallback(async (inviteToken: string) => {
    try {
      const response = await fetch(`/api/invitations?token=${encodeURIComponent(inviteToken)}`);
      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'INVITATION_EXPIRED') {
          setPageState('expired');
          setError(language === 'th'
            ? 'ลิงก์คำเชิญนี้หมดอายุแล้ว'
            : 'This invitation link has expired');
          return;
        }
        if (data.code === 'INVITATION_ALREADY_PROCESSED') {
          setPageState('error');
          setError(language === 'th'
            ? 'คำเชิญนี้ได้รับการดำเนินการแล้ว'
            : 'This invitation has already been processed');
          return;
        }
        setPageState('error');
        setError(data.error || (language === 'th'
          ? 'ลิงก์คำเชิญไม่ถูกต้อง'
          : 'Invalid invitation link'));
        return;
      }

      setInvitation({
        token: data.token || inviteToken,
        member: data.member,
      });
      setPageState('valid');
    } catch (err) {
      console.error('[accept-invite] Validation error:', err);
      setPageState('error');
      setError(language === 'th'
        ? 'เกิดข้อผิดพลาดในการตรวจสอบคำเชิญ'
        : 'Failed to validate invitation');
    }
  }, [language]);

  useEffect(() => {
    if (!token) {
      setPageState('error');
      setError(language === 'th'
        ? 'ไม่พบ Token คำเชิญ'
        : 'Invitation token not found');
      return;
    }
    validateToken(token);
  }, [token, validateToken, language]);

  const handleAction = async (action: 'accept' | 'reject') => {
    if (!token) return;

    setPageState('processing');
    setError('');

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPageState('valid');
        setError(data.error || (language === 'th'
          ? `ไม่สามารถ${action === 'accept' ? 'ยอมรับ' : 'ปฏิเสธ'}คำเชิญได้`
          : `Failed to ${action} invitation`));
        return;
      }

      if (action === 'accept') {
        setPageState('accepted');
        setActionMessage(language === 'th'
          ? 'คุณได้เข้าร่วมองค์กรเรียบร้อยแล้ว'
          : 'You have successfully joined the organization');
      } else {
        setPageState('rejected');
        setActionMessage(language === 'th'
          ? 'คุณได้ปฏิเสธคำเชิญแล้ว'
          : 'You have declined the invitation');
      }
    } catch (err) {
      console.error(`[accept-invite] ${action} error:`, err);
      setPageState('valid');
      setError(language === 'th'
        ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        : 'An error occurred. Please try again.');
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, { th: string; en: string }> = {
      owner: { th: 'เจ้าของ', en: 'Owner' },
      admin: { th: 'ผู้ดูแลระบบ', en: 'Admin' },
      member: { th: 'สมาชิก', en: 'Member' },
      viewer: { th: 'ผู้ชม', en: 'Viewer' },
    };
    const label = roleLabels[role];
    return label ? (language === 'th' ? label.th : label.en) : role;
  };

  if (pageState === 'loading') {
    return <AcceptInviteFallback />;
  }

  // Success: Accepted
  if (pageState === 'accepted') {
    return (
      <PageWrapper>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
            {language === 'th' ? 'เข้าร่วมองค์กรสำเร็จ' : 'Invitation Accepted'}
          </h1>
          <p className="text-excise-600 dark:text-slate-400 text-sm mt-2">
            {actionMessage}
          </p>
        </div>

        <button
          onClick={() => router.push('/auth/login')}
          className="w-full btn-primary"
        >
          {language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
        </button>
      </PageWrapper>
    );
  }

  // Success: Rejected
  if (pageState === 'rejected') {
    return (
      <PageWrapper>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-excise-400 to-excise-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
            {language === 'th' ? 'ปฏิเสธคำเชิญแล้ว' : 'Invitation Declined'}
          </h1>
          <p className="text-excise-600 dark:text-slate-400 text-sm mt-2">
            {actionMessage}
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full px-4 py-2 text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200 font-medium"
        >
          {language === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
        </button>
      </PageWrapper>
    );
  }

  // Error: Expired
  if (pageState === 'expired') {
    return (
      <PageWrapper>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
            {language === 'th' ? 'คำเชิญหมดอายุ' : 'Invitation Expired'}
          </h1>
          <p className="text-excise-600 dark:text-slate-400 text-sm mt-2">
            {error}
          </p>
        </div>

        <p className="text-excise-500 dark:text-slate-500 text-sm text-center mb-6">
          {language === 'th'
            ? 'กรุณาติดต่อผู้ดูแลองค์กรเพื่อขอคำเชิญใหม่'
            : 'Please contact the organization admin for a new invitation'}
        </p>

        <button
          onClick={() => router.push('/')}
          className="w-full px-4 py-2 text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200 font-medium"
        >
          {language === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
        </button>
      </PageWrapper>
    );
  }

  // Error: Generic
  if (pageState === 'error') {
    return (
      <PageWrapper>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
            {language === 'th' ? 'ลิงก์ไม่ถูกต้อง' : 'Invalid Link'}
          </h1>
          <p className="text-excise-600 dark:text-slate-400 text-sm mt-2">
            {error}
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full px-4 py-2 text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200 font-medium"
        >
          {language === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
        </button>
      </PageWrapper>
    );
  }

  // Valid invitation - show details and accept/reject buttons
  return (
    <PageWrapper>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
          {language === 'th' ? 'คำเชิญเข้าร่วมองค์กร' : 'Organization Invitation'}
        </h1>
        <p className="text-excise-600 dark:text-slate-400 text-sm mt-1">
          {language === 'th'
            ? 'คุณได้รับเชิญให้เข้าร่วมองค์กร'
            : 'You have been invited to join an organization'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Invitation Details */}
      {invitation?.member && (
        <div className="space-y-3 mb-6">
          {invitation.member.organization_name && (
            <div className="bg-excise-50 dark:bg-slate-700 p-3 rounded-lg border border-excise-200 dark:border-slate-600">
              <p className="text-excise-500 dark:text-slate-400 text-xs mb-1">
                {language === 'th' ? 'องค์กร' : 'Organization'}
              </p>
              <p className="text-excise-900 dark:text-white font-medium text-sm">
                {invitation.member.organization_name}
              </p>
            </div>
          )}

          <div className="bg-excise-50 dark:bg-slate-700 p-3 rounded-lg border border-excise-200 dark:border-slate-600">
            <p className="text-excise-500 dark:text-slate-400 text-xs mb-1">
              {language === 'th' ? 'อีเมล' : 'Email'}
            </p>
            <p className="text-excise-900 dark:text-white font-medium text-sm">
              {invitation.member.email}
            </p>
          </div>

          <div className="bg-excise-50 dark:bg-slate-700 p-3 rounded-lg border border-excise-200 dark:border-slate-600">
            <p className="text-excise-500 dark:text-slate-400 text-xs mb-1">
              {language === 'th' ? 'บทบาท' : 'Role'}
            </p>
            <p className="text-excise-900 dark:text-white font-medium text-sm">
              {getRoleLabel(invitation.member.role)}
            </p>
          </div>
        </div>
      )}

      {/* Accept Button */}
      <button
        onClick={() => handleAction('accept')}
        disabled={pageState === 'processing'}
        className="w-full btn-primary mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pageState === 'processing'
          ? (language === 'th' ? 'กำลังดำเนินการ...' : 'Processing...')
          : (language === 'th' ? 'ยอมรับคำเชิญ' : 'Accept Invitation')}
      </button>

      {/* Reject Button */}
      <button
        onClick={() => handleAction('reject')}
        disabled={pageState === 'processing'}
        className="w-full px-4 py-2 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {language === 'th' ? 'ปฏิเสธคำเชิญ' : 'Decline Invitation'}
      </button>
    </PageWrapper>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
}

function AcceptInviteFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
