/**
 * Indian Rupee (INR) currency and numbering utilities.
 * FinTrack uses Indian numbering system (Lakhs and Crores).
 */

export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹ 0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with en-IN locale
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return formatted.replace('INR', '₹').trim();
}

/**
 * Format in Indian Lakhs / Crores for compact metric displays
 * e.g. 125000 -> "₹ 1.25 L", 15000000 -> "₹ 1.50 Cr"
 */
export function formatCompactINR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹ ${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹ ${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹ ${(abs / 1000).toFixed(1)} K`;
  }
  return formatINR(amount);
}
