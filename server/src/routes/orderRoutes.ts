import express from 'express';
import { OrderService } from '../services/orderService';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilters } from '../types/order';

const router = express.Router();
const orderService = new OrderService();

// Route definitions
const routes = {
  // GET /api/v1/orders
  getAll: {
    path: '/',
    method: 'get' as const,
    handler: async (req: express.Request, res: express.Response) => {
      try {
        const filters: OrderFilters = {
          status: req.query.status as any,
          includeDelivered: req.query.includeDelivered === 'true'
        };
        const orders = await orderService.getOrders(filters);
        res.json(orders);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
      }
    }
  },
  // POST /api/v1/orders
  create: {
    path: '/',
    method: 'post' as const,
    handler: async (req: express.Request, res: express.Response) => {
      try {
        const orderData: CreateOrderDto = req.body;
        const order = await orderService.createOrder(orderData);
        res.status(201).json(order);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
      }
    }
  },
  // PATCH /api/v1/orders/:id/status
  updateStatus: {
    path: '/:id/status',
    method: 'patch' as const,
    handler: async (req: express.Request, res: express.Response) => {
      try {
        const statusData: UpdateOrderStatusDto = req.body;
        const order = await orderService.updateOrderStatus(req.params.id, statusData);
        res.json(order);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
      }
    }
  }
};

// Register routes
Object.values(routes).forEach(route => {
  (router[route.method] as Function)(route.path, route.handler);
});

export default router; 