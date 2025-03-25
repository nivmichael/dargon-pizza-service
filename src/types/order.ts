/** Possible states of an order */
export enum OrderStatus {
  Received = 'Received',
  Preparing = 'Preparing',
  Ready = 'Ready',
  EnRoute = 'EnRoute',
  Delivered = 'Delivered'
}

/** Basic order item structure */
export interface OrderItem {
  title: string;
  amount: number;
  type: string;
}

/** Complete order structure */
export interface Order {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  orderTime: Date;
  status: OrderStatus;
  items: OrderItem[];
}

/** Data needed to create a new order */
export interface CreateOrderDto {
  title: string;
  latitude: number;
  longitude: number;
  items: OrderItem[];
}

/** Data needed to update order status */
export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

/** Basic filter options */
export interface OrderFilters {
  status?: OrderStatus;
  includeDelivered?: boolean;
} 