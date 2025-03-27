import { Order, CreateOrderDto, UpdateOrderStatusDto, OrderFilters } from '../types/order';

// Use relative path for API calls to work with any domain
const API_BASE_URL = '/api/v1';

export const api = {
  /** Get all orders with optional filters */
  getOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.includeDelivered) params.append('includeDelivered', 'true');
    
    const response = await fetch(`${API_BASE_URL}/orders?${params}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  /** Create a new order */
  createOrder: async (orderData: CreateOrderDto): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  /** Update order status */
  updateOrderStatus: async (orderId: string, statusData: UpdateOrderStatusDto): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    if (!response.ok) throw new Error('Failed to update order status');
    return response.json();
  }
}; 