// BGG API Request Queue with Rate Limiting
// Ensures we respect BGG's rate limits (1-2 requests per second)

interface QueueItem {
  fn: () => Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
}

class RequestQueue {
  private queue: QueueItem[] = []
  private processing = false
  private lastRequestTime = 0
  private readonly minDelay = 1100 // 1.1 seconds between requests (safe margin)

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const item = this.queue.shift()
      if (!item) break

      // Respect rate limiting
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < this.minDelay) {
        await this.sleep(this.minDelay - timeSinceLastRequest)
      }

      try {
        this.lastRequestTime = Date.now()
        const result = await item.fn()
        item.resolve(result)
      } catch (error) {
        item.reject(error)
      }
    }

    this.processing = false
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  getQueueLength(): number {
    return this.queue.length
  }

  isProcessing(): boolean {
    return this.processing
  }
}

// Singleton instance
export const requestQueue = new RequestQueue()
