"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/i18n/i18n";
import { RegistrationTimeline } from "@/components/registration/RegistrationTimeline";
import { ArrowLeft, Building2, Calendar, FileText, AlertCircle } from "lucide-react";

interface RegistrationTrackingData {
  tracking_code: string;
  organization_name: string;
  status: "pending" | "under_review" | "need_more_info" | "approved" | "rejected";
  submitted_at: string;
  status_message?: string;
  reviewed_at?: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  need_more_info: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const code = params?.code as string;

  const [registration, setRegistration] = useState<RegistrationTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError(t(language, "track.error.invalidCode"));
      setLoading(false);
      return;
    }

    fetchRegistration();
  }, [code, language]);

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/registrations/organization/track/${code}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError(t(language, "track.error.notFound"));
        } else if (response.status === 429) {
          setError(t(language, "track.error.rateLimited"));
        } else {
          setError(data.error || t(language, "track.error.unknown"));
        }
        return;
      }

      if (data.success && data.data) {
        setRegistration(data.data);
      } else {
        setError(t(language, "track.error.unknown"));
      }
    } catch (err) {
      console.error("Failed to fetch registration:", err);
      setError(t(language, "track.error.network"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; th: string }> = {
      pending: { en: "Pending Review", th: "รอดำเนินการ" },
      under_review: { en: "Under Review", th: "กำลังตรวจสอบ" },
      need_more_info: { en: "Additional Info Required", th: "ต้องการข้อมูลเพิ่มเติม" },
      approved: { en: "Approved", th: "อนุมัติแล้ว" },
      rejected: { en: "Rejected", th: "ปฏิเสธ" },
    };
    return labels[status]?.[language] || status;
  };

  const getNextSteps = (status: string) => {
    const steps: Record<string, { en: string; th: string }> = {
      pending: {
        en: "Your application is being reviewed. We will notify you via email once the review is complete.",
        th: "คำขอของท่านกำลังอยู่ระหว่างการตรวจสอบ เราจะแจ้งผลทางอีเมลเมื่อการตรวจสอบเสร็จสิ้น",
      },
      under_review: {
        en: "Our team is currently reviewing your application and documents. This process typically takes 3-5 business days.",
        th: "ทีมงานกำลังตรวจสอบคำขอและเอกสารของท่าน โดยทั่วไปใช้เวลา 3-5 วันทำการ",
      },
      need_more_info: {
        en: "Additional information is required. Please check your email for details or contact our support team.",
        th: "ต้องการข้อมูลเพิ่มเติม กรุณาตรวจสอบอีเมลของท่านหรือติดต่อทีมสนับสนุน",
      },
      approved: {
        en: "Congratulations! Your application has been approved. You will receive an email with login instructions within 24 hours.",
        th: "ยินดีด้วย คำขอของท่านได้รับการอนุมัติแล้ว ท่านจะได้รับอีเมลพร้อมคำแนะนำการเข้าสู่ระบบภายใน 24 ชั่วโมง",
      },
      rejected: {
        en: "Unfortunately, your application was not approved. For questions about this decision, please contact our support team.",
        th: "ขออภัย คำขอของท่านไม่ได้รับการอนุมัติ หากมีข้อสงสัยเกี่ยวกับการตัดสินใจนี้ กรุณาติดต่อทีมสนับสนุน",
      },
    };
    return steps[status]?.[language] || "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-96 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(language, "common.back")}
          </button>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t(language, "track.error.help")}
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t(language, "common.backToHome")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(language, "common.back")}
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t(language, "track.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t(language, "track.subtitle")}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                <Building2 className="h-5 w-5 text-gray-500" />
                {registration.organization_name}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t(language, "track.trackingCode")}: <span className="font-mono font-semibold">{registration.tracking_code}</span>
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[registration.status]}`}>
              {getStatusLabel(registration.status)}
            </span>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              {t(language, "track.submittedAt")}: {formatDate(registration.submitted_at)}
            </div>

            {registration.reviewed_at && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                {t(language, "track.reviewedAt")}: {formatDate(registration.reviewed_at)}
              </div>
            )}

            {registration.status_message && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">{registration.status_message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t(language, "track.timeline.title")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t(language, "track.timeline.subtitle")}
          </p>
          <RegistrationTimeline
            status={registration.status}
            submittedAt={registration.submitted_at}
            reviewedAt={registration.reviewed_at}
          />
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t(language, "track.nextSteps.title")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {getNextSteps(registration.status)}
          </p>

          {registration.status === "need_more_info" && (
            <div className="mt-4">
              <a
                href="mailto:support@excise.go.th"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t(language, "track.contactSupport")}
              </a>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {t(language, "track.help.title")}
          </h2>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            {t(language, "track.help.description")}
          </p>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>{t(language, "common.email")}:</strong> support@excise.go.th
            </p>
            <p>
              <strong>{t(language, "common.phone")}:</strong> 02-XXX-XXXX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
