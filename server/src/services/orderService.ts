import { v4 as uuidv4 } from 'uuid';
import { Order, CreateOrderDto, UpdateOrderStatusDto, OrderStatus } from '../types/order';
import { db } from '../config/database';
import { rateLimiter } from './rateLimiter';

/** Service handling order operations */
export const orderService = {
  /** Get orders with optional filters */
  async getAllOrders(filters: { status?: OrderStatus; includeDelivered?: boolean }): Promise<Order[]> {
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
        params.push(OrderStatus.DELIVERED);
      }

      query += ' GROUP BY o.id ORDER BY o.order_time DESC';

      console.log('Executing query:', query);
      console.log('With params:', params);

      const [rows] = await db.query(query, params);
      
      console.log('Query result:', rows);

      return (rows as any[]).map(row => ({
        id: row.id,
        title: row.title,
        orderTime: new Date(row.order_time),
        status: row.status as OrderStatus,
        items: row.items ? JSON.parse(`[${row.items}]`) : [],
        delivery: row.delivery_address ? {
          address: row.delivery_address,
          coordinates: [row.delivery_latitude, row.delivery_longitude]
        } : undefined
      }));
    } catch (error) {
      console.error('Database error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw new Error(`Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /** Create a new order */
  async createOrder(order: CreateOrderDto): Promise<Order> {
    // Check rate limit before any database operation
    if (!rateLimiter.isAllowed(order)) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const orderId = uuidv4();
      console.log('Creating order with data:', { orderId, ...order });

      const [result] = await db.query(
        'INSERT INTO orders (id, title, order_time, status, delivery_address, delivery_latitude, delivery_longitude) VALUES (?, ?, NOW(), ?, ?, ?, ?)',
        [
          orderId,
          order.title,
          OrderStatus.PENDING,
          order.delivery?.address,
          order.delivery?.coordinates[0],
          order.delivery?.coordinates[1]
        ]
      );

      // Insert order items
      for (const item of order.items) {
        const itemId = uuidv4();
        await db.query(
          'INSERT INTO order_items (id, order_id, title, amount) VALUES (?, ?, ?, ?)',
          [itemId, orderId, item.title, item.amount]
        );
      }

      return this.getOrderById(orderId);
    } catch (error) {
      console.error('Database error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /** Update order status */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto): Promise<Order> {
    try {
      console.log('Updating order status:', { orderId, status: data.status });
      
      await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [data.status, orderId]
      );
      return this.getOrderById(orderId);
    } catch (error) {
      console.error('Database error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw new Error(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getOrderById(orderId: string): Promise<Order> {
    try {
      console.log('Fetching order by ID:', orderId);
      
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

      console.log('Query result:', rows);

      const row = (rows as any[])[0];
      if (!row) {
        throw new Error('Order not found');
      }

      return {
        id: row.id,
        title: row.title,
        orderTime: new Date(row.order_time),
        status: row.status as OrderStatus,
        items: row.items ? JSON.parse(`[${row.items}]`) : [],
        delivery: row.delivery_address ? {
          address: row.delivery_address,
          coordinates: [row.delivery_latitude, row.delivery_longitude]
        } : undefined
      };
    } catch (error) {
      console.error('Database error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw new Error(`Failed to get order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}; 