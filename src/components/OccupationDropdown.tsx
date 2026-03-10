'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { ChevronDown, Loader2, Search, X, Check } from 'lucide-react';

interface Occupation {
  code: string;
  name_th: string;
  name_en: string;
  tisco_major_group: number;
}

interface OccupationApiResponse {
  success: boolean;
  data?: {
    data: Occupation[];
    total: number;
  };
  error?: string;
}

export interface OccupationData {
  code: string;
  name: string;
  isOther: boolean;
  otherText: string;
}

interface OccupationDropdownProps {
  value: OccupationData;
  onChange: (data: OccupationData) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

// Code for "Other" option
const OTHER_CODE = 'DOPA_EXT-047';

export function OccupationDropdown({
  value,
  onChange,
  disabled = false,
  error,
  required = false,
}: OccupationDropdownProps) {
  const { language } = useLanguage();
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOccupations();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const fetchOccupations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/occupations');
      const data: OccupationApiResponse = await res.json();
      if (data.success && data.data) {
        setOccupations(data.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch occupations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getName = useCallback((occupation: Occupation) => {
    return language === 'th' ? occupation.name_th : occupation.name_en;
  }, [language]);

  const filteredOccupations = occupations.filter((occupation) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      occupation.name_th.toLowerCase().includes(search) ||
      occupation.name_en.toLowerCase().includes(search)
    );
  });

  const handleSelect = (occupation: Occupation) => {
    const isOther = occupation.code === OTHER_CODE;
    onChange({
      code: occupation.code,
      name: getName(occupation),
      isOther,
      otherText: isOther ? value.otherText : '',
    });
    setIsOpen(false);
    setSearchText('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      code: '',
      name: '',
      isOther: false,
      otherText: '',
    });
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      otherText: e.target.value,
    });
  };

  const toggleDropdown = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchText('');
      }
    }
  };

  const selectedOccupation = occupations.find(o => o.code === value.code);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
          {t(language, 'auth.register.occupation')} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="relative" ref={dropdownRef}>
          {/* Trigger Button */}
          <button
            type="button"
            onClick={toggleDropdown}
            disabled={disabled || loading}
            className={`
              w-full text-left input-field pr-10
              dark:bg-slate-700 dark:border-slate-600 dark:text-white
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'bg-gray-100 dark:bg-slate-600 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {selectedOccupation ? (
              <span>{getName(selectedOccupation)}</span>
            ) : (
              <span className="text-gray-400 dark:text-slate-500">
                {t(language, 'auth.register.selectOccupation')}
              </span>
            )}
          </button>

          {/* Icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {value.code && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-excise-400" />
            ) : (
              <ChevronDown className={`w-4 h-4 text-excise-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </div>

          {/* Dropdown Panel */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200 dark:border-slate-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={language === 'th' ? 'ค้นหาอาชีพ...' : 'Search occupation...'}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-md
                      bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOccupations.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                    {language === 'th' ? 'ไม่พบอาชีพที่ค้นหา' : 'No occupation found'}
                  </div>
                ) : (
                  filteredOccupations.map((occupation) => (
                    <button
                      key={occupation.code}
                      type="button"
                      onClick={() => handleSelect(occupation)}
                      className={`
                        w-full text-left px-4 py-2.5 text-sm flex items-center justify-between
                        hover:bg-gray-100 dark:hover:bg-slate-700
                        ${value.code === occupation.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}
                      `}
                    >
                      <span>{getName(occupation)}</span>
                      {value.code === occupation.code && (
                        <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>
        )}
      </div>

      {/* Show text input when "Other" is selected */}
      {value.isOther && (
        <div>
          <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
            {t(language, 'auth.register.occupationOtherSpecify')} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value.otherText}
            onChange={handleOtherTextChange}
            disabled={disabled}
            className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            placeholder={t(language, 'auth.register.occupationOtherPlaceholder')}
            maxLength={100}
          />
        </div>
      )}
    </div>
  );
}

export default OccupationDropdown;
