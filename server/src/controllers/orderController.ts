import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { CreateOrderDto, UpdateOrderStatusDto } from '../types/order';

interface IOrderService {
  createOrder(order: CreateOrderDto): Promise<any>;
  // Add other methods as needed
}

export class OrderController {
  constructor(private orderService: IOrderService = orderService) {}

  async createOrder(req: Request, res: Response) {
    try {
      const orderData: CreateOrderDto = req.body;
      const order = await this.orderService.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      
      if (error instanceof Error && error.message === 'Rate limit exceeded') {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'A similar order was recently created. Please wait 5 seconds before trying again.',
          details: {
            title: req.body.title,
            itemsCount: req.body.items.length,
            hasDelivery: !!req.body.delivery
          }
        });
      }

      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  // ... existing code ...
} 