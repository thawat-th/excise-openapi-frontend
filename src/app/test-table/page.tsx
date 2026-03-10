'use client';

import { useState } from 'react';
import { AdvancedDataTable, AdvancedDataTableColumn } from '@/components/ui/AdvancedDataTable';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Trash2 } from 'lucide-react';

interface SampleData {
  id: string;
  tracking_code: string;
  org_name_th: string;
  org_name_en?: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'need_more_info';
  created_at: string;
}

// Sample data for testing
const sampleData: SampleData[] = [
  {
    id: '1',
    tracking_code: 'ORG-2024-001',
    org_name_th: 'บริษัท ทดสอบ จำกัด',
    org_name_en: 'Test Company Limited',
    contact_email: 'test1@example.com',
    contact_first_name: 'สมชาย',
    contact_last_name: 'ทดสอบ',
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    tracking_code: 'ORG-2024-002',
    org_name_th: 'บริษัท ตัวอย่าง จำกัด',
    org_name_en: 'Example Corporation',
    contact_email: 'test2@example.com',
    contact_first_name: 'สมหญิง',
    contact_last_name: 'ตัวอย่าง',
    status: 'approved',
    created_at: '2024-01-16T11:00:00Z',
  },
  {
    id: '3',
    tracking_code: 'ORG-2024-003',
    org_name_th: 'ห้างหุ้นส่วน ทดสอบ',
    org_name_en: 'Test Partnership',
    contact_email: 'test3@example.com',
    contact_first_name: 'สมศักดิ์',
    contact_last_name: 'ทดลอง',
    status: 'rejected',
    created_at: '2024-01-17T14:20:00Z',
  },
  {
    id: '4',
    tracking_code: 'ORG-2024-004',
    org_name_th: 'บริษัท เทคโนโลยี จำกัด',
    org_name_en: 'Technology Co., Ltd.',
    contact_email: 'test4@example.com',
    contact_first_name: 'สมพร',
    contact_last_name: 'เทสต์',
    status: 'need_more_info',
    created_at: '2024-01-18T09:15:00Z',
  },
  {
    id: '5',
    tracking_code: 'ORG-2024-005',
    org_name_th: 'บริษัท ดิจิทัล จำกัด',
    org_name_en: 'Digital Company Ltd.',
    contact_email: 'test5@example.com',
    contact_first_name: 'สมบูรณ์',
    contact_last_name: 'ทดสอบระบบ',
    status: 'pending',
    created_at: '2024-01-19T15:45:00Z',
  },
  {
    id: '6',
    tracking_code: 'ORG-2024-006',
    org_name_th: 'บริษัท โซลูชั่น จำกัด',
    org_name_en: 'Solutions Inc.',
    contact_email: 'test6@example.com',
    contact_first_name: 'สมใจ',
    contact_last_name: 'ทดลองระบบ',
    status: 'approved',
    created_at: '2024-01-20T08:30:00Z',
  },
];

export default function TestTablePage() {
  const [data, setData] = useState<SampleData[]>(sampleData);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<SampleData[]>([]);

  // Filter data by status
  const filteredData = statusFilter === 'all'
    ? data
    : data.filter(item => item.status === statusFilter);

  // Calculate stats
  const stats = [
    {
      label: 'Total Requests',
      value: data.length,
      color: 'gray' as const,
    },
    {
      label: 'Pending Review',
      value: data.filter(r => r.status === 'pending').length,
      color: 'amber' as const,
    },
    {
      label: 'Approved',
      value: data.filter(r => r.status === 'approved').length,
      color: 'emerald' as const,
    },
    {
      label: 'Rejected',
      value: data.filter(r => r.status === 'rejected').length,
      color: 'red' as const,
    },
  ];

  // Table columns
  const columns: AdvancedDataTableColumn<SampleData>[] = [
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
            onClick={() => alert(`View: ${row.original.tracking_code}`)}
            className="px-3 py-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded text-xs font-medium transition-all hover:shadow-sm border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
          >
            View
          </button>
          {(row.original.status === 'pending' || row.original.status === 'need_more_info') && (
            <>
              <button
                onClick={() => alert(`Approve: ${row.original.tracking_code}`)}
                className="px-3 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded text-xs font-medium transition-all hover:shadow-sm border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
              >
                Approve
              </button>
              <button
                onClick={() => alert(`Reject: ${row.original.tracking_code}`)}
                className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-medium transition-all hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
              >
                Reject
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
  const handleBulkApprove = (rows: SampleData[]) => {
    alert(`Bulk approve ${rows.length} items:\n${rows.map(r => r.tracking_code).join('\n')}`);
  };

  const handleBulkReject = (rows: SampleData[]) => {
    alert(`Bulk reject ${rows.length} items:\n${rows.map(r => r.tracking_code).join('\n')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Advanced DataTable Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all features: sorting, filtering, grouping, pagination, Excel export, bulk actions
          </p>
        </div>

        <AdvancedDataTable
          columns={columns}
          data={filteredData}
          stats={stats}
          enableRowSelection={true}
          enableGrouping={true}
          enableExport={true}
          enableColumnVisibility={true}
          enableBulkActions={true}
          enableSearch={true}
          exportFileName="test-data"
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

        <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold mb-2">Testing Instructions:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li> <strong>Search</strong>: Type in search box to filter</li>
            <li> <strong>Sort</strong>: Click column headers (with sort icon)</li>
            <li> <strong>Group</strong>: Click 📊 icon on Status/Organization/Tracking Code</li>
            <li> <strong>Filter</strong>: Use Status dropdown</li>
            <li> <strong>Columns</strong>: Click Columns button to show/hide</li>
            <li> <strong>Export</strong>: Click Export button → Download Excel</li>
            <li> <strong>Select</strong>: Check checkboxes → Try bulk actions</li>
            <li> <strong>Pagination</strong>: Change rows per page & navigate</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
