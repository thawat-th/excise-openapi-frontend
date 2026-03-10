'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  useReactTable,
  GroupingState,
  ExpandedState,
  Row,
} from '@tanstack/react-table';
import { ArrowUpDown, Settings2, Download, ChevronRight, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';

export type AdvancedDataTableColumn<TData> = ColumnDef<TData> & {
  label?: string;
  sortable?: boolean;
  groupable?: boolean;
  exportable?: boolean;
}

interface AdvancedDataTableProps<TData> {
  columns: AdvancedDataTableColumn<TData>[];
  data: TData[];

  // Features
  enableRowSelection?: boolean;
  enableGrouping?: boolean;
  enableExport?: boolean;
  enableColumnVisibility?: boolean;
  enableBulkActions?: boolean;
  enableSearch?: boolean;

  // Customization
  exportFileName?: string;
  searchPlaceholder?: string;
  className?: string;

  // Stats
  stats?: Array<{
    label: string;
    value: number | string;
    color?: 'gray' | 'amber' | 'emerald' | 'red' | 'blue';
  }>;

  // Filters
  statusFilter?: {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ label: string; value: string }>;
  };

  // Callbacks
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    color?: 'emerald' | 'red' | 'gray';
    onClick: (selectedRows: TData[]) => void;
  }>;
}

export function AdvancedDataTable<TData>({
  columns,
  data,
  enableRowSelection = false,
  enableGrouping = false,
  enableExport = true,
  enableColumnVisibility = true,
  enableBulkActions = false,
  enableSearch = true,
  exportFileName = 'export',
  searchPlaceholder = 'Search by tracking code, organization name, or email',
  className = '',
  stats,
  statusFilter,
  onRowSelectionChange,
  bulkActions = [],
}: AdvancedDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      grouping,
      expanded,
      globalFilter,
    },
    enableRowSelection,
    enableGrouping,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Update parent when row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, table, onRowSelectionChange]);

  // Excel Export Function
  const handleExportToExcel = () => {
    const rows = table.getFilteredRowModel().rows;
    const exportData = rows.map(row => {
      const rowData: any = {};
      columns.forEach(column => {
        if (column.exportable !== false && column.id !== 'select' && column.id !== 'actions') {
          const cell = row.getAllCells().find(c => c.column.id === column.id);
          if (cell) {
            rowData[column.label || column.id || ''] = cell.getValue();
          }
        }
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
  };

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Bar */}
      {stats && stats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700">
            {stats.map((stat, idx) => {
              const colorClasses = {
                gray: 'hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-white',
                amber: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-amber-700 dark:text-amber-400',
                emerald: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
                red: 'hover:bg-red-50/50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400',
                blue: 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-blue-700 dark:text-blue-400',
              };
              const colorClass = colorClasses[stat.color || 'gray'];

              return (
                <div key={idx} className={`px-6 py-5 transition-colors ${colorClass}`}>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-semibold">{stat.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Data</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {table.getFilteredRowModel().rows.length} items
            </div>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          {/* Search */}
          {enableSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:shadow-md transition-shadow"
              />
            </div>
          )}

          {/* Status Filter */}
          {statusFilter && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Status:</label>
              <select
                value={statusFilter.value}
                onChange={(e) => statusFilter.onChange(e.target.value)}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                {statusFilter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                <span>Columns</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const colDef = columns.find(c => c.id === column.id);
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {colDef?.label || column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          {enableExport && (
            <button
              onClick={handleExportToExcel}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {enableBulkActions && selectedRowCount > 0 && (
          <div className="px-4 py-3 bg-primary-50 dark:bg-primary-950/30 border-t border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedRowCount} selected
              </span>
              <div className="flex items-center gap-2">
                {bulkActions.map((action, idx) => {
                  const colorClasses = {
                    emerald: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                    red: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
                    gray: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
                  };
                  const colorClass = colorClasses[action.color || 'gray'];

                  return (
                    <button
                      key={idx}
                      onClick={() => action.onClick(table.getFilteredSelectedRowModel().rows.map(r => r.original))}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-all flex items-center gap-1.5 ${colorClass}`}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => table.resetRowSelection()}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gradient-to-b from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-900/50 border-b-2 border-gray-200 dark:border-gray-700"
              >
                {headerGroup.headers.map((header) => {
                  const colDef = columns.find(c => c.id === header.column.id);

                  return (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left"
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {colDef?.sortable !== false && header.column.getCanSort() ? (
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                              className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                              {header.column.getIsSorted() && (
                                <ArrowUpDown className={`w-3 h-3 ${header.column.getIsSorted() === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} row={row} />
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Rows per page</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 w-[70px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 text-sm"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[180px] items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// TableRow component to handle grouped rows
function TableRow<TData>({ row }: { row: Row<TData> }) {
  if (row.getIsGrouped()) {
    return (
      <tr className="border-b bg-gray-100 dark:bg-gray-900/50 font-medium">
        <td colSpan={row.getAllCells().length} className="px-4 py-3">
          <button
            onClick={row.getToggleExpandedHandler()}
            className="flex items-center gap-2 hover:underline"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                row.getIsExpanded() ? 'rotate-90' : ''
              }`}
            />
            {flexRender(
              row.getAllCells()[0].column.columnDef.cell,
              row.getAllCells()[0].getContext()
            )}{' '}
            ({row.subRows.length})
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 hover:shadow-[inset_0_1px_0_0_rgba(0,0,0,0.05)] dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-150 ${
        row.getIsSelected() ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''
      }`}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="px-6 py-4 text-sm"
          style={{
            paddingLeft: cell.getIsPlaceholder() ? '0' : `${row.depth * 2 + 1.5}rem`,
          }}
        >
          {cell.getIsGrouped() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="flex items-center gap-2 font-medium hover:underline"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  row.getIsExpanded() ? 'rotate-90' : ''
                }`}
              />
              {flexRender(cell.column.columnDef.cell, cell.getContext())} (
              {row.subRows.length})
            </button>
          ) : cell.getIsAggregated() ? (
            flexRender(
              cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
              cell.getContext()
            )
          ) : cell.getIsPlaceholder() ? null : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </td>
      ))}
    </tr>
  );
}
