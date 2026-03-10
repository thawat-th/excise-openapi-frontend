'use client';

import { useState } from 'react';
import Modal from './Modal';
import { XCircle, AlertTriangle } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  organizationName: string;
  trackingCode: string;
}

export default function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  organizationName,
  trackingCode,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch (err) {
      console.error('Failed to reject:', err);
      setError('Failed to reject registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const predefinedReasons = [
    'Incomplete documentation',
    'Invalid tax identification number',
    'Unverified organization information',
    'Missing required certificates',
    'Duplicate registration',
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Registration" size="md">
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Reject this registration?
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            You are about to reject the registration for:
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{organizationName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{trackingCode}</p>
          </div>
        </div>

        {/* Quick Select Reasons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Select Reason
          </label>
          <div className="space-y-2">
            {predefinedReasons.map((predefinedReason) => (
              <button
                key={predefinedReason}
                onClick={() => setReason(predefinedReason)}
                className={`w-full text-left px-4 py-2 text-sm rounded-lg border transition-colors ${
                  reason === predefinedReason
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {predefinedReason}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Input */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Provide a clear reason for rejection. This will be sent to the applicant."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 10 characters required
          </p>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">This action will:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Send rejection notification email to the contact</li>
                <li>Update the registration status to &quot;Rejected&quot;</li>
                <li>Include your rejection reason in the email</li>
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
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || reason.trim().length < 10}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Rejecting...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Reject Registration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
