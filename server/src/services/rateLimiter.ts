interface OrderKey {
  title: string;
  items: string; // JSON stringified items
  delivery: string; // JSON stringified delivery
}

class RateLimiter {
  private orders: Map<string, number> = new Map();
  private readonly windowMs: number = 5000; // 5 seconds window

  private getOrderKey(order: any): string {
    // Normalize the order data to ensure consistent comparison
    const normalizedOrder = {
      title: order.title?.toLowerCase().trim() || '',
      items: (order.items || []).map((item: any) => ({
        title: item.title?.toLowerCase().trim() || '',
        amount: item.amount || 0
      })).sort((a: any, b: any) => (a.title || '').localeCompare(b.title || '')),
      delivery: order.delivery ? {
        address: order.delivery.address?.toLowerCase().trim() || '',
        coordinates: order.delivery.coordinates || [0, 0]
      } : null
    };

    const key: OrderKey = {
      title: normalizedOrder.title,
      items: JSON.stringify(normalizedOrder.items),
      delivery: normalizedOrder.delivery ? JSON.stringify(normalizedOrder.delivery) : 'no-delivery'
    };

    const keyString = JSON.stringify(key);
    console.log('Rate limiter key:', keyString);
    return keyString;
  }

  public isAllowed(order: any): boolean {
    const key = this.getOrderKey(order);
    const now = Date.now();
    const orderTimestamp = this.orders.get(key) || 0;
    const timeSinceLastOrder = now - orderTimestamp;

    console.log('Rate limiter check:', {
      key,
      timeSinceLastOrder,
      windowMs: this.windowMs,
      isAllowed: timeSinceLastOrder >= this.windowMs
    });

    // Check if the order is within the time window
    if (timeSinceLastOrder < this.windowMs) {
      return false;
    }

    // Update the timestamp for this order
    this.orders.set(key, now);

    // Clean up old entries
    this.cleanup(now);

    return true;
  }

  private cleanup(now: number) {
    for (const [key, timestamp] of this.orders.entries()) {
      if (now - timestamp >= this.windowMs) {
        this.orders.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter(); 