'use client';

import { PageHeader } from '@/components/dashboard';
import { HelpCircle, Book, MessageSquare, FileText, Search, ChevronRight } from 'lucide-react';
import { routes } from '@/lib/routes';

const faqs = [
  { question: 'How do I request access to a new service?', category: 'Services' },
  { question: 'How can I track the status of my request?', category: 'Requests' },
  { question: 'How do I update my profile information?', category: 'Account' },
  { question: 'What should I do if I forgot my password?', category: 'Security' },
  { question: 'How do I enable two-factor authentication?', category: 'Security' },
];

const resources = [
  { icon: Book, title: 'User Guide', description: 'Complete guide to using the portal', href: '#' },
  { icon: FileText, title: 'Documentation', description: 'Technical documentation and APIs', href: '#' },
  { icon: MessageSquare, title: 'Contact Support', description: 'Get help from our support team', href: '#' },
];

export default function IndividualHelpPage() {
  return (
    <>
      <PageHeader
        title="Help Center"
        description="Find answers and get support"
        breadcrumbs={[
          { label: 'Dashboard', href: routes.dashboard('individual') },
          { label: 'Help' },
        ]}
      />

      {/* Search */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 mb-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">How can we help you?</h2>
          <p className="text-primary-100 mb-6">Search our knowledge base or browse categories below</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {resources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <a
              key={index}
              href={resource.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all group"
            >
              <div className="p-3 rounded-xl bg-primary-100 text-primary-600 w-fit">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                {resource.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{resource.description}</p>
            </a>
          );
        })}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
              <p className="text-sm text-gray-500">Quick answers to common questions</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, index) => (
            <a
              key={index}
              href="#"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-900">{faq.question}</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  {faq.category}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
