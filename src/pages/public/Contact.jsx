// Contact page
import { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/common';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  MessageSquare,
  Users,
  CheckCircle
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">support@smartseat.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">+91 1800-123-4567</p>
                    <p className="text-sm text-gray-500">Toll-free in India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">
                      SmartSeat Headquarters<br />
                      Mumbai, Maharashtra<br />
                      India - 400001
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Support Hours</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">24/7 Support</p>
                    <p className="text-sm text-gray-600">Always available for emergencies</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">9 AM - 9 PM IST</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-primary-50 border-primary-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-primary-900">Quick Support</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-primary-800 mb-3">
                For booking-related queries, please have your booking ID ready for faster assistance.
              </p>
              <div className="text-sm text-primary-700">
                <p>Average response time: 2 hours</p>
                <p>Emergency response: 30 minutes</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Send us a Message</h3>
            </CardHeader>
            <CardBody>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h4>
                  <p className="text-gray-600">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Your Name"
                      placeholder="John Doe"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Email Address"
                      placeholder="john@example.com"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Phone Number"
                      placeholder="+91 98765 43210"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <Select
                      label="Subject"
                      placeholder="Select a topic"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      options={[
                        { value: 'booking', label: 'Booking Related' },
                        { value: 'payment', label: 'Payment Issue' },
                        { value: 'technical', label: 'Technical Support' },
                        { value: 'feedback', label: 'Feedback' },
                        { value: 'partnership', label: 'Partnership Inquiry' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    icon={Send}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>

          {/* FAQ Link */}
          <Card className="mt-6">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Have a Question?</h4>
                  <p className="text-sm text-gray-600">Check our FAQ section for quick answers</p>
                </div>
                <a href="/help" className="text-primary-600 hover:text-primary-700 font-medium">
                  View FAQ →
                </a>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
