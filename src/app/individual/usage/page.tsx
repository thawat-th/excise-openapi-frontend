'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  AlertTriangle,
  Calendar,
  Download,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock usage data
const usageOverview = {
  totalRequests: 26510,
  totalRequestsChange: 12.5,
  avgResponseTime: 145,
  avgResponseTimeChange: -8.2,
  errorRate: 0.3,
  errorRateChange: -0.1,
  quota: 100000,
  quotaUsed: 26510,
};

const apiUsageData = [
  {
    id: 'tax-calculation',
    name: 'API คำนวณภาษี',
    requests: 15420,
    quota: 50000,
    avgResponseTime: 120,
    errorRate: 0.2,
    trend: 'up' as const,
    trendValue: 15.3,
  },
  {
    id: 'payment-gateway',
    name: 'API ชำระเงิน',
    requests: 8750,
    quota: 30000,
    avgResponseTime: 180,
    errorRate: 0.5,
    trend: 'up' as const,
    trendValue: 8.7,
  },
  {
    id: 'product-lookup',
    name: 'API ค้นหาสินค้า',
    requests: 2340,
    quota: 20000,
    avgResponseTime: 95,
    errorRate: 0.1,
    trend: 'down' as const,
    trendValue: -5.2,
  },
];

// Mock chart data (for visualization)
const dailyUsageData = [
  { date: 'พ.ย. 25', requests: 850 },
  { date: 'พ.ย. 26', requests: 920 },
  { date: 'พ.ย. 27', requests: 1100 },
  { date: 'พ.ย. 28', requests: 980 },
  { date: 'พ.ย. 29', requests: 1250 },
  { date: 'พ.ย. 30', requests: 1180 },
  { date: 'ธ.ค. 1', requests: 890 },
];

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedApi, setSelectedApi] = useState('all');

  const quotaPercentage = (usageOverview.quotaUsed / usageOverview.quota) * 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การใช้งาน</h1>
          <p className="text-gray-500 mt-1">ติดตามการใช้งาน API และโควต้าของคุณ</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">7 วันที่ผ่านมา</option>
              <option value="30d">30 วันที่ผ่านมา</option>
              <option value="90d">90 วันที่ผ่านมา</option>
              <option value="1y">1 ปีที่ผ่านมา</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Export Button */}
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            ดาวน์โหลดรายงาน
          </button>
        </div>
      </div>

      {/* Quota Warning */}
      {quotaPercentage > 80 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              คุณใช้โควต้าไปแล้ว {quotaPercentage.toFixed(1)}%
            </p>
            <p className="text-sm text-amber-700 mt-1">
              พิจารณาอัปเกรดแพ็กเกจหากต้องการเพิ่มโควต้า
            </p>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-primary-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            <div className={cn(
              'flex items-center gap-1 text-sm',
              usageOverview.totalRequestsChange >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {usageOverview.totalRequestsChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(usageOverview.totalRequestsChange)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{usageOverview.totalRequests.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total Requests</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div className={cn(
              'flex items-center gap-1 text-sm',
              usageOverview.avgResponseTimeChange <= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {usageOverview.avgResponseTimeChange <= 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {Math.abs(usageOverview.avgResponseTimeChange)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{usageOverview.avgResponseTime}ms</p>
          <p className="text-sm text-gray-500 mt-1">Avg Response Time</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className={cn(
              'flex items-center gap-1 text-sm',
              usageOverview.errorRateChange <= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {usageOverview.errorRateChange <= 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {Math.abs(usageOverview.errorRateChange)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{usageOverview.errorRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Error Rate</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {usageOverview.quotaUsed.toLocaleString()}/{(usageOverview.quota / 1000)}K
          </p>
          <p className="text-sm text-gray-500 mt-1">โควต้าเดือนนี้</p>
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  quotaPercentage > 90 ? 'bg-red-500' :
                  quotaPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Requests รายวัน</h2>
          <select
            value={selectedApi}
            onChange={(e) => setSelectedApi(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">API ทั้งหมด</option>
            {apiUsageData.map((api) => (
              <option key={api.id} value={api.id}>{api.name}</option>
            ))}
          </select>
        </div>

        {/* Simple Bar Chart Visualization */}
        <div className="h-64 flex items-end gap-3">
          {dailyUsageData.map((day, index) => {
            const maxRequests = Math.max(...dailyUsageData.map((d) => d.requests));
            const heightPercent = (day.requests / maxRequests) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-48">
                  <div
                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all hover:from-primary-700 hover:to-primary-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Usage Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">รายละเอียดการใช้งานแต่ละ API</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">API</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Requests</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">โควต้า</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Response Time</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Error Rate</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">แนวโน้ม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apiUsageData.map((api) => {
                const usagePercent = (api.requests / api.quota) * 100;
                return (
                  <tr key={api.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{api.name}</td>
                    <td className="px-6 py-4 text-gray-600">{api.requests.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{usagePercent.toFixed(1)}%</span>
                          <span className="text-gray-400">{(api.quota / 1000)}K</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              usagePercent > 90 ? 'bg-red-500' :
                              usagePercent > 70 ? 'bg-amber-500' : 'bg-primary-500'
                            )}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{api.avgResponseTime}ms</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'text-sm',
                        api.errorRate > 1 ? 'text-red-600' :
                        api.errorRate > 0.5 ? 'text-amber-600' : 'text-emerald-600'
                      )}>
                        {api.errorRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        'flex items-center gap-1 text-sm',
                        api.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {api.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(api.trendValue)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
