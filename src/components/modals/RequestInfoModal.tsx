'use client';

import { useState } from 'react';
import Modal from './Modal';
import { Info, AlertCircle } from 'lucide-react';

interface RequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => Promise<void>;
  organizationName: string;
  trackingCode: string;
}

export default function RequestInfoModal({
  isOpen,
  onClose,
  onConfirm,
  organizationName,
  trackingCode,
}: RequestInfoModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!message.trim()) {
      setError('Please specify what information is needed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(message);
      setMessage('');
      onClose();
    } catch (err) {
      console.error('Failed to request info:', err);
      setError('Failed to request information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError(null);
    onClose();
  };

  const predefinedMessages = [
    'Please provide additional documentation for proof of business registration',
    'Tax identification number needs verification',
    'Company registration certificate is required',
    'Authorized representative documentation is incomplete',
    'Business license needs to be updated',
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Additional Information" size="md">
      <div className="space-y-4">
        {/* Info Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Info className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Request Additional Information
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Request more information for:
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{organizationName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{trackingCode}</p>
          </div>
        </div>

        {/* Quick Select Messages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Common Requests
          </label>
          <div className="space-y-2">
            {predefinedMessages.map((predefinedMessage) => (
              <button
                key={predefinedMessage}
                onClick={() => setMessage(predefinedMessage)}
                className={`w-full text-left px-4 py-2 text-sm rounded-lg border transition-colors ${
                  message === predefinedMessage
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {predefinedMessage}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Information Required <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Clearly specify what additional information or documentation is needed. This will be sent to the applicant."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 20 characters required
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">This action will:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Send information request email to the contact</li>
                <li>Update the registration status to &quot;Need Info&quot;</li>
                <li>Pause the approval process until information is provided</li>
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
            disabled={loading || message.trim().length < 20}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4" />
                <span>Request Information</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
