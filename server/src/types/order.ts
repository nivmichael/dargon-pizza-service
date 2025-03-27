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
  id?: string;
  title: string;
  amount: number;
}

/** Complete order structure */
export interface Order {
  id: string;
  title: string;
  orderTime: Date;
  status: OrderStatus;
  items: OrderItem[];
  delivery?: DeliveryInfo;
}

/** Data needed to create a new order */
export interface CreateOrderDto {
  title: string;
  items: OrderItem[];
  delivery?: DeliveryInfo;
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

export interface DeliveryInfo {
  address: string;
  coordinates: [number, number];
} 