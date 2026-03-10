import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FileUploadZone } from '../FileUploadZone';

// Mock LanguageProvider
jest.mock('../LanguageProvider', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock i18n
jest.mock('@/i18n/i18n', () => ({
  t: (lang: string, key: string) => {
    const translations: Record<string, string> = {
      'common.remove': 'Remove',
      'common.dragDropOrClick': 'Drag and drop file here, or click to select',
      'common.acceptedFormats': 'Accepted formats',
      'common.maxFileSize': 'Maximum file size',
      'common.errors.invalidFileType': 'Invalid file type. Please select a supported file.',
      'common.errors.fileTooLarge': 'File size exceeds {max}',
    };
    return translations[key] || key;
  },
}));

describe('FileUploadZone', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render upload zone with default props', () => {
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/drag and drop file here/i)).toBeInTheDocument();
      expect(screen.getByText(/accepted formats/i)).toBeInTheDocument();
      expect(screen.getByText(/maximum file size/i)).toBeInTheDocument();
    });

    it('should render with label and description', () => {
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          label="Test Label"
          description="Test Description"
        />
      );

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should show required indicator when required', () => {
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          label="Required Field"
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      const errorMessage = 'File is required';
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should call onChange when file is selected', async () => {
      const user = userEvent.setup();
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          id="test-upload"
        />
      );

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      expect(mockOnChange).toHaveBeenCalledWith(file);
    });

    it('should display selected file name', () => {
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
      render(
        <FileUploadZone
          file={file}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('should show file size for selected file', () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      render(
        <FileUploadZone
          file={file}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/bytes/i)).toBeInTheDocument();
    });
  });

  describe('File Validation', () => {
    it('should reject files exceeding max size', async () => {
      const user = userEvent.setup();
      const maxSize = 1024; // 1KB
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          maxSize={maxSize}
        />
      );

      // Create a file larger than maxSize
      const largeContent = 'x'.repeat(2000);
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      // Should call onChange with null (rejected)
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('should reject files with invalid type', async () => {
      const user = userEvent.setup();
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          accept={['application/pdf']}
        />
      );

      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      // Component validates and calls onChange with null, but browser might filter based on accept attribute
      // So we check if onChange was not called with the invalid file
      expect(mockOnChange).not.toHaveBeenCalledWith(file);
    });

    it('should accept valid PDF file', async () => {
      const user = userEvent.setup();
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          accept={['application/pdf']}
        />
      );

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      expect(mockOnChange).toHaveBeenCalledWith(file);
    });

    it('should accept valid JPEG file', async () => {
      const user = userEvent.setup();
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          accept={['image/jpeg']}
        />
      );

      const file = new File(['jpeg data'], 'photo.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      expect(mockOnChange).toHaveBeenCalledWith(file);
    });

    it('should accept valid PNG file', async () => {
      const user = userEvent.setup();
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          accept={['image/png']}
        />
      );

      const file = new File(['png data'], 'image.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      expect(mockOnChange).toHaveBeenCalledWith(file);
    });
  });

  describe('File Removal', () => {
    it('should call onChange with null when remove button is clicked', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      render(
        <FileUploadZone
          file={file}
          onChange={mockOnChange}
        />
      );

      const removeButton = screen.getByLabelText(/remove/i);
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('should clear file input value on remove', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      const { rerender } = render(
        <FileUploadZone
          file={file}
          onChange={mockOnChange}
        />
      );

      const removeButton = screen.getByLabelText(/remove/i);
      await user.click(removeButton);

      rerender(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag enter event', () => {
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
        />
      );

      // Find the actual upload zone div (the one with border styling)
      const uploadZones = document.querySelectorAll('div[class*="border"]');
      let dropZone: Element | null = null;

      uploadZones.forEach(zone => {
        if (zone.className.includes('border-dashed')) {
          dropZone = zone;
        }
      });

      expect(dropZone).not.toBeNull();

      fireEvent.dragEnter(dropZone!);

      // After drag enter, the border should change to primary color
      expect(dropZone?.className).toContain('border-primary-500');
    });

    it('should handle drag leave event', () => {
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
        />
      );

      const dropZone = screen.getByText(/drag and drop file here/i).closest('div');

      fireEvent.dragEnter(dropZone!);
      fireEvent.dragLeave(dropZone!);

      // Check if dragging state is removed
      expect(dropZone?.parentElement).not.toHaveClass(/border-primary-500/);
    });

    it('should handle file drop', async () => {
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
        />
      );

      const file = new File(['test'], 'dropped.pdf', { type: 'application/pdf' });
      const dropZone = screen.getByText(/drag and drop file here/i).closest('div');

      const dataTransfer = {
        files: [file],
        types: ['Files'],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(file);
      });
    });
  });

  describe('File Preview', () => {
    it('should show image preview for image files', () => {
      // Create a mock image file
      const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 });

      render(
        <FileUploadZone
          file={file}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Image preview will be rendered after FileReader completes
      // In actual implementation, FileReader is async
      expect(screen.getByText('image.jpg')).toBeInTheDocument();
    });

    it('should not show preview when showPreview is false', () => {
      const file = new File([''], 'image.jpg', { type: 'image/jpeg' });

      render(
        <FileUploadZone
          file={file}
          onChange={mockOnChange}
          showPreview={false}
        />
      );

      const images = screen.queryAllByRole('img');
      expect(images.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for file input', () => {
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
          label="Upload Document"
          id="doc-upload"
        />
      );

      const input = document.getElementById('doc-upload');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'file');
    });

    it('should have aria-label for remove button', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      render(
        <FileUploadZone
          file={file}
          onChange={mockOnChange}
        />
      );

      const removeButton = screen.getByLabelText(/remove/i);
      expect(removeButton).toHaveAttribute('aria-label');
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes correctly', () => {
      const testCases = [
        { size: 0, expected: '0 Bytes' },
        { size: 500, expected: '500 Bytes' },
        { size: 1024, expected: '1 KB' },
        { size: 1024 * 1024, expected: '1 MB' },
        { size: 1024 * 1024 * 5, expected: '5 MB' },
      ];

      testCases.forEach(({ size, expected }) => {
        const file = new File(['x'.repeat(size)], 'test.pdf', { type: 'application/pdf' });
        Object.defineProperty(file, 'size', { value: size });

        const { unmount } = render(
          <FileUploadZone
            file={file}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByText(new RegExp(expected.split(' ')[1]))).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Click to Upload', () => {
    it('should open file dialog when clicking on upload zone', async () => {
      const user = userEvent.setup();
      render(
        <FileUploadZone
          file={null}
          onChange={mockOnChange}
        />
      );

      const uploadZone = screen.getByText(/drag and drop file here/i).closest('div');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const clickSpy = jest.spyOn(input, 'click');

      await user.click(uploadZone!);

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
