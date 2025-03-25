import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { Order, CreateOrderDto, UpdateOrderStatusDto, OrderFilters } from '../types/order';

/** Service handling order operations */
export class OrderService {
  /** Get orders with optional filters */
  async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    let query = `
      SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'title', oi.title,
            'amount', oi.amount,
            'type', oi.type
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.status) {
      conditions.push('o.status = ?');
      params.push(filters.status);
    }

    if (!filters.includeDelivered) {
      conditions.push('o.status != ?');
      params.push('Delivered');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY o.id';

    const [rows] = await pool.execute(query, params);
    
    return (rows as any[]).map(row => ({
      ...row,
      items: JSON.parse(row.items || '[]'),
      orderTime: new Date(row.order_time)
    }));
  }

  /** Create a new order */
  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const orderId = uuidv4();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert order
      await connection.execute(
        `INSERT INTO orders (id, title, latitude, longitude, order_time, status)
         VALUES (?, ?, ?, ?, NOW(), ?)`,
        [orderId, orderData.title, orderData.latitude, orderData.longitude, 'Received']
      );

      // Insert items
      for (const item of orderData.items) {
        await connection.execute(
          `INSERT INTO order_items (id, order_id, title, amount, type)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), orderId, item.title, item.amount, item.type]
        );
      }

      await connection.commit();

      // Get the created order
      const [rows] = await connection.execute(
        `SELECT o.*, 
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'title', oi.title,
              'amount', oi.amount,
              'type', oi.type
            )
          ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id = ?
         GROUP BY o.id
         LIMIT 1`,
        [orderId]
      );

      const order = (rows as any[])[0];
      return {
        ...order,
        items: JSON.parse(order.items || '[]'),
        orderTime: new Date(order.order_time)
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /** Update order status */
  async updateOrderStatus(orderId: string, statusData: UpdateOrderStatusDto): Promise<Order> {
    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [statusData.status, orderId]
    );

    const [rows] = await pool.execute(
      `SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'title', oi.title,
            'amount', oi.amount,
            'type', oi.type
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ?
       GROUP BY o.id
       LIMIT 1`,
      [orderId]
    );

    const order = (rows as any[])[0];
    return {
      ...order,
      items: JSON.parse(order.items || '[]'),
      orderTime: new Date(order.order_time)
    };
  }
} 