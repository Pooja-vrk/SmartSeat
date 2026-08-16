// Help/FAQ page
import { useState } from 'react';
import { Card, CardHeader, CardBody, Input } from '../../components/common';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Bus,
  Shield,
  CreditCard,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState({});

  const faqs = [
    {
      category: 'Getting Started',
      icon: Bus,
      questions: [
        {
          id: 1,
          question: 'How do I search for buses?',
          answer: 'Use the search form on the home page to enter your departure city, destination, and travel date. Click "Search Buses" to see available options.'
        },
        {
          id: 2,
          question: 'How do I select a seat?',
          answer: 'After choosing a bus, click "View Seats" to see the interactive seat map. Click on an available seat to select it. The seat map shows available, booked, and reserved seats with different colors.'
        },
        {
          id: 3,
          question: 'What is SmartSeat monitoring?',
          answer: 'SmartSeat monitoring is a feature that alerts you when your adjacent seat status changes. You can enable or disable this feature during booking or from your dashboard.'
        }
      ]
    },
    {
      category: 'SmartSeat Features',
      icon: Shield,
      questions: [
        {
          id: 4,
          question: 'How does adjacent seat monitoring work?',
          answer: 'When enabled, SmartSeat monitors the seat next to yours. If someone books it, you\'ll receive a notification with options to keep your current seat or find an alternative based on your preferences.'
        },
        {
          id: 5,
          question: 'Are seat recommendations personalized?',
          answer: 'Yes! Our recommendation engine considers your preferences like window/aisle preference, desired section, and adjacent seat conditions to suggest the best alternatives.'
        },
        {
          id: 6,
          question: 'Can I change my seat after booking?',
          answer: 'Yes, you can change your seat if alternative seats are available. Go to "My Bookings", select your booking, and choose "Change Seat". Availability is confirmed before the change is finalized.'
        }
      ]
    },
    {
      category: 'Booking & Payment',
      icon: CreditCard,
      questions: [
        {
          id: 7,
          question: 'What payment methods are accepted?',
          answer: 'We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking from all major banks, and popular wallets like Paytm, PhonePe, and Amazon Pay.'
        },
        {
          id: 8,
          question: 'Is my payment information secure?',
          answer: 'Absolutely. We use 256-bit SSL encryption and comply with PCI DSS standards. Your payment information is never stored on our servers.'
        },
        {
          id: 9,
          question: 'Can I cancel my booking?',
          answer: 'Yes, you can cancel your booking from "My Bookings". Cancellation policies vary by operator. Refunds are processed according to the operator\'s cancellation policy.'
        }
      ]
    },
    {
      category: 'Account & Profile',
      icon: Users,
      questions: [
        {
          id: 10,
          question: 'How do I create an account?',
          answer: 'Click "Register" on the home page, fill in your details, and verify your email. You can also sign up during the booking process.'
        },
        {
          id: 11,
          question: 'Can I update my preferences?',
          answer: 'Yes! Go to "Profile" > "Preferences" to customize your SmartSeat settings, notification preferences, and travel preferences.'
        },
        {
          id: 12,
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your email to reset your password.'
        }
      ]
    },
    {
      category: 'Policies & Support',
      icon: Clock,
      questions: [
        {
          id: 13,
          question: 'What is your refund policy?',
          answer: 'Refunds are processed according to the operator\'s cancellation policy. Typically, cancellations made 24-48 hours before departure receive a full refund, less processing fees.'
        },
        {
          id: 14,
          question: 'How do I contact customer support?',
          answer: 'You can reach us via email at support@smartseat.com, call our toll-free number +91 1800-123-4567, or use the live chat feature on our website. Support is available 24/7 for emergencies.'
        },
        {
          id: 15,
          question: 'What if my bus is delayed or cancelled?',
          answer: 'In case of delays or cancellations, you\'ll be notified via SMS and email. You can opt for a full refund or reschedule your booking at no extra cost, subject to operator policies.'
        }
      ]
    }
  ];

  const toggleFaq = (faqId) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about SmartSeat
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {filteredFaqs.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{category.category}</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {category.questions.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-900 text-left">{faq.question}</span>
                        {expandedFaqs[faq.id] ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaqs[faq.id] && (
                        <div className="px-4 py-3 bg-white">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Still Need Help */}
      {filteredFaqs.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">Try different search terms or browse our FAQ categories</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Contact CTA */}
      <Card className="mt-8 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <CardBody>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-semibold">Still need help?</h3>
                <p className="text-primary-100">Our support team is available 24/7</p>
              </div>
            </div>
            <a href="/contact" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Contact Support
            </a>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Help;
