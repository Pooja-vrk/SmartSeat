// SmartSeat - Creative Contact & Support Command Center

import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  Users,
  CheckCircle,
  AlertCircle,
  Headphones,
  Sparkles,
  ArrowRight,
  Radio,
  ShieldCheck,
  Zap,
  Navigation,
  LifeBuoy,
  ChevronRight
} from 'lucide-react';

import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/common';
import api from '../../services/api';

import './Contact.css';

const Contact = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {

      const response = await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim()
      });

      if (response?.success) {

        setSubmitted(true);

        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });

      } else {

        setError(
          response?.message ||
          'Failed to send message. Please try again.'
        );

      }

    } catch (err) {

      setError(
        err?.message ||
        'Unable to send message. Please check your connection and try again.'
      );

    } finally {

      setSubmitting(false);

    }
  };


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  return (
    <div className="smart-contact-page">

      {/* =====================================================
          BACKGROUND DECORATIONS
      ====================================================== */}

      <div className="contact-orb contact-orb-one" />
      <div className="contact-orb contact-orb-two" />
      <div className="contact-orb contact-orb-three" />

      <div className="contact-grid-overlay" />


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="contact-hero">

        <div className="contact-status-pill">

          <span className="status-live-dot" />

          <span>SMARTSEAT SUPPORT NETWORK</span>

          <Radio size={14} />

          <strong>ONLINE</strong>

        </div>


        <div className="contact-hero-icon">

          <Headphones />

          <span className="hero-icon-pulse" />

        </div>


        <h1>
          We're Here to
          <span> Move You Forward.</span>
        </h1>


        <p>
          Questions about your booking, seats, payments, or journey?
          Connect with the SmartSeat support team and we'll help you
          get back on track.
        </p>


        <div className="contact-hero-actions">

          <Link
            to="/help"
            className="contact-secondary-button"
          >
            <LifeBuoy size={17} />
            Explore Help Center
            <ArrowRight size={16} />
          </Link>

          <a
            href="mailto:support@smartseat.com"
            className="contact-email-button"
          >
            <Mail size={17} />
            Email Support
          </a>

        </div>

      </section>


      {/* =====================================================
          SUPPORT TELEMETRY
      ====================================================== */}

      <section className="contact-telemetry">

        <div className="telemetry-card">

          <div className="telemetry-icon telemetry-green">
            <Zap />
          </div>

          <div>
            <span>RESPONSE SPEED</span>
            <strong>~ 2 Hours</strong>
            <small>Average support response</small>
          </div>

        </div>


        <div className="telemetry-card">

          <div className="telemetry-icon telemetry-blue">
            <Clock />
          </div>

          <div>
            <span>SUPPORT WINDOW</span>
            <strong>24 / 7</strong>
            <small>Emergency assistance available</small>
          </div>

        </div>


        <div className="telemetry-card">

          <div className="telemetry-icon telemetry-orange">
            <ShieldCheck />
          </div>

          <div>
            <span>SUPPORT CHANNEL</span>
            <strong>SECURE</strong>
            <small>Your information stays protected</small>
          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTACT AREA
      ====================================================== */}

      <main className="contact-main">

        {/* ===================================================
            LEFT INFORMATION PANEL
        ==================================================== */}

        <div className="contact-info-column">


          {/* Contact Hub */}
          <div className="contact-glass-card contact-hub-card">

            <div className="contact-card-heading">

              <div className="heading-icon">
                <Navigation size={20} />
              </div>

              <div>
                <span>CONTACT HUB</span>
                <h2>Reach SmartSeat</h2>
              </div>

            </div>


            <div className="contact-info-list">

              {/* Email */}
              <a
                href="mailto:support@smartseat.com"
                className="contact-info-item"
              >

                <div className="info-item-icon email-icon">
                  <Mail size={19} />
                </div>

                <div className="info-item-content">
                  <span>EMAIL SUPPORT</span>
                  <strong>support@smartseat.com</strong>
                  <small>For general enquiries & assistance</small>
                </div>

                <ChevronRight className="info-arrow" size={18} />

              </a>


              {/* Phone */}
              <a
                href="tel:+9118001234567"
                className="contact-info-item"
              >

                <div className="info-item-icon phone-icon">
                  <Phone size={19} />
                </div>

                <div className="info-item-content">
                  <span>SUPPORT LINE</span>
                  <strong>+91 1800-123-4567</strong>
                  <small>Toll-free support in India</small>
                </div>

                <ChevronRight className="info-arrow" size={18} />

              </a>


              {/* Location */}
              <div className="contact-info-item">

                <div className="info-item-icon location-icon">
                  <MapPin size={19} />
                </div>

                <div className="info-item-content">
                  <span>HEADQUARTERS</span>
                  <strong>Mumbai, Maharashtra</strong>
                  <small>India - 400001</small>
                </div>

              </div>

            </div>

          </div>


          {/* Support Hours */}
          <div className="contact-glass-card support-hours-card">

            <div className="contact-card-heading">

              <div className="heading-icon purple-heading">
                <Clock size={20} />
              </div>

              <div>
                <span>AVAILABILITY</span>
                <h2>Support Hours</h2>
              </div>

            </div>


            <div className="hours-row">

              <div className="hours-icon">
                <Headphones size={18} />
              </div>

              <div>
                <strong>24 / 7 Emergency Support</strong>
                <span>Always available when you need us</span>
              </div>

              <div className="available-badge">
                AVAILABLE
              </div>

            </div>


            <div className="hours-row">

              <div className="hours-icon">
                <MessageSquare size={18} />
              </div>

              <div>
                <strong>Live Chat</strong>
                <span>9:00 AM – 9:00 PM IST</span>
              </div>

            </div>

          </div>


          {/* Quick Support */}
          <div className="quick-support-card">

            <div className="quick-support-decoration" />

            <div className="quick-support-icon">
              <Users size={23} />
            </div>

            <div className="quick-support-content">

              <span>QUICK SUPPORT</span>

              <h3>Booking assistance?</h3>

              <p>
                Keep your booking ID ready so our team can
                locate your journey faster.
              </p>

            </div>

          </div>

        </div>


        {/* ===================================================
            CONTACT FORM
        ==================================================== */}

        <div className="contact-form-wrapper">

          <div className="contact-form-header">

            <div>

              <span className="form-kicker">
                <Sparkles size={14} />
                SUPPORT REQUEST
              </span>

              <h2>
                Tell us what happened.
              </h2>

              <p>
                Send a message to our support team and we'll
                take it from there.
              </p>

            </div>


            <div className="form-live-indicator">

              <span />

              LIVE

            </div>

          </div>


          <div className="contact-form-card">

            {submitted ? (

              /* =============================================
                 SUCCESS STATE
              ============================================== */

              <div className="contact-success">

                <div className="success-animation">

                  <div className="success-ring" />

                  <CheckCircle size={58} />

                </div>


                <span className="success-label">
                  TRANSMISSION COMPLETE
                </span>

                <h3>
                  Message received!
                </h3>

                <p>
                  Your support request has been sent successfully.
                  Our team will get back to you within 24 hours.
                </p>


                <div className="success-details">

                  <div>
                    <Clock size={17} />
                    <span>Expected response: within 24 hours</span>
                  </div>

                  <div>
                    <ShieldCheck size={17} />
                    <span>Your request has been securely received</span>
                  </div>

                </div>


                <Button
                  variant="outline"
                  className="send-another-button"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>

              </div>

            ) : (

              /* =============================================
                 FORM
              ============================================== */

              <form
                onSubmit={handleSubmit}
                className="smart-contact-form"
              >

                {error && (

                  <div className="contact-error">

                    <AlertCircle size={19} />

                    <p>{error}</p>

                  </div>

                )}


                {/* Name + Email */}

                <div className="contact-form-grid">

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


                {/* Phone + Subject */}

                <div className="contact-form-grid">

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
                      {
                        value: 'booking',
                        label: 'Booking Related'
                      },
                      {
                        value: 'payment',
                        label: 'Payment Issue'
                      },
                      {
                        value: 'technical',
                        label: 'Technical Support'
                      },
                      {
                        value: 'feedback',
                        label: 'Feedback'
                      },
                      {
                        value: 'partnership',
                        label: 'Partnership Inquiry'
                      },
                      {
                        value: 'other',
                        label: 'Other'
                      }
                    ]}
                  />

                </div>


                {/* Message */}

                <div className="smart-message-field">

                  <label>
                    Message
                    <span>Tell us everything</span>
                  </label>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={7}
                    placeholder="Describe how we can help you..."
                    required
                  />

                  <div className="message-counter">
                    <span>SUPPORT MESSAGE</span>
                    <span>{formData.message.length} characters</span>
                  </div>

                </div>


                {/* Submit */}

                <button
                  type="submit"
                  className="smart-submit-button"
                  disabled={submitting}
                >

                  {submitting ? (

                    <>
                      <span className="submit-spinner" />
                      Sending Request...
                    </>

                  ) : (

                    <>
                      Send Support Request
                      <Send size={18} />
                    </>

                  )}

                </button>


                <div className="form-security-note">

                  <ShieldCheck size={15} />

                  <span>
                    Your information is transmitted securely
                    and used only to respond to your request.
                  </span>

                </div>

              </form>

            )}

          </div>


          {/* FAQ */}
          <Link
            to="/help"
            className="contact-faq-banner"
          >

            <div className="faq-banner-icon">
              <LifeBuoy size={21} />
            </div>

            <div>

              <span>LOOKING FOR A QUICK ANSWER?</span>

              <strong>
                Visit our Help & FAQ Center
              </strong>

            </div>

            <ArrowRight size={20} />

          </Link>

        </div>

      </main>


      {/* =====================================================
          BOTTOM TRUST SECTION
      ====================================================== */}

      <section className="contact-bottom-trust">

        <div>
          <ShieldCheck />
          <span>SECURE SUPPORT</span>
        </div>

        <div>
          <Zap />
          <span>FAST RESPONSES</span>
        </div>

        <div>
          <Headphones />
          <span>HUMAN ASSISTANCE</span>
        </div>

        <div>
          <Navigation />
          <span>JOURNEY FOCUSED</span>
        </div>

      </section>

    </div>
  );
};

export default Contact;