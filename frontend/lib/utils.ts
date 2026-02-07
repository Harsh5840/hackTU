import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely format a number as currency
 * @param value - The value to format (can be undefined/null/string)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with fallback to "0.00"
 */
export function formatPrice(value: number | string | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null) {
    return '0.' + '0'.repeat(decimals);
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '0.' + '0'.repeat(decimals);
  }
  return numValue.toFixed(decimals);
}

/**
 * Safely format a percentage
 * @param value - The value to format (can be undefined/null/string)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with fallback to "0.0"
 */
export function formatPercent(value: number | string | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null) {
    return '0.' + '0'.repeat(decimals);
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '0.' + '0'.repeat(decimals);
  }
  return numValue.toFixed(decimals);
}
