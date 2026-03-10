'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Layers,
  CreditCard,
  FileText,
  Shield,
  BarChart3,
  Settings,
  Filter,
  X
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  nameTh: string;
  icon: React.ElementType;
  count: number;
}

const defaultCategories: Category[] = [
  { id: 'all', name: 'All APIs', nameTh: 'ทั้งหมด', icon: Layers, count: 24 },
  { id: 'tax', name: 'Tax', nameTh: 'ภาษี', icon: FileText, count: 8 },
  { id: 'license', name: 'License', nameTh: 'ใบอนุญาต', icon: Shield, count: 6 },
  { id: 'payment', name: 'Payment', nameTh: 'การชำระเงิน', icon: CreditCard, count: 4 },
  { id: 'identity', name: 'Identity', nameTh: 'พิสูจน์ตัวตน', icon: Shield, count: 3 },
  { id: 'report', name: 'Report', nameTh: 'รายงาน', icon: BarChart3, count: 3 },
];

interface CategoryFilterProps {
  categories?: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryFilter({
  categories = defaultCategories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4" />
        หมวดหมู่
      </h3>
      <ul className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <li key={category.id}>
              <button
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isSelected
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-4 h-4', isSelected && 'text-primary-600')} />
                <span className="flex-1 text-left">{category.nameTh}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isSelected
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {category.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Mobile Category Pills
interface CategoryPillsProps {
  categories?: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryPills({
  categories = defaultCategories,
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              isSelected
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
            )}
          >
            {category.nameTh}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              isSelected
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500'
            )}>
              {category.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Active Filters Display
interface ActiveFiltersProps {
  filters: { key: string; label: string }[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500">ตัวกรอง:</span>
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onRemove(filter.key)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
        >
          {filter.label}
          <X className="w-3.5 h-3.5" />
        </button>
      ))}
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ล้างทั้งหมด
        </button>
      )}
    </div>
  );
}
