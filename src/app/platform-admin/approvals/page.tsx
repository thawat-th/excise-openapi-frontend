'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/dashboard';
import { Check, Trash2, Eye } from 'lucide-react';
import { ApproveModal, RejectModal, RequestInfoModal } from '@/components/modals';
import { useLanguage } from '@/components/LanguageProvider';
import { AdvancedDataTable, AdvancedDataTableColumn } from '@/components/ui/AdvancedDataTable';
import { Checkbox } from '@/components/ui/checkbox';

interface Registration {
  id: string;
  tracking_code: string;
  org_name_th: string;
  org_name_en?: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'need_more_info';
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reject_reason?: string;
}

export default function PlatformAdminApprovalsPage() {
  const { language } = useLanguage();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRows, setSelectedRows] = useState<Registration[]>([]);

  // Modal states
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);

  // Demo data for wireframe review
  const DEMO_REGISTRATIONS: Registration[] = [
    { id: 'reg-001', tracking_code: 'ORG-2025-0001', org_name_th: 'บริษัท สรรพสามิตเทค จำกัด', org_name_en: 'Excise Tech Co., Ltd.', contact_email: 'admin@excisetech.co.th', contact_first_name: 'สมชาย', contact_last_name: 'วิทยากร', status: 'pending', created_at: '2025-12-15T10:30:00Z', updated_at: '2025-12-15T10:30:00Z' },
    { id: 'reg-002', tracking_code: 'ORG-2025-0002', org_name_th: 'บริษัท ดิจิทัลเกตเวย์ จำกัด', org_name_en: 'Digital Gateway Co., Ltd.', contact_email: 'info@dgw.co.th', contact_first_name: 'วิภา', contact_last_name: 'เทคโนโลยี', status: 'pending', created_at: '2025-12-14T09:00:00Z', updated_at: '2025-12-14T09:00:00Z' },
    { id: 'reg-003', tracking_code: 'ORG-2025-0003', org_name_th: 'บริษัท ไทยอินโนเวชั่น จำกัด (มหาชน)', org_name_en: 'Thai Innovation Plc.', contact_email: 'contact@thaiinno.co.th', contact_first_name: 'ประวิทย์', contact_last_name: 'นวัตกรรม', status: 'approved', created_at: '2025-12-10T14:20:00Z', updated_at: '2025-12-12T16:45:00Z', reviewed_by: 'admin', reviewed_at: '2025-12-12T16:45:00Z' },
    { id: 'reg-004', tracking_code: 'ORG-2025-0004', org_name_th: 'บริษัท คลาวด์เซอร์วิส จำกัด', org_name_en: 'Cloud Service Co., Ltd.', contact_email: 'api@cloudserv.co.th', contact_first_name: 'นภดล', contact_last_name: 'คลาวด์', status: 'need_more_info', created_at: '2025-12-08T11:15:00Z', updated_at: '2025-12-11T13:30:00Z' },
    { id: 'reg-005', tracking_code: 'ORG-2025-0005', org_name_th: 'สมาคมการค้าดิจิทัล', org_name_en: 'Digital Trade Association', contact_email: 'register@dta.or.th', contact_first_name: 'ศิริพร', contact_last_name: 'การค้า', status: 'rejected', created_at: '2025-12-05T08:45:00Z', updated_at: '2025-12-07T10:00:00Z', reviewed_by: 'admin', reviewed_at: '2025-12-07T10:00:00Z', reject_reason: 'เอกสารไม่ครบถ้วน' },
  ];

  // Fetch registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        page_size: '100',
      });

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/registrations/organization?${params.toString()}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data && data.data.data && data.data.data.length > 0) {
        setRegistrations(data.data.data);
      } else {
        // Fallback to demo data when backend is unavailable
        const filtered = statusFilter === 'all' || !statusFilter
          ? DEMO_REGISTRATIONS
          : DEMO_REGISTRATIONS.filter(r => r.status === statusFilter);
        setRegistrations(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      const filtered = statusFilter === 'all' || !statusFilter
        ? DEMO_REGISTRATIONS
        : DEMO_REGISTRATIONS.filter(r => r.status === statusFilter);
      setRegistrations(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Calculate stats
  const stats = [
    {
      label: 'Total Requests',
      value: registrations.length,
      color: 'gray' as const,
    },
    {
      label: 'Pending Review',
      value: registrations.filter(r => r.status === 'pending').length,
      color: 'amber' as const,
    },
    {
      label: 'Approved',
      value: registrations.filter(r => r.status === 'approved').length,
      color: 'emerald' as const,
    },
    {
      label: 'Rejected',
      value: registrations.filter(r => r.status === 'rejected').length,
      color: 'red' as const,
    },
  ];

  // Table columns
  const columns: AdvancedDataTableColumn<Registration>[] = [
    {
      id: 'select',
      label: '',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      exportable: false,
    },
    {
      id: 'tracking_code',
      label: 'Tracking Code',
      accessorKey: 'tracking_code',
      header: 'Tracking Code',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-gray-900 dark:text-white">
          {row.original.tracking_code}
        </span>
      ),
      sortable: true,
      groupable: true,
    },
    {
      id: 'org_name_th',
      label: 'Organization',
      accessorKey: 'org_name_th',
      header: 'Organization',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {row.original.org_name_th}
          </div>
          {row.original.org_name_en && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {row.original.org_name_en}
            </div>
          )}
        </div>
      ),
      sortable: true,
      groupable: true,
    },
    {
      id: 'contact',
      label: 'Contact',
      accessorFn: (row) => `${row.contact_first_name} ${row.contact_last_name}`,
      header: 'Contact',
      cell: ({ row }) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            {row.original.contact_first_name} {row.original.contact_last_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {row.original.contact_email}
          </div>
        </div>
      ),
      sortable: false,
    },
    {
      id: 'created_at',
      label: 'Created',
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {new Date(row.original.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'status',
      label: 'Status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusStyles = {
          pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50',
          approved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-900/50',
          rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50',
          need_more_info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50',
        };
        const statusLabels = {
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
          need_more_info: 'Need Info',
        };

        return (
          <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded shadow-sm border ${statusStyles[status]}`}>
            {statusLabels[status]}
          </span>
        );
      },
      sortable: true,
      groupable: true,
      aggregationFn: 'count',
      aggregatedCell: ({ getValue }) => `${getValue()} items`,
    },
    {
      id: 'actions',
      label: 'Actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => window.location.href = `/platform-admin/approvals/${row.original.id}`}
            className="px-3 py-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded text-xs font-medium transition-all hover:shadow-sm border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
          >
            View
          </button>
          {(row.original.status === 'pending' || row.original.status === 'need_more_info') && (
            <>
              <button
                onClick={() => {
                  setSelectedRegistration(row.original);
                  setShowApproveModal(true);
                }}
                className="px-3 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded text-xs font-medium transition-all hover:shadow-sm border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setSelectedRegistration(row.original);
                  setShowRejectModal(true);
                }}
                className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-medium transition-all hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedRegistration(row.original);
                  setShowRequestInfoModal(true);
                }}
                className="px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-xs font-medium transition-all hover:shadow-sm border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                Request Info
              </button>
            </>
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      exportable: false,
    },
  ];

  // Bulk actions
  const handleBulkApprove = async (rows: Registration[]) => {
    for (const reg of rows) {
      await fetch(`/api/registrations/organization/${reg.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' }),
      });
    }
    fetchRegistrations();
  };

  const handleBulkReject = async (rows: Registration[]) => {
    for (const reg of rows) {
      await fetch(`/api/registrations/organization/${reg.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected', reason: 'Bulk rejection' }),
      });
    }
    fetchRegistrations();
  };

  // Modal handlers
  const confirmApprove = async () => {
    if (!selectedRegistration) return;
    await fetch(`/api/registrations/organization/${selectedRegistration.id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'approved' }),
    });
    setShowApproveModal(false);
    fetchRegistrations();
  };

  const confirmReject = async (reason: string) => {
    if (!selectedRegistration) return;
    await fetch(`/api/registrations/organization/${selectedRegistration.id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'rejected', reason }),
    });
    setShowRejectModal(false);
    fetchRegistrations();
  };

  const confirmRequestInfo = async (message: string) => {
    if (!selectedRegistration) return;
    await fetch(`/api/registrations/organization/${selectedRegistration.id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'need_more_info', reason: message }),
    });
    setShowRequestInfoModal(false);
    fetchRegistrations();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-20"></div>
      </div>

      <PageHeader
        title="Organization Approvals"
        description="Review and approve organization registration requests"
        breadcrumbs={[
          { label: 'Platform Admin', href: '/platform-admin/dashboard' },
          { label: 'Workflow Management' },
          { label: 'Approvals' },
        ]}
      />

      <AdvancedDataTable
        columns={columns}
        data={registrations}
        stats={stats}
        enableRowSelection={true}
        enableGrouping={true}
        enableExport={true}
        enableColumnVisibility={true}
        enableBulkActions={true}
        enableSearch={true}
        exportFileName="organization-approvals"
        searchPlaceholder="Search by tracking code, organization name, or email"
        statusFilter={{
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Need Info', value: 'need_more_info' },
          ],
        }}
        onRowSelectionChange={setSelectedRows}
        bulkActions={[
          {
            label: 'Approve All',
            icon: <Check className="w-4 h-4" />,
            color: 'emerald',
            onClick: handleBulkApprove,
          },
          {
            label: 'Reject All',
            icon: <Trash2 className="w-4 h-4" />,
            color: 'red',
            onClick: handleBulkReject,
          },
        ]}
      />

      {/* Modals */}
      {selectedRegistration && (
        <>
          <ApproveModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={confirmApprove}
            organizationName={selectedRegistration.org_name_th}
            trackingCode={selectedRegistration.tracking_code}
          />
          <RejectModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onConfirm={confirmReject}
            organizationName={selectedRegistration.org_name_th}
            trackingCode={selectedRegistration.tracking_code}
          />
          <RequestInfoModal
            isOpen={showRequestInfoModal}
            onClose={() => setShowRequestInfoModal(false)}
            onConfirm={confirmRequestInfo}
            organizationName={selectedRegistration.org_name_th}
            trackingCode={selectedRegistration.tracking_code}
          />
        </>
      )}
    </>
  );
}
