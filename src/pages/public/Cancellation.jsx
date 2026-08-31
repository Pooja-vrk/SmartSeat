import React from 'react';
import {
  CalendarX,
  Ticket,
  Clock3,
  RefreshCw,
  AlertTriangle,
  ArrowRightLeft,
  Bus,
  Headphones
} from 'lucide-react';

import './Cancellation.css';

const Cancellation = () => {
  return (
    <div className="cancellation-page">

      {/* Hero Section */}
      <section className="cancellation-hero">
        <div className="cancellation-hero-content">

          <div className="cancellation-hero-icon">
            <CalendarX size={34} />
          </div>

          <span className="cancellation-badge">
            SMARTSEAT • BOOKINGS
          </span>

          <h1>Cancellation Policy</h1>

          <p>
            Understand the general cancellation and booking-change
            information that applies when using SmartSeat.
          </p>

          <div className="cancellation-updated">
            Last Updated: August 2026
          </div>

        </div>
      </section>


      {/* Main Content */}
      <main className="cancellation-container">

        {/* Introduction */}
        <section className="cancellation-card cancellation-intro">

          <div className="cancellation-card-icon">
            <Ticket size={24} />
          </div>

          <div>
            <span className="cancellation-section-label">
              BEFORE YOU CANCEL
            </span>

            <h2>
              Review your booking details carefully
            </h2>

            <p>
              SmartSeat provides booking and seat-management functionality
              to help passengers manage their journeys. Cancellation,
              modification, and refund conditions may depend on the
              specific booking and service selected.
            </p>
          </div>

        </section>


        {/* Section 01 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            01
          </div>

          <div className="cancellation-card-content">

            <h2>Cancellation Eligibility</h2>

            <p>
              Whether a booking can be cancelled may depend on the
              conditions associated with the selected service, booking,
              or operator.
            </p>

            <p>
              Please review the cancellation information displayed during
              the booking process before confirming your reservation.
            </p>

          </div>

        </section>


        {/* Section 02 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            02
          </div>

          <div className="cancellation-card-content">

            <div className="cancellation-title-row">
              <CalendarX size={23} />
              <h2>How to Cancel a Booking</h2>
            </div>

            <p>
              If cancellation functionality is available for your booking,
              use the booking-management options provided through your
              SmartSeat account.
            </p>

            <ul>
              <li>Open your SmartSeat booking details.</li>
              <li>Review the available cancellation options.</li>
              <li>Check the applicable booking conditions.</li>
              <li>Confirm the cancellation only after reviewing the details.</li>
            </ul>

          </div>

        </section>


        {/* Section 03 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            03
          </div>

          <div className="cancellation-card-content">

            <div className="cancellation-title-row">
              <Clock3 size={23} />
              <h2>Cancellation Time Conditions</h2>
            </div>

            <p>
              Cancellation availability may be affected by the timing of
              the request and the conditions associated with the selected
              booking.
            </p>

            <p>
              Always check the specific cancellation information provided
              for your booking instead of assuming that the same conditions
              apply to every journey.
            </p>

          </div>

        </section>


        {/* Section 04 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            04
          </div>

          <div className="cancellation-card-content">

            <div className="cancellation-title-row">
              <RefreshCw size={23} />
              <h2>Refund Information</h2>
            </div>

            <p>
              Where a refund is applicable, the amount and processing
              conditions may depend on the booking and service conditions.
            </p>

            <p>
              SmartSeat does not present a universal refund percentage
              because cancellation and refund conditions may differ
              between services.
            </p>

          </div>

        </section>


        {/* Section 05 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            05
          </div>

          <div className="cancellation-card-content">

            <h2>Refund Processing</h2>

            <p>
              When a refund is applicable, processing time may depend on
              the payment method, payment provider, service operator, or
              other factors outside the direct control of SmartSeat.
            </p>

            <p>
              Users should retain their booking information until any
              applicable refund or cancellation process has been completed.
            </p>

          </div>

        </section>


        {/* Section 06 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            06
          </div>

          <div className="cancellation-card-content">

            <div className="cancellation-title-row">
              <AlertTriangle size={23} />
              <h2>Non-Refundable Situations</h2>
            </div>

            <p>
              Some bookings or services may have conditions under which
              cancellation or refund is unavailable.
            </p>

            <p>
              The applicable booking conditions should always be checked
              before requesting cancellation.
            </p>

          </div>

        </section>


        {/* Section 07 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            07
          </div>

          <div className="cancellation-card-content">

            <div className="cancellation-title-row">
              <ArrowRightLeft size={23} />
              <h2>Seat Changes vs Cancellation</h2>
            </div>

            <p>
              Changing a selected seat is different from cancelling a
              booking. If seat-change functionality is available, users
              should use the appropriate seat-management option rather
              than cancelling the entire booking.
            </p>

            <p>
              Availability of seat changes may depend on the booking and
              service conditions.
            </p>

          </div>

        </section>


        {/* Section 08 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            08
          </div>

          <div className="cancellation-card-content">

            <div className="cancellation-title-row">
              <Bus size={23} />
              <h2>Operator-Specific Conditions</h2>
            </div>

            <p>
              Different bus services or operators may have different
              cancellation and refund conditions.
            </p>

            <p>
              When applicable, the conditions associated with the selected
              service take priority over general information presented on
              this page.
            </p>

          </div>

        </section>


        {/* Section 09 */}
        <section className="cancellation-card">

          <div className="cancellation-number">
            09
          </div>

          <div className="cancellation-card-content">

            <h2>Cancelled or Failed Trips</h2>

            <p>
              If a trip is cancelled, unavailable, or affected by an
              unexpected service issue, the applicable resolution may
              depend on the circumstances and the conditions associated
              with the booking.
            </p>

            <p>
              Contact SmartSeat support if you need assistance with a
              booking affected by such an issue.
            </p>

          </div>

        </section>


        {/* Support Section */}
        <section className="cancellation-support-card">

          <div className="cancellation-support-icon">
            <Headphones size={28} />
          </div>

          <div>

            <span>CANCELLATION SUPPORT</span>

            <h2>Need help with your booking?</h2>

            <p>
              If you have questions about cancellation, seat changes,
              booking conditions, or refunds, our support team can help
              you understand the available options.
            </p>

            <a
              href="/contact"
              className="cancellation-support-button"
            >
              Contact Support
            </a>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Cancellation;