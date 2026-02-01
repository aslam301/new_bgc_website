import { format, formatDistance, isPast, isFuture, parseISO } from 'date-fns'

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param formatStr - date-fns format string (default: 'MMM dd, yyyy')
 */
export function formatDate(
  dateString: string,
  formatStr: string = 'MMM dd, yyyy'
): string {
  try {
    const date = parseISO(dateString)
    return format(date, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * Format a date and time string
 * @param dateString - ISO date string
 */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, 'MMM dd, yyyy • h:mm a')
}

/**
 * Format time only
 * @param dateString - ISO date string
 */
export function formatTime(dateString: string): string {
  return formatDate(dateString, 'h:mm a')
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param dateString - ISO date string
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return formatDistance(date, new Date(), { addSuffix: true })
  } catch (error) {
    console.error('Error getting relative time:', error)
    return ''
  }
}

/**
 * Check if an event is upcoming (in the future)
 * @param dateString - ISO date string
 */
export function isUpcoming(dateString: string): boolean {
  try {
    const date = parseISO(dateString)
    return isFuture(date)
  } catch (error) {
    return false
  }
}

/**
 * Check if an event is past
 * @param dateString - ISO date string
 */
export function isEventPast(dateString: string): boolean {
  try {
    const date = parseISO(dateString)
    return isPast(date)
  } catch (error) {
    return false
  }
}

/**
 * Format event date range (e.g., "Jan 15 - Jan 17, 2024")
 * @param startDate - ISO date string
 * @param endDate - ISO date string
 */
export function formatEventDateRange(startDate: string, endDate: string): string {
  try {
    const start = parseISO(startDate)
    const end = parseISO(endDate)

    const startFormatted = format(start, 'MMM dd')
    const endFormatted = format(end, 'MMM dd, yyyy')

    // If same day, just show one date
    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return format(start, 'MMM dd, yyyy')
    }

    return `${startFormatted} - ${endFormatted}`
  } catch (error) {
    console.error('Error formatting date range:', error)
    return ''
  }
}

/**
 * Format event time range (e.g., "2:00 PM - 5:00 PM")
 * @param startDate - ISO date string
 * @param endDate - ISO date string
 */
export function formatEventTimeRange(startDate: string, endDate: string): string {
  try {
    const start = parseISO(startDate)
    const end = parseISO(endDate)

    const startTime = format(start, 'h:mm a')
    const endTime = format(end, 'h:mm a')

    return `${startTime} - ${endTime}`
  } catch (error) {
    console.error('Error formatting time range:', error)
    return ''
  }
}

/**
 * Get a short day representation (e.g., "MON 15")
 * @param dateString - ISO date string
 */
export function getShortDayMonth(dateString: string): {
  day: string
  month: string
} {
  try {
    const date = parseISO(dateString)
    return {
      day: format(date, 'dd'),
      month: format(date, 'MMM').toUpperCase(),
    }
  } catch (error) {
    return { day: '', month: '' }
  }
}
