import React from 'react';
import {
  ShieldCheck,
  UserRound,
  Database,
  LockKeyhole,
  Cookie,
  Share2,
  Clock3,
  Baby,
  RefreshCw,
  Headphones
} from 'lucide-react';

import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">

      {/* Hero Section */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">

          <div className="privacy-hero-icon">
            <ShieldCheck size={34} />
          </div>

          <span className="privacy-badge">
            SMARTSEAT • PRIVACY
          </span>

          <h1>Privacy Policy</h1>

          <p>
            Your privacy matters to us. Learn how SmartSeat handles,
            uses, and protects information when you use our platform.
          </p>

          <div className="privacy-updated">
            Last Updated: August 2026
          </div>

        </div>
      </section>


      {/* Main Content */}
      <main className="privacy-container">

        {/* Introduction */}
        <section className="privacy-card privacy-intro">

          <div className="privacy-card-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <span className="privacy-section-label">
              YOUR PRIVACY MATTERS
            </span>

            <h2>
              Transparency, security, and responsible data handling
            </h2>

            <p>
              SmartSeat is committed to handling user information
              responsibly. This Privacy Policy explains the general
              types of information that may be handled through the
              platform and how that information may be used to provide
              SmartSeat services.
            </p>
          </div>

        </section>


        {/* Section 01 */}
        <section className="privacy-card">

          <div className="privacy-number">
            01
          </div>

          <div className="privacy-card-content">

            <h2>Information We Collect</h2>

            <p>
              Depending on the features you use, SmartSeat may handle
              information that is required to create an account,
              manage bookings, provide services, and communicate with
              users.
            </p>

            <ul>
              <li>Information provided while creating an account.</li>
              <li>Passenger and booking information.</li>
              <li>Selected journey and seat information.</li>
              <li>Information submitted when contacting support.</li>
            </ul>

          </div>

        </section>


        {/* Section 02 */}
        <section className="privacy-card">

          <div className="privacy-number">
            02
          </div>

          <div className="privacy-card-content">

            <div className="privacy-title-row">
              <UserRound size={23} />
              <h2>Account Information</h2>
            </div>

            <p>
              When you create and use a SmartSeat account, information
              associated with your account may be handled to authenticate
              you and provide account-related functionality.
            </p>

            <p>
              Users are responsible for keeping their account credentials
              secure and should contact support if they suspect unauthorized
              access.
            </p>

          </div>

        </section>


        {/* Section 03 */}
        <section className="privacy-card">

          <div className="privacy-number">
            03
          </div>

          <div className="privacy-card-content">

            <h2>Booking & Passenger Information</h2>

            <p>
              Information related to bookings may be used to process and
              manage journeys, selected seats, tickets, and other
              booking-related features.
            </p>

            <p>
              Users should make sure that passenger and booking information
              submitted through SmartSeat is accurate.
            </p>

          </div>

        </section>


        {/* Section 04 */}
        <section className="privacy-card">

          <div className="privacy-number">
            04
          </div>

          <div className="privacy-card-content">

            <div className="privacy-title-row">
              <Database size={23} />
              <h2>Payment-Related Information</h2>
            </div>

            <p>
              Payment-related information may be processed as part of the
              booking process. The type of information handled depends on
              the payment functionality and services integrated with the
              SmartSeat platform.
            </p>

            <p>
              Sensitive payment credentials should only be entered through
              authorized payment interfaces.
            </p>

          </div>

        </section>


        {/* Section 05 */}
        <section className="privacy-card">

          <div className="privacy-number">
            05
          </div>

          <div className="privacy-card-content">

            <h2>How We Use Information</h2>

            <p>
              Information handled by SmartSeat may be used to operate,
              maintain, and improve the platform and its services.
            </p>

            <ul>
              <li>Provide account and booking functionality.</li>
              <li>Manage reservations and selected seats.</li>
              <li>Provide booking-related communication.</li>
              <li>Respond to support requests.</li>
              <li>Improve platform reliability and user experience.</li>
              <li>Protect the platform from misuse.</li>
            </ul>

          </div>

        </section>


        {/* Section 06 */}
        <section className="privacy-card">

          <div className="privacy-number">
            06
          </div>

          <div className="privacy-card-content">

            <div className="privacy-title-row">
              <Share2 size={23} />
              <h2>Information Sharing</h2>
            </div>

            <p>
              SmartSeat does not use user information for purposes unrelated
              to providing or improving the platform without an appropriate
              basis for doing so.
            </p>

            <p>
              Information may be shared with service providers or other
              parties when necessary to provide requested services,
              operate platform functionality, comply with applicable
              requirements, or protect the security of the platform.
            </p>

          </div>

        </section>


        {/* Section 07 */}
        <section className="privacy-card">

          <div className="privacy-number">
            07
          </div>

          <div className="privacy-card-content">

            <div className="privacy-title-row">
              <LockKeyhole size={23} />
              <h2>Data Security</h2>
            </div>

            <p>
              SmartSeat takes reasonable measures to protect information
              handled through the platform against unauthorized access,
              misuse, alteration, or loss.
            </p>

            <p>
              However, no internet-based system can guarantee absolute
              security. Users should also take appropriate steps to protect
              their account credentials and devices.
            </p>

          </div>

        </section>


        {/* Section 08 */}
        <section className="privacy-card">

          <div className="privacy-number">
            08
          </div>

          <div className="privacy-card-content">

            <div className="privacy-title-row">
              <Cookie size={23} />
              <h2>Cookies & Local Storage</h2>
            </div>

            <p>
              SmartSeat may use browser storage technologies such as
              cookies or local storage where required for functionality,
              preferences, authentication, or improving the user
              experience.
            </p>

            <p>
              The exact technologies used depend on the implementation
              of the SmartSeat application.
            </p>

          </div>

        </section>


        {/* Section 09 */}
        <section className="privacy-card">

          <div className="privacy-number">
            09
          </div>

          <div className="privacy-card-content">

            <div className="privacy-title-row">
              <Clock3 size={23} />
              <h2>Data Retention</h2>
            </div>

            <p>
              Information may be retained for as long as reasonably
              necessary to provide services, maintain records, resolve
              disputes, comply with applicable requirements, or fulfill
              legitimate operational needs.
            </p>

          </div>

        </section>


        {/* Section 10 */}
        <section className="privacy-card">

          <div className="privacy-number">
            10
          </div>

          <div className="privacy-card-content">

            <h2>Your Privacy Rights</h2>

            <p>
              Depending on applicable laws and circumstances, users may
              have rights relating to the information associated with
              their account.
            </p>

            <ul>
              <li>Request information about personal data handled by the platform.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Ask questions about how information is used.</li>
              <li>Contact support regarding privacy-related concerns.</li>
            </ul>

          </div>

        </section>


        {/* Section 11 */}
        <section className="privacy-card">

          <div className="privacy-number">
            11
          </div>

          <div className="privacy-card-content">

            <div className="privacy-title-row">
              <Baby size={23} />
              <h2>Children's Privacy</h2>
            </div>

            <p>
              SmartSeat is intended to be used in accordance with the
              applicable age and legal requirements for its services.
              We do not knowingly request unnecessary personal information
              from children.
            </p>

          </div>

        </section>


        {/* Section 12 */}
        <section className="privacy-card">

          <div className="privacy-number">
            12
          </div>

          <div className="privacy-card-content">

            <div className="privacy-title-row">
              <RefreshCw size={23} />
              <h2>Changes to This Privacy Policy</h2>
            </div>

            <p>
              This Privacy Policy may be updated when SmartSeat changes
              its services, technologies, or privacy practices.
            </p>

            <p>
              Any updated version will be reflected on this page together
              with the applicable update date.
            </p>

          </div>

        </section>


        {/* Support Section */}
        <section className="privacy-support-card">

          <div className="privacy-support-icon">
            <Headphones size={28} />
          </div>

          <div>
            <span>PRIVACY SUPPORT</span>

            <h2>Have a privacy-related question?</h2>

            <p>
              If you have questions about information handled through
              SmartSeat, you can reach our support team for assistance.
            </p>

            <a
              href="/contact"
              className="privacy-support-button"
            >
              Contact Support
            </a>
          </div>

        </section>

      </main>

    </div>
  );
};

export default Privacy;