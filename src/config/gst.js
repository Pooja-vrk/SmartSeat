/**
 * GST configuration — DISPLAY-ONLY frontend mirror of server/config/gst.js
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  WARNING — THIS FILE IS FOR UI PREVIEW ONLY                 ║
 * ║                                                              ║
 * ║  The backend is the SOLE SOURCE OF TRUTH for:               ║
 * ║    • baseFare   (from Schedule.fare in the database)         ║
 * ║    • gstRate    (from server/config/gst.js)                  ║
 * ║    • gstAmount  (calculated in server/services/bookingService.js) ║
 * ║    • fare/total (baseFare + gstAmount, stored in Booking)    ║
 * ║                                                              ║
 * ║  This file is used ONLY to show an estimated breakdown to    ║
 * ║  the user BEFORE the booking is created (Steps 1–3 of the   ║
 * ║  booking flow).  Once the booking is created, the UI must    ║
 * ║  display backend values from booking.baseFare /              ║
 * ║  booking.gstRate / booking.gstAmount / booking.fare.         ║
 * ║                                                              ║
 * ║  The backend NEVER accepts or trusts fare/gst values from    ║
 * ║  the client request body.  The formula here must remain      ║
 * ║  identical to server/services/bookingService.js so the       ║
 * ║  preview matches the actual stored values.                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * GST_RATE is a percentage (5 = 5 %).
 */

export const GST_RATE = 5;

/**
 * Calculate GST breakdown for a base fare — DISPLAY PREVIEW ONLY.
 *
 * The authoritative calculation runs in server/services/bookingService.js.
 * This function uses an identical formula so the preview matches exactly.
 *
 * @param {number} baseFare
 * @returns {{ baseFare: number, gstRate: number, gstAmount: number, totalAmount: number }}
 */
export function calculateGST(baseFare) {
  const base = Number(baseFare) || 0;
  const gstAmount = Math.round(base * (GST_RATE / 100) * 100) / 100;
  const totalAmount = Math.round((base + gstAmount) * 100) / 100;
  return { baseFare: base, gstRate: GST_RATE, gstAmount, totalAmount };
}
