'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { ChevronDown, Loader2, Search, X, Check } from 'lucide-react';

// Types from governance API
interface Province {
  code: string;
  name_th: string;
  name_en: string;
}

interface District {
  code: string;
  province_code: string;
  name_th: string;
  name_en: string;
}

interface Subdistrict {
  code: string;
  district_code: string;
  name_th: string;
  name_en: string;
}

export interface ThaiAddressData {
  province: string;
  provinceCode: string;
  district: string;
  districtCode: string;
  subdistrict: string;
  subdistrictCode: string;
  postalCode: string;
}

interface ThaiAddressDropdownProps {
  value: ThaiAddressData;
  onChange: (data: ThaiAddressData) => void;
  disabled?: boolean;
  errors?: {
    province?: string;
    district?: string;
    subdistrict?: string;
    postalCode?: string;
  };
}

// Reusable Searchable Select Component
interface SearchableSelectProps<T> {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  items: T[];
  selectedCode: string;
  loading: boolean;
  disabled: boolean;
  error?: string;
  required?: boolean;
  getName: (item: T) => string;
  getCode: (item: T) => string;
  onSelect: (item: T) => void;
  onClear: () => void;
}

function SearchableSelect<T>({
  label,
  placeholder,
  searchPlaceholder,
  noResultsText,
  items,
  selectedCode,
  loading,
  disabled,
  error,
  required = true,
  getName,
  getCode,
  onSelect,
  onClear,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const filteredItems = items.filter((item) => {
    if (!searchText) return true;
    const name = getName(item).toLowerCase();
    return name.includes(searchText.toLowerCase());
  });

  const selectedItem = items.find(item => getCode(item) === selectedCode);

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
    setSearchText('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
  };

  const toggleDropdown = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchText('');
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
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
          {selectedItem ? (
            <span>{getName(selectedItem)}</span>
          ) : (
            <span className="text-gray-400 dark:text-slate-500">{placeholder}</span>
          )}
        </button>

        {/* Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {selectedCode && !disabled && (
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
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-md
                    bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                  {noResultsText}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={getCode(item)}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`
                      w-full text-left px-4 py-2.5 text-sm flex items-center justify-between
                      hover:bg-gray-100 dark:hover:bg-slate-700
                      ${selectedCode === getCode(item) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}
                    `}
                  >
                    <span>{getName(item)}</span>
                    {selectedCode === getCode(item) && (
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
  );
}

export function ThaiAddressDropdown({
  value,
  onChange,
  disabled = false,
  errors = {},
}: ThaiAddressDropdownProps) {
  const { language } = useLanguage();

  // Data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);
  const [loadingPostalCode, setLoadingPostalCode] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (value.provinceCode) {
      fetchDistricts(value.provinceCode);
    } else {
      setDistricts([]);
    }
  }, [value.provinceCode]);

  // Fetch subdistricts when district changes
  useEffect(() => {
    if (value.districtCode) {
      fetchSubdistricts(value.districtCode);
    } else {
      setSubdistricts([]);
    }
  }, [value.districtCode]);

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const res = await fetch('/api/geo/provinces');
      const data = await res.json();
      if (data.success) {
        setProvinces(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    setLoadingDistricts(true);
    try {
      const res = await fetch(`/api/geo/provinces/${provinceCode}/districts`);
      const data = await res.json();
      if (data.success) {
        setDistricts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchSubdistricts = async (districtCode: string) => {
    setLoadingSubdistricts(true);
    try {
      const res = await fetch(`/api/geo/districts/${districtCode}/subdistricts`);
      const data = await res.json();
      if (data.success) {
        setSubdistricts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subdistricts:', error);
    } finally {
      setLoadingSubdistricts(false);
    }
  };

  const fetchPostalCodeBySubdistrict = async (subdistrictCode: string): Promise<string> => {
    setLoadingPostalCode(true);
    try {
      const res = await fetch(`/api/geo/subdistricts/${subdistrictCode}/postalcode`);
      const data = await res.json();
      if (data.success && data.data) {
        return data.data.postal_code || '';
      }
    } catch (error) {
      console.error('Failed to fetch postal code:', error);
    } finally {
      setLoadingPostalCode(false);
    }
    return '';
  };

  const getName = useCallback((item: Province | District | Subdistrict) => {
    return language === 'th' ? item.name_th : item.name_en;
  }, [language]);

  const handleProvinceSelect = (province: Province) => {
    onChange({
      province: getName(province),
      provinceCode: province.code,
      district: '',
      districtCode: '',
      subdistrict: '',
      subdistrictCode: '',
      postalCode: '',
    });
  };

  const handleProvinceClear = () => {
    onChange({
      province: '',
      provinceCode: '',
      district: '',
      districtCode: '',
      subdistrict: '',
      subdistrictCode: '',
      postalCode: '',
    });
  };

  const handleDistrictSelect = (district: District) => {
    onChange({
      ...value,
      district: getName(district),
      districtCode: district.code,
      subdistrict: '',
      subdistrictCode: '',
      postalCode: '',
    });
  };

  const handleDistrictClear = () => {
    onChange({
      ...value,
      district: '',
      districtCode: '',
      subdistrict: '',
      subdistrictCode: '',
      postalCode: '',
    });
  };

  const handleSubdistrictSelect = async (subdistrict: Subdistrict) => {
    // Auto-fetch postal code
    let postalCode = '';
    if (subdistrict.code) {
      postalCode = await fetchPostalCodeBySubdistrict(subdistrict.code);
    }

    onChange({
      ...value,
      subdistrict: getName(subdistrict),
      subdistrictCode: subdistrict.code,
      postalCode,
    });
  };

  const handleSubdistrictClear = () => {
    onChange({
      ...value,
      subdistrict: '',
      subdistrictCode: '',
      postalCode: '',
    });
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      postalCode: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Province */}
      <SearchableSelect
        label={t(language, 'auth.register.province')}
        placeholder={t(language, 'auth.register.selectProvince')}
        searchPlaceholder={language === 'th' ? 'ค้นหาจังหวัด...' : 'Search province...'}
        noResultsText={language === 'th' ? 'ไม่พบจังหวัดที่ค้นหา' : 'No province found'}
        items={provinces}
        selectedCode={value.provinceCode}
        loading={loadingProvinces}
        disabled={disabled}
        error={errors.province}
        getName={getName}
        getCode={(p) => p.code}
        onSelect={handleProvinceSelect}
        onClear={handleProvinceClear}
      />

      {/* District */}
      <SearchableSelect
        label={t(language, 'auth.register.district')}
        placeholder={t(language, 'auth.register.selectDistrict')}
        searchPlaceholder={language === 'th' ? 'ค้นหาอำเภอ/เขต...' : 'Search district...'}
        noResultsText={language === 'th' ? 'ไม่พบอำเภอ/เขตที่ค้นหา' : 'No district found'}
        items={districts}
        selectedCode={value.districtCode}
        loading={loadingDistricts}
        disabled={disabled || !value.provinceCode}
        error={errors.district}
        getName={getName}
        getCode={(d) => d.code}
        onSelect={handleDistrictSelect}
        onClear={handleDistrictClear}
      />

      {/* Subdistrict */}
      <SearchableSelect
        label={t(language, 'auth.register.subdistrict')}
        placeholder={t(language, 'auth.register.selectSubdistrict')}
        searchPlaceholder={language === 'th' ? 'ค้นหาตำบล/แขวง...' : 'Search subdistrict...'}
        noResultsText={language === 'th' ? 'ไม่พบตำบล/แขวงที่ค้นหา' : 'No subdistrict found'}
        items={subdistricts}
        selectedCode={value.subdistrictCode}
        loading={loadingSubdistricts}
        disabled={disabled || !value.districtCode}
        error={errors.subdistrict}
        getName={getName}
        getCode={(s) => s.code}
        onSelect={handleSubdistrictSelect}
        onClear={handleSubdistrictClear}
      />

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
          {t(language, 'auth.register.postalCode')} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={value.postalCode}
            onChange={handlePostalCodeChange}
            disabled={disabled}
            className={`input-field max-w-[150px] dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.postalCode ? 'border-red-500' : ''}`}
            placeholder="10000"
            maxLength={5}
          />
          {loadingPostalCode && (
            <div className="absolute inset-y-0 right-16 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-excise-400" />
            </div>
          )}
        </div>
        {errors.postalCode && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.postalCode}</p>
        )}
        <p className="text-xs text-excise-500 dark:text-slate-500 mt-1">
          {t(language, 'auth.register.postalCodeAutoFill')}
        </p>
      </div>
    </div>
  );
}

export default ThaiAddressDropdown;
