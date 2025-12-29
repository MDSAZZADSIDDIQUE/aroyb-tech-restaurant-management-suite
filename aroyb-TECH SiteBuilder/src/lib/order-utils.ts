import { Order, OrderStatus, OrderTimestamp } from '@/types';

/**
 * Generate a mock order ID
 */
export function generateOrderId(): string {
  const prefix = 'ARB';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get estimated delivery/collection time
 */
export function getEstimatedTime(
  fulfillmentType: 'delivery' | 'collection',
  prepTimeRange: [number, number],
  deliveryTimeRange?: string
): string {
  const now = new Date();
  let minMinutes = prepTimeRange[0];
  let maxMinutes = prepTimeRange[1];
  
  if (fulfillmentType === 'delivery' && deliveryTimeRange) {
    // Parse delivery time range (e.g., "25-35 mins")
    const match = deliveryTimeRange.match(/(\d+)-(\d+)/);
    if (match) {
      minMinutes += parseInt(match[1]);
      maxMinutes += parseInt(match[2]);
    }
  }
  
  const minTime = new Date(now.getTime() + minMinutes * 60000);
  const maxTime = new Date(now.getTime() + maxMinutes * 60000);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };
  
  return `${formatTime(minTime)} - ${formatTime(maxTime)}`;
}

/**
 * Get order status display info
 */
export function getStatusInfo(status: OrderStatus): {
  label: string;
  description: string;
  icon: string;
  color: string;
} {
  const statusMap: Record<OrderStatus, { label: string; description: string; icon: string; color: string }> = {
    'placed': {
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: '📝',
      color: 'text-blue-600',
    },
    'confirmed': {
      label: 'Confirmed',
      description: 'Restaurant has accepted your order',
      icon: '✅',
      color: 'text-green-600',
    },
    'preparing': {
      label: 'In the Kitchen',
      description: 'Your food is being prepared',
      icon: '👨‍🍳',
      color: 'text-orange-500',
    },
    'ready': {
      label: 'Ready',
      description: 'Your order is ready',
      icon: '🍽️',
      color: 'text-green-600',
    },
    'out-for-delivery': {
      label: 'Out for Delivery',
      description: 'Your order is on its way',
      icon: '🛵',
      color: 'text-primary-600',
    },
    'delivered': {
      label: 'Delivered',
      description: 'Your order has been delivered',
      icon: '🎉',
      color: 'text-green-600',
    },
    'collected': {
      label: 'Collected',
      description: 'Order picked up',
      icon: '🎉',
      color: 'text-green-600',
    },
    'cancelled': {
      label: 'Cancelled',
      description: 'Order was cancelled',
      icon: '❌',
      color: 'text-red-600',
    },
  };
  
  return statusMap[status];
}

/**
 * Get order progress percentage
 */
export function getOrderProgress(status: OrderStatus, isDelivery: boolean): number {
  const deliverySteps: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
  const collectionSteps: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready', 'collected'];
  
  const steps = isDelivery ? deliverySteps : collectionSteps;
  const currentIndex = steps.indexOf(status);
  
  if (currentIndex === -1) return 0;
  
  return Math.round((currentIndex / (steps.length - 1)) * 100);
}

/**
 * Simulate order status progression for demo
 */
export function simulateOrderProgression(orderId: string, isDelivery: boolean): Promise<Order> {
  return new Promise((resolve) => {
    // In a real app, this would fetch from the server
    // For demo, we'll generate mock data
    
    const statuses: OrderStatus[] = isDelivery
      ? ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered']
      : ['placed', 'confirmed', 'preparing', 'ready', 'collected'];
    
    // Simulate random progress
    const progressIndex = Math.min(
      Math.floor(Math.random() * (statuses.length - 1)) + 1,
      statuses.length - 1
    );
    
    const timestamps: OrderTimestamp[] = [];
    const now = new Date();
    
    for (let i = 0; i <= progressIndex; i++) {
      const offset = i * 5 * 60000; // 5 minutes between each status
      timestamps.push({
        status: statuses[i],
        time: new Date(now.getTime() - ((progressIndex - i) * 5 * 60000)).toISOString(),
      });
    }
    
    resolve({
      id: orderId,
      locationId: 'manchester',
      status: statuses[progressIndex],
      timestamps,
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      serviceFee: 0,
      tip: 0,
      total: 0,
      fulfillmentType: isDelivery ? 'delivery' : 'collection',
      customer: {
        firstName: 'Demo',
        lastName: 'Customer',
        email: 'demo@example.com',
        phone: '07700 900123',
      },
      createdAt: timestamps[0]?.time || now.toISOString(),
    });
  });
}

/**
 * Generate demo email content
 */
export function generateOrderConfirmationEmail(order: Order): string {
  return `
Subject: Order Confirmation #${order.id}

Dear ${order.customer.firstName},

Thank you for your order from Aroyb Grill & Curry!

Order Number: ${order.id}
Order Type: ${order.fulfillmentType === 'delivery' ? 'Delivery' : 'Collection'}
${order.estimatedDelivery ? `Estimated Time: ${order.estimatedDelivery}` : ''}

Order Total: £${order.total.toFixed(2)}

${order.fulfillmentType === 'delivery' 
  ? 'We will notify you when your order is out for delivery.'
  : 'We will notify you when your order is ready for collection.'}

Track your order: /track/${order.id}

Thank you for choosing Aroyb Grill & Curry!

---
This is a demo email - no actual email was sent.
  `.trim();
}

/**
 * Generate demo SMS content
 */
export function generateOrderConfirmationSMS(order: Order): string {
  return `Aroyb: Order #${order.id} confirmed! ` +
    `${order.fulfillmentType === 'delivery' ? 'Delivering' : 'Ready for collection'} ` +
    `by ${order.estimatedDelivery || 'soon'}. ` +
    `Total: £${order.total.toFixed(2)}. Track: aroybgrill.co.uk/track/${order.id}`;
}
