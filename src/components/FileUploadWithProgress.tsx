'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import Image from 'next/image';

export interface UploadOptions {
  url: string;
  fieldName?: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export interface FileUploadWithProgressProps {
  accept?: string[];
  maxSize?: number;
  label?: string;
  description?: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  showPreview?: boolean;
  id?: string;

  /**
   * Upload configuration (if provided, enables immediate upload on file select)
   */
  uploadOptions?: UploadOptions;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

const ACCEPTED_MIME_TYPES = {
  'application/pdf': { ext: '.pdf', icon: FileText, color: 'text-red-500' },
  'image/jpeg': { ext: '.jpg', icon: ImageIcon, color: 'text-blue-500' },
  'image/jpg': { ext: '.jpg', icon: ImageIcon, color: 'text-blue-500' },
  'image/png': { ext: '.png', icon: ImageIcon, color: 'text-green-500' },
};

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPT = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export function FileUploadWithProgress({
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
  uploadOptions,
}: FileUploadWithProgressProps) {
  const { language } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (accept.length > 0 && !accept.includes(file.type)) {
      return t(language, 'common.errors.invalidFileType');
    }

    if (file.size > maxSize) {
      return t(language, 'common.errors.fileTooLarge')
        .replace('{max}', formatFileSize(maxSize));
    }

    return null;
  };

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

  const uploadFile = async (file: File) => {
    if (!uploadOptions) return;

    const formData = new FormData();
    formData.append(uploadOptions.fieldName || 'file', file);

    abortControllerRef.current = new AbortController();

    try {
      setUploadState({ uploading: true, progress: 0, error: null });

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState(prev => ({ ...prev, progress }));
          uploadOptions.onProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setUploadState({ uploading: false, progress: 100, error: null });
          uploadOptions.onSuccess?.(response);
        } else {
          const error = new Error(`Upload failed: ${xhr.statusText}`);
          setUploadState({ uploading: false, progress: 0, error: error.message });
          uploadOptions.onError?.(error);
        }
      });

      xhr.addEventListener('error', () => {
        const error = new Error('Network error during upload');
        setUploadState({ uploading: false, progress: 0, error: error.message });
        uploadOptions.onError?.(error);
      });

      xhr.addEventListener('abort', () => {
        setUploadState({ uploading: false, progress: 0, error: 'Upload cancelled' });
      });

      xhr.open('POST', uploadOptions.url);
      xhr.send(formData);

      abortControllerRef.current.signal.addEventListener('abort', () => {
        xhr.abort();
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      setUploadState({ uploading: false, progress: 0, error: error.message });
      uploadOptions.onError?.(error);
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      onChange(null);
      setPreview(null);
      setUploadState({ uploading: false, progress: 0, error: null });
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      onChange(null);
      return;
    }

    onChange(selectedFile);
    if (showPreview) {
      generatePreview(selectedFile);
    }

    if (uploadOptions) {
      uploadFile(selectedFile);
    }
  };

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

  const handleClick = () => {
    if (!uploadState.uploading) {
      inputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleCancelUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    abortControllerRef.current?.abort();
    setUploadState({ uploading: false, progress: 0, error: null });
  };

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
      {label && (
        <label className="block text-sm font-medium text-excise-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {description && (
        <p className="text-xs text-excise-500 dark:text-slate-400">
          {description}
        </p>
      )}

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg transition-all
          ${uploadState.uploading ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
            : file
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : error || uploadState.error
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'border-excise-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          }
        `}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept.join(',')}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
          disabled={uploadState.uploading}
        />

        {file ? (
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
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

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-excise-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-excise-500 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {uploadState.uploading ? (
                  <Loader2 className="w-5 h-5 text-primary-500 animate-spin flex-shrink-0" />
                ) : uploadState.progress === 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : null}
              </div>

              {uploadState.uploading ? (
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                  aria-label="Cancel upload"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                  aria-label={t(language, 'common.remove')}
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              )}
            </div>

            {uploadState.uploading && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-excise-600 dark:text-slate-400 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadState.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              </div>
            )}
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

      {(error || uploadState.error) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error || uploadState.error}
        </p>
      )}
    </div>
  );
}
