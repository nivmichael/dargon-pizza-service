import { v4 as uuidv4 } from 'uuid';
import { Order, CreateOrderDto, UpdateOrderStatusDto } from '../types/order';
import { db } from '../config/database';

/** Service handling order operations */
export const orderService = {
  /** Get orders with optional filters */
  async getAllOrders(filters: { status?: string; includeDelivered?: boolean }): Promise<Order[]> {
    try {
      let query = `
        SELECT o.*, 
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', oi.id,
              'title', oi.title,
              'amount', oi.amount
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.status) {
        query += ' AND o.status = ?';
        params.push(filters.status);
      }

      if (!filters.includeDelivered) {
        query += ' AND o.status != ?';
        params.push('DELIVERED');
      }

      query += ' GROUP BY o.id ORDER BY o.order_time DESC';

      const [rows] = await db.query(query, params);
      
      return (rows as any[]).map(row => ({
        id: row.id,
        title: row.title,
        orderTime: row.order_time,
        status: row.status,
        items: row.items ? JSON.parse(`[${row.items}]`) : [],
        delivery: row.delivery_address ? {
          address: row.delivery_address,
          coordinates: [row.delivery_latitude, row.delivery_longitude]
        } : undefined
      }));
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /** Create a new order */
  async createOrder(order: CreateOrderDto): Promise<Order> {
    try {
      const orderId = uuidv4();
      const [result] = await db.query(
        'INSERT INTO orders (id, title, order_time, status, delivery_address, delivery_latitude, delivery_longitude) VALUES (?, ?, NOW(), ?, ?, ?, ?)',
        [
          orderId,
          order.title,
          'PENDING',
          order.delivery?.address,
          order.delivery?.coordinates[0],
          order.delivery?.coordinates[1]
        ]
      );

      // Insert order items
      for (const item of order.items) {
        await db.query(
          'INSERT INTO order_items (order_id, title, amount) VALUES (?, ?, ?)',
          [orderId, item.title, item.amount]
        );
      }

      return this.getOrderById(orderId);
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /** Update order status */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto): Promise<Order> {
    try {
      await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [data.status, orderId]
      );
      return this.getOrderById(orderId);
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const [rows] = await db.query(
        `SELECT o.*, 
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', oi.id,
              'title', oi.title,
              'amount', oi.amount
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ?
        GROUP BY o.id`,
        [orderId]
      );

      const row = (rows as any[])[0];
      if (!row) {
        throw new Error('Order not found');
      }

      return {
        id: row.id,
        title: row.title,
        orderTime: row.order_time,
        status: row.status,
        items: row.items ? JSON.parse(`[${row.items}]`) : [],
        delivery: row.delivery_address ? {
          address: row.delivery_address,
          coordinates: [row.delivery_latitude, row.delivery_longitude]
        } : undefined
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to get order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}; 