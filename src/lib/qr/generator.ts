import QRCode from 'qrcode'

/**
 * Generate a QR code as a data URL
 * @param data - The data to encode in the QR code (typically a ticket code)
 * @returns Promise<string> - Base64 data URL of the QR code image
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000', // Black dots
        light: '#FFFFFF', // White background
      },
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate a unique ticket code
 * Format: BGC-YYYY-XXXX (BGC prefix + year + 4 random chars)
 */
export function generateTicketCode(): string {
  const year = new Date().getFullYear()
  const randomPart = crypto.randomUUID().split('-')[0].toUpperCase().slice(0, 4)
  return `BGC-${year}-${randomPart}`
}
