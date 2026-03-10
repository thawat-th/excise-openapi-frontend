'use client';

import Link from 'next/link';
import { Clock, Users, Star, ArrowRight, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ApiCardProps {
  id: string;
  name: string;
  nameTh?: string;
  description: string;
  descriptionTh?: string;
  category: string;
  categoryTh?: string;
  version: string;
  subscribers: number;
  rating: number;
  responseTime: string;
  status: 'stable' | 'beta' | 'deprecated';
  isSubscribed?: boolean;
  basePath: string;
}

const statusConfig = {
  stable: { label: 'Stable', labelTh: 'เสถียร', color: 'bg-emerald-100 text-emerald-700' },
  beta: { label: 'Beta', labelTh: 'เบต้า', color: 'bg-amber-100 text-amber-700' },
  deprecated: { label: 'Deprecated', labelTh: 'เลิกใช้', color: 'bg-red-100 text-red-700' },
};

const categoryColors: Record<string, string> = {
  'Tax': 'from-blue-500 to-blue-600',
  'License': 'from-purple-500 to-purple-600',
  'Payment': 'from-emerald-500 to-emerald-600',
  'Identity': 'from-orange-500 to-orange-600',
  'Report': 'from-pink-500 to-pink-600',
  'default': 'from-gray-500 to-gray-600',
};

export function ApiCard({
  id,
  name,
  nameTh,
  description,
  descriptionTh,
  category,
  categoryTh,
  version,
  subscribers,
  rating,
  responseTime,
  status,
  isSubscribed,
  basePath,
}: ApiCardProps) {
  const statusInfo = statusConfig[status];
  const categoryColor = categoryColors[category] || categoryColors.default;

  return (
    <Link
      href={`${basePath}/catalog/${id}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Category Header */}
      <div className={cn('h-2 bg-gradient-to-r', categoryColor)} />

      <div className="p-6">
        {/* Top Row: Category & Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {categoryTh || category}
          </span>
          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusInfo.color)}>
            {statusInfo.labelTh || statusInfo.label}
          </span>
        </div>

        {/* API Name & Version */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {nameTh || name}
          </h3>
          <span className="text-xs text-gray-400">v{version}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
          {descriptionTh || description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{subscribers.toLocaleString()} ผู้ใช้</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>{responseTime}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {isSubscribed ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <Shield className="w-4 h-4" />
              สมัครใช้งานแล้ว
            </span>
          ) : (
            <span className="text-xs text-gray-400">คลิกเพื่อดูรายละเอียด</span>
          )}
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}

// Featured API Card (larger variant)
export function FeaturedApiCard({
  id,
  name,
  nameTh,
  description,
  descriptionTh,
  category,
  categoryTh,
  version,
  subscribers,
  rating,
  responseTime,
  status,
  basePath,
}: ApiCardProps) {
  const statusInfo = statusConfig[status];
  const categoryColor = categoryColors[category] || categoryColors.default;

  return (
    <Link
      href={`${basePath}/catalog/${id}`}
      className="group relative block bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Gradient Background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity', categoryColor)} />

      <div className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full mb-3">
              แนะนำ
            </span>
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
              {nameTh || name}
            </h3>
            <span className="text-sm text-gray-400">v{version} • {categoryTh || category}</span>
          </div>
          <span className={cn('px-3 py-1.5 text-sm font-medium rounded-full', statusInfo.color)}>
            {statusInfo.labelTh || statusInfo.label}
          </span>
        </div>

        <p className="text-gray-600 mb-6 line-clamp-3">
          {descriptionTh || description}
        </p>

        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{subscribers.toLocaleString()} ผู้ใช้</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{rating.toFixed(1)} คะแนน</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>{responseTime}</span>
          </div>
        </div>

        <div className="flex items-center text-primary-600 font-medium group-hover:gap-3 gap-2 transition-all">
          <span>ดูรายละเอียด</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
