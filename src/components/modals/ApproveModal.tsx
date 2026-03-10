'use client';

import { useState } from 'react';
import Modal from './Modal';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  organizationName: string;
  trackingCode: string;
}

export default function ApproveModal({
  isOpen,
  onClose,
  onConfirm,
  organizationName,
  trackingCode,
}: ApproveModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Failed to approve:', err);
      setError('Failed to approve registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Registration" size="md">
      <div className="space-y-4">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Approve this registration?
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            You are about to approve the registration for:
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{organizationName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{trackingCode}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">This action will:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Create a Kratos identity for the organization</li>
                <li>Send approval notification email to the contact</li>
                <li>Grant API access permissions</li>
                <li>Update the registration status to &quot;Approved&quot;</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Approve Registration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
