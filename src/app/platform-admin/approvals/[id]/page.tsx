'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/dashboard';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, User, FileText, Check, X, Info } from 'lucide-react';
import { ApproveModal, RejectModal, RequestInfoModal } from '@/components/modals';

interface Registration {
  id: string;
  tracking_code: string;
  org_name_th: string;  // Backend field name
  org_name_en?: string;  // Backend field name
  tax_id: string;
  org_type: string;  // Backend field name
  address_line1: string;  // Backend field name
  subdistrict_name: string;  // Backend field name
  district_name: string;  // Backend field name
  province_name: string;  // Backend field name
  postal_code: string;  // Backend field name
  contact_first_name: string;  // Backend field name
  contact_last_name: string;  // Backend field name
  contact_email: string;
  contact_phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'need_more_info';  // Backend uses 'need_more_info'
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reject_reason?: string;
}

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);

  // Fetch registration detail
  const fetchRegistration = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/registrations/organization/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registration');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setRegistration(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch registration');
      }
    } catch (err) {
      console.error('Failed to fetch registration:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistration();
  }, [id]);

  // Confirm approve
  const confirmApprove = async () => {
    if (!registration) return;

    try {
      const response = await fetch(`/api/registrations/organization/${registration.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        await fetchRegistration();
        setShowApproveModal(false);
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      throw error;
    }
  };

  // Confirm reject
  const confirmReject = async (reason: string) => {
    if (!registration) return;

    try {
      const response = await fetch(`/api/registrations/organization/${registration.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected', reason }),
      });

      if (response.ok) {
        await fetchRegistration();
        setShowRejectModal(false);
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error);
      throw error;
    }
  };

  // Confirm request info
  const confirmRequestInfo = async (message: string) => {
    if (!registration) return;

    try {
      const response = await fetch(`/api/registrations/organization/${registration.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'need_info', reason: message }),
      });

      if (response.ok) {
        await fetchRegistration();
        setShowRequestInfoModal(false);
      } else {
        throw new Error('Failed to request info');
      }
    } catch (error) {
      console.error('Request info error:', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'need_info':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'need_info':
        return 'Need More Information';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Overview', href: '/platform-admin/dashboard' },
            { label: 'Pending Approvals', href: '/platform-admin/approvals' },
            { label: 'Details' },
          ]}
        />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading registration details...</p>
        </div>
      </>
    );
  }

  if (error || !registration) {
    return (
      <>
        <PageHeader
          title="Error"
          breadcrumbs={[
            { label: 'Overview', href: '/platform-admin/dashboard' },
            { label: 'Pending Approvals', href: '/platform-admin/approvals' },
            { label: 'Details' },
          ]}
        />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Registration not found'}</p>
          <button
            onClick={() => router.push('/platform-admin/approvals')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Approvals
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Registration: ${registration.tracking_code}`}
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Pending Approvals', href: '/platform-admin/approvals' },
          { label: registration.tracking_code },
        ]}
      />

      {/* Back Button */}
      <button
        onClick={() => router.push('/platform-admin/approvals')}
        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Approvals List
      </button>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(registration.status)}`}>
          {getStatusLabel(registration.status)}
        </span>
      </div>

      {/* Action Buttons */}
      {(registration.status === 'pending' || registration.status === 'need_more_info') && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowApproveModal(true)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Approve Registration
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Reject Registration
          </button>
          <button
            onClick={() => setShowRequestInfoModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Info className="w-5 h-5" />
            Request More Information
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              Organization Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Organization Name (TH)</label>
                <p className="font-medium text-gray-900 dark:text-gray-100">{registration.org_name_th}</p>
              </div>
              {registration.org_name_en && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Organization Name (EN)</label>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{registration.org_name_en}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Tax ID</label>
                <p className="font-medium font-mono text-gray-900 dark:text-gray-100">{registration.tax_id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Organization Type</label>
                <p className="font-medium text-gray-900 dark:text-gray-100">{registration.org_type}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Contact Person
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                <p className="font-medium text-gray-900 dark:text-gray-100">{`${registration.contact_first_name} ${registration.contact_last_name}`}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  <a href={`mailto:${registration.contact_email}`} className="text-primary-600 hover:underline">
                    {registration.contact_email}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  <a href={`tel:${registration.contact_phone}`} className="text-primary-600 hover:underline">
                    {registration.contact_phone}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Organization Address
            </h2>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-gray-100">{registration.address_line1}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {registration.subdistrict_name}, {registration.district_name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {registration.province_name} {registration.postal_code}
              </p>
            </div>
          </div>

          {/* Rejection Reason (if rejected or need info) */}
          {(registration.status === 'rejected' || registration.status === 'need_more_info') && registration.reject_reason && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-red-900 dark:text-red-100">
                <FileText className="w-5 h-5" />
                {registration.status === 'rejected' ? 'Rejection Reason' : 'Additional Information Required'}
              </h2>
              <p className="text-red-800 dark:text-red-200">{registration.reject_reason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Submitted</label>
                <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(registration.created_at)}</p>
              </div>
              {registration.reviewed_at && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Reviewed</label>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(registration.reviewed_at)}</p>
                  {registration.reviewed_by && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">by {registration.reviewed_by}</p>
                  )}
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</label>
                <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(registration.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Tracking Code */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Tracking Code</h2>
            <p className="font-mono text-2xl font-bold text-primary-600 dark:text-primary-400 text-center py-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {registration.tracking_code}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {registration && (
        <>
          <ApproveModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={confirmApprove}
            organizationName={registration.org_name_th}
            trackingCode={registration.tracking_code}
          />
          <RejectModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onConfirm={confirmReject}
            organizationName={registration.org_name_th}
            trackingCode={registration.tracking_code}
          />
          <RequestInfoModal
            isOpen={showRequestInfoModal}
            onClose={() => setShowRequestInfoModal(false)}
            onConfirm={confirmRequestInfo}
            organizationName={registration.org_name_th}
            trackingCode={registration.tracking_code}
          />
        </>
      )}
    </>
  );
}
