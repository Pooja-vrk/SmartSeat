/**
 * SmartSeat Cancellation & Refund Policy
 *
 * Rules are evaluated in order — the FIRST matching rule wins.
 * hoursBeforeDeparture = hours remaining until the schedule's departure.
 *
 * refundPercentage is expressed as a number 0–100.
 * cancellationFeePercentage = 100 - refundPercentage.
 */

const CANCELLATION_POLICY = [
  {
    label: 'More than 48 hours before departure',
    minHours: 48,
    maxHours: Infinity,
    refundPercentage: 90,
    description: 'Full refund minus 10% processing fee'
  },
  {
    label: '24 – 48 hours before departure',
    minHours: 24,
    maxHours: 48,
    refundPercentage: 75,
    description: '75% refund, 25% cancellation charge'
  },
  {
    label: '12 – 24 hours before departure',
    minHours: 12,
    maxHours: 24,
    refundPercentage: 50,
    description: '50% refund, 50% cancellation charge'
  },
  {
    label: '4 – 12 hours before departure',
    minHours: 4,
    maxHours: 12,
    refundPercentage: 25,
    description: '25% refund, 75% cancellation charge'
  },
  {
    label: 'Less than 4 hours before departure',
    minHours: 0,
    maxHours: 4,
    refundPercentage: 0,
    description: 'No refund — cancellation too close to departure'
  }
];

/**
 * Calculate refund for a booking cancellation.
 *
 * @param {number}  totalFare           - Booking's fare (baseFare + GST)
 * @param {string|Date} travelDate      - Schedule travel date (Date or ISO string)
 * @param {string}  departureTime       - HH:MM string (e.g. "22:00")
 * @returns {{
 *   refundPercentage: number,
 *   refundAmount: number,
 *   cancellationFee: number,
 *   label: string,
 *   description: string,
 *   hoursBeforeDeparture: number
 * }}
 */
function calculateRefund(totalFare, travelDate, departureTime) {
  const now = new Date();

  // Build departure datetime from travelDate + departureTime
  const dateStr = travelDate instanceof Date
    ? travelDate.toISOString().split('T')[0]
    : String(travelDate).split('T')[0];

  const [hh, mm] = (departureTime || '00:00').split(':').map(Number);
  const departure = new Date(`${dateStr}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00.000Z`);

  const hoursBeforeDeparture = Math.max(
    0,
    (departure.getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  // Find the applicable policy tier
  const policy = CANCELLATION_POLICY.find(
    (tier) =>
      hoursBeforeDeparture >= tier.minHours &&
      hoursBeforeDeparture < tier.maxHours
  ) || CANCELLATION_POLICY[CANCELLATION_POLICY.length - 1];

  const fare = Number(totalFare) || 0;
  const refundAmount = Math.round(fare * (policy.refundPercentage / 100) * 100) / 100;
  const cancellationFee = Math.round((fare - refundAmount) * 100) / 100;

  return {
    refundPercentage: policy.refundPercentage,
    refundAmount,
    cancellationFee,
    label: policy.label,
    description: policy.description,
    hoursBeforeDeparture: Math.round(hoursBeforeDeparture * 10) / 10
  };
}

module.exports = { CANCELLATION_POLICY, calculateRefund };
