"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/i18n/i18n";
import { CheckCircle2, Circle, FileText, Search, AlertCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  label: { en: string; th: string };
  icon: React.ReactNode;
  status: "completed" | "current" | "pending" | "skipped";
  date?: string;
  description?: { en: string; th: string };
}

interface RegistrationTimelineProps {
  status: "pending" | "under_review" | "need_more_info" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
}

export function RegistrationTimeline({ status, submittedAt, reviewedAt }: RegistrationTimelineProps) {
  const { language } = useLanguage();

  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        id: "submitted",
        label: { en: "Application Submitted", th: "ส่งคำขอลงทะเบียน" },
        icon: <FileText className="h-5 w-5" />,
        status: "completed",
        date: submittedAt,
        description: {
          en: "Your application has been received and is in the queue for review",
          th: "คำขอของท่านได้รับแล้วและอยู่ในคิวรอการตรวจสอบ",
        },
      },
    ];

    if (status === "pending") {
      events.push({
        id: "under_review",
        label: { en: "Under Review", th: "กำลังตรวจสอบ" },
        icon: <Search className="h-5 w-5" />,
        status: "current",
        description: {
          en: "Waiting for staff to review your application",
          th: "รอเจ้าหน้าที่ตรวจสอบคำขอของท่าน",
        },
      });
    } else if (status === "under_review") {
      events.push({
        id: "under_review",
        label: { en: "Under Review", th: "กำลังตรวจสอบ" },
        icon: <Search className="h-5 w-5" />,
        status: "completed",
        date: reviewedAt,
        description: {
          en: "Staff is reviewing your documents and information",
          th: "เจ้าหน้าที่กำลังตรวจสอบเอกสารและข้อมูลของท่าน",
        },
      });
    } else if (status === "need_more_info") {
      events.push(
        {
          id: "under_review",
          label: { en: "Under Review", th: "กำลังตรวจสอบ" },
          icon: <Search className="h-5 w-5" />,
          status: "completed",
          description: {
            en: "Initial review completed",
            th: "ตรวจสอบเบื้องต้นเสร็จสิ้น",
          },
        },
        {
          id: "need_more_info",
          label: { en: "Additional Info Required", th: "ต้องการข้อมูลเพิ่มเติม" },
          icon: <AlertCircle className="h-5 w-5" />,
          status: "current",
          date: reviewedAt,
          description: {
            en: "Please check your email for details on what information is needed",
            th: "กรุณาตรวจสอบอีเมลเพื่อดูรายละเอียดข้อมูลที่ต้องการเพิ่มเติม",
          },
        }
      );
    } else if (status === "approved") {
      events.push(
        {
          id: "under_review",
          label: { en: "Under Review", th: "กำลังตรวจสอบ" },
          icon: <Search className="h-5 w-5" />,
          status: "completed",
          description: {
            en: "Review completed",
            th: "ตรวจสอบเสร็จสิ้น",
          },
        },
        {
          id: "approved",
          label: { en: "Approved", th: "อนุมัติแล้ว" },
          icon: <CheckCircle2 className="h-5 w-5" />,
          status: "completed",
          date: reviewedAt,
          description: {
            en: "Your application has been approved. You will receive login instructions via email within 24 hours.",
            th: "คำขอของท่านได้รับการอนุมัติแล้ว ท่านจะได้รับคำแนะนำการเข้าสู่ระบบทางอีเมลภายใน 24 ชั่วโมง",
          },
        }
      );
    } else if (status === "rejected") {
      events.push(
        {
          id: "under_review",
          label: { en: "Under Review", th: "กำลังตรวจสอบ" },
          icon: <Search className="h-5 w-5" />,
          status: "completed",
          description: {
            en: "Review completed",
            th: "ตรวจสอบเสร็จสิ้น",
          },
        },
        {
          id: "rejected",
          label: { en: "Rejected", th: "ปฏิเสธ" },
          icon: <XCircle className="h-5 w-5" />,
          status: "completed",
          date: reviewedAt,
          description: {
            en: "Your application was not approved. Please contact support for more information.",
            th: "คำขอของท่านไม่ได้รับการอนุมัติ กรุณาติดต่อทีมสนับสนุนเพื่อข้อมูลเพิ่มเติม",
          },
        }
      );
    }

    return events;
  };

  const events = getTimelineEvents();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (event: TimelineEvent) => {
    if (event.id === "approved") {
      return {
        icon: "text-green-600 dark:text-green-400",
        line: "bg-green-600 dark:bg-green-400",
        bg: "bg-green-100 dark:bg-green-900",
      };
    }
    if (event.id === "rejected") {
      return {
        icon: "text-red-600 dark:text-red-400",
        line: "bg-red-600 dark:bg-red-400",
        bg: "bg-red-100 dark:bg-red-900",
      };
    }
    if (event.id === "need_more_info" && event.status === "current") {
      return {
        icon: "text-orange-600 dark:text-orange-400",
        line: "bg-orange-600 dark:bg-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900",
      };
    }
    if (event.status === "completed") {
      return {
        icon: "text-blue-600 dark:text-blue-400",
        line: "bg-blue-600 dark:bg-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900",
      };
    }
    if (event.status === "current") {
      return {
        icon: "text-blue-600 dark:text-blue-400 animate-pulse",
        line: "bg-blue-600 dark:bg-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900",
      };
    }
    return {
      icon: "text-gray-400 dark:text-gray-600",
      line: "bg-gray-300 dark:bg-gray-700",
      bg: "bg-gray-100 dark:bg-gray-800",
    };
  };

  return (
    <div className="relative">
      {events.map((event, index) => {
        const colors = getStatusColor(event);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[18px] top-[36px] w-0.5 h-full",
                  event.status === "completed" || event.status === "current"
                    ? colors.line
                    : "bg-gray-300 dark:bg-gray-700"
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0",
                colors.bg
              )}
            >
              <div className={colors.icon}>
                {event.status === "pending" ? (
                  <Circle className="h-5 w-5" />
                ) : event.status === "current" ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  event.icon
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3
                    className={cn(
                      "font-semibold",
                      event.status === "pending"
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-gray-900 dark:text-gray-100"
                    )}
                  >
                    {event.label[language]}
                  </h3>
                  {event.date && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(event.date)}
                    </p>
                  )}
                  {event.description && (
                    <p
                      className={cn(
                        "text-sm mt-2",
                        event.status === "pending"
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-gray-600 dark:text-gray-300"
                      )}
                    >
                      {event.description[language]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
