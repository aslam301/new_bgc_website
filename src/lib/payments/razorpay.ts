// Razorpay REST API client (no SDK)
// Using native fetch for simplicity

interface RazorpayOrderOptions {
  amount: number // in paise (smallest currency unit)
  currency: string
  receipt: string
  notes?: Record<string, string>
}

interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  created_at: number
}

class RazorpayClient {
  private keyId: string
  private keySecret: string
  private baseUrl = 'https://api.razorpay.com/v1'

  constructor(keyId: string, keySecret: string) {
    this.keyId = keyId
    this.keySecret = keySecret
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')
    return `Basic ${credentials}`
  }

  async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.description || 'Failed to create order')
    }

    return response.json()
  }

  async fetchOrder(orderId: string): Promise<RazorpayOrder> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.description || 'Failed to fetch order')
    }

    return response.json()
  }

  async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    return expectedSignature === signature
  }

  async fetchPayment(paymentId: string) {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.description || 'Failed to fetch payment')
    }

    return response.json()
  }

  async createRefund(paymentId: string, amount?: number) {
    const body: any = {}
    if (amount) {
      body.amount = amount
    }

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.description || 'Failed to create refund')
    }

    return response.json()
  }
}

// Export singleton instance
export function getRazorpayClient(): RazorpayClient {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured')
  }

  return new RazorpayClient(keyId, keySecret)
}

// Helper to convert rupees to paise
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

// Helper to convert paise to rupees
export function paiseToRupees(paise: number): number {
  return paise / 100
}
