/** Possible states of an order */
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

/** Basic order item structure */
export interface OrderItem {
  title: string;
  amount: number;
}

/** Delivery information */
export interface Delivery {
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
}

/** Complete order structure */
export interface Order {
  id: string;
  title: string;
  orderTime: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery?: Delivery; // Optional delivery information
}

/** Data needed to create a new order */
export interface CreateOrderDto {
  title: string;
  items: OrderItem[];
  delivery?: Delivery;
}

/** Data needed to update order status */
export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

/** Basic filter options */
export interface OrderFilters {
  status?: OrderStatus;
  includeDelivered: boolean;
} 