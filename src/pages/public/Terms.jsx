import React from 'react';
import { FileText, ShieldCheck, UserCheck, CreditCard, AlertCircle, RefreshCw, Headphones } from 'lucide-react';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">

      {/* Hero Section */}
      <section className="terms-hero">
        <div className="terms-hero-content">

          <div className="terms-hero-icon">
            <FileText size={34} />
          </div>

          <span className="terms-badge">
            SMARTSEAT • LEGAL
          </span>

          <h1>Terms of Service</h1>

          <p>
            Please read these terms carefully before using SmartSeat.
            They explain the guidelines and conditions that apply when
            accessing and using our platform.
          </p>

          <div className="terms-updated">
            Last Updated: August 2026
          </div>

        </div>
      </section>


      {/* Main Content */}
      <main className="terms-container">

        {/* Introduction */}
        <section className="terms-card terms-intro">
          <div className="terms-card-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <span className="terms-section-label">WELCOME TO SMARTSEAT</span>

            <h2>Clear and transparent service terms</h2>

            <p>
              SmartSeat provides a platform designed to make bus searching,
              booking, seat selection, and trip management simple and
              convenient. By accessing or using SmartSeat, you agree to
              follow these Terms of Service.
            </p>
          </div>
        </section>


        {/* Section 01 */}
        <section className="terms-card">
          <div className="terms-number">01</div>

          <div className="terms-card-content">
            <h2>Acceptance of Terms</h2>

            <p>
              By accessing SmartSeat or using any of its services, you
              acknowledge that you have read, understood, and agreed to
              these Terms of Service.
            </p>

            <p>
              If you do not agree with these terms, please do not use the
              SmartSeat platform.
            </p>
          </div>
        </section>


        {/* Section 02 */}
        <section className="terms-card">
          <div className="terms-number">02</div>

          <div className="terms-card-content">
            <div className="terms-title-row">
              <UserCheck size={23} />
              <h2>User Accounts</h2>
            </div>

            <p>
              Certain SmartSeat features may require you to create an
              account. You are responsible for providing accurate
              information when creating and maintaining your account.
            </p>

            <ul>
              <li>Keep your account information accurate and up to date.</li>
              <li>Protect your login credentials.</li>
              <li>Do not knowingly provide false information.</li>
              <li>Notify support if you believe your account has been misused.</li>
            </ul>
          </div>
        </section>


        {/* Section 03 */}
        <section className="terms-card">
          <div className="terms-number">03</div>

          <div className="terms-card-content">
            <h2>Booking & Seat Selection</h2>

            <p>
              SmartSeat allows users to search for available services,
              select seats, and manage their bookings through the platform.
            </p>

            <p>
              Users should carefully review the selected bus, journey
              details, passenger information, and seat selection before
              confirming a booking.
            </p>
          </div>
        </section>


        {/* Section 04 */}
        <section className="terms-card">
          <div className="terms-number">04</div>

          <div className="terms-card-content">
            <div className="terms-title-row">
              <CreditCard size={23} />
              <h2>Payments & Booking Confirmation</h2>
            </div>

            <p>
              Payment and booking information presented during the booking
              process should be reviewed carefully before confirmation.
            </p>

            <p>
              A booking should be considered confirmed only when the
              SmartSeat system displays the appropriate confirmation
              information.
            </p>
          </div>
        </section>


        {/* Section 05 */}
        <section className="terms-card">
          <div className="terms-number">05</div>

          <div className="terms-card-content">
            <h2>Responsible Use</h2>

            <p>
              SmartSeat must be used responsibly and in accordance with
              applicable laws and platform requirements.
            </p>

            <ul>
              <li>Do not misuse the platform.</li>
              <li>Do not attempt to interfere with platform operations.</li>
              <li>Do not use another person's account without authorization.</li>
              <li>Do not submit intentionally misleading information.</li>
            </ul>
          </div>
        </section>


        {/* Section 06 */}
        <section className="terms-card">
          <div className="terms-number">06</div>

          <div className="terms-card-content">
            <div className="terms-title-row">
              <RefreshCw size={23} />
              <h2>Cancellation & Changes</h2>
            </div>

            <p>
              Booking cancellation, seat changes, and refund eligibility
              may depend on the conditions associated with the particular
              booking or service.
            </p>

            <p>
              Please review the applicable booking information and our
              Cancellation Policy before cancelling or modifying a booking.
            </p>
          </div>
        </section>


        {/* Section 07 */}
        <section className="terms-card">
          <div className="terms-number">07</div>

          <div className="terms-card-content">
            <div className="terms-title-row">
              <AlertCircle size={23} />
              <h2>Service Availability</h2>
            </div>

            <p>
              SmartSeat aims to provide a reliable booking experience,
              but temporary interruptions may occur because of maintenance,
              technical issues, network problems, or circumstances outside
              the platform's control.
            </p>
          </div>
        </section>


        {/* Section 08 */}
        <section className="terms-card">
          <div className="terms-number">08</div>

          <div className="terms-card-content">
            <h2>Limitation of Liability</h2>

            <p>
              SmartSeat provides its platform and services based on the
              information and availability provided through the system.
              Users should review their booking details carefully before
              completing a transaction.
            </p>
          </div>
        </section>


        {/* Section 09 */}
        <section className="terms-card">
          <div className="terms-number">09</div>

          <div className="terms-card-content">
            <h2>Changes to These Terms</h2>

            <p>
              SmartSeat may update these Terms of Service when necessary.
              Changes will be reflected on this page, along with the
              applicable updated date.
            </p>

            <p>
              Continued use of the platform after an update indicates
              acceptance of the revised terms.
            </p>
          </div>
        </section>


        {/* Support Section */}
        <section className="terms-support-card">
          <div className="terms-support-icon">
            <Headphones size={28} />
          </div>

          <div>
            <span>NEED HELP?</span>

            <h2>Have questions about these terms?</h2>

            <p>
              Our support team is available to help you understand
              SmartSeat services and booking-related information.
            </p>

            <a href="/contact" className="terms-support-button">
              Contact Support
            </a>
          </div>
        </section>

      </main>

    </div>
  );
};

export default Terms;