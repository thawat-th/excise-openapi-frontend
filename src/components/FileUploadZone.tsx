'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import Image from 'next/image';

export interface FileUploadZoneProps {
  /**
   * Accepted file types (MIME types)
   * @example ['application/pdf', 'image/jpeg', 'image/png']
   */
  accept?: string[];

  /**
   * Maximum file size in bytes
   * @default 5MB
   */
  maxSize?: number;

  /**
   * Label text for the upload zone
   */
  label?: string;

  /**
   * Description text shown below the label
   */
  description?: string;

  /**
   * Whether the file is required
   */
  required?: boolean;

  /**
   * Current uploaded file
   */
  file: File | null;

  /**
   * Callback when file changes
   */
  onChange: (file: File | null) => void;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether to show file preview
   * @default true
   */
  showPreview?: boolean;

  /**
   * Unique ID for the input element
   */
  id?: string;
}

const ACCEPTED_MIME_TYPES = {
  'application/pdf': { ext: '.pdf', icon: FileText, color: 'text-red-500' },
  'image/jpeg': { ext: '.jpg', icon: ImageIcon, color: 'text-blue-500' },
  'image/jpg': { ext: '.jpg', icon: ImageIcon, color: 'text-blue-500' },
  'image/png': { ext: '.png', icon: ImageIcon, color: 'text-green-500' },
};

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPT = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export function FileUploadZone({
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  label,
  description,
  required = false,
  file,
  onChange,
  error,
  showPreview = true,
  id,
}: FileUploadZoneProps) {
  const { language } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (accept.length > 0 && !accept.includes(file.type)) {
      return t(language, 'common.errors.invalidFileType');
    }

    // Check file size
    if (file.size > maxSize) {
      return t(language, 'common.errors.fileTooLarge')
        .replace('{max}', formatFileSize(maxSize));
    }

    return null;
  };

  // Generate preview for image files
  const generatePreview = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      onChange(null);
      setPreview(null);
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      // Trigger error through parent component
      onChange(null);
      return;
    }

    onChange(selectedFile);
    if (showPreview) {
      generatePreview(selectedFile);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  // Handle click to open file dialog
  const handleClick = () => {
    inputRef.current?.click();
  };

  // Handle remove file
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    const iconData = ACCEPTED_MIME_TYPES[fileType as keyof typeof ACCEPTED_MIME_TYPES];
    if (iconData) {
      const Icon = iconData.icon;
      return <Icon className={`w-5 h-5 ${iconData.color}`} />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-excise-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-excise-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {/* Upload Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg transition-all cursor-pointer
          ${isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
            : file
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : error
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'border-excise-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          }
        `}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept.join(',')}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        {/* Content */}
        {file ? (
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* File icon or image preview */}
                {preview ? (
                  <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gray-200 dark:border-slate-600">
                    <Image
                      src={preview}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-excise-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-excise-500 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Success indicator */}
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                aria-label={t(language, 'common.remove')}
              >
                <X className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-excise-400 dark:text-slate-500" />
              <div>
                <p className="text-sm font-medium text-excise-700 dark:text-slate-300">
                  {t(language, 'common.dragDropOrClick')}
                </p>
                <p className="text-xs text-excise-500 dark:text-slate-400 mt-1">
                  {t(language, 'common.acceptedFormats')}: {accept.map(type =>
                    ACCEPTED_MIME_TYPES[type as keyof typeof ACCEPTED_MIME_TYPES]?.ext || type
                  ).join(', ')}
                </p>
                <p className="text-xs text-excise-500 dark:text-slate-400">
                  {t(language, 'common.maxFileSize')}: {formatFileSize(maxSize)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
