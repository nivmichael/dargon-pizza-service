import express from 'express';
import { orderService } from '../services/orderService';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilters } from '../types/order';

const router = express.Router();

// Get all orders with optional filters
router.get('/', async (req, res) => {
  try {
    const filters: OrderFilters = {
      status: req.query.status as any,
      includeDelivered: req.query.includeDelivered === 'true'
    };
    const orders = await orderService.getAllOrders(filters);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const orderData: CreateOrderDto = req.body;
    const order = await orderService.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const statusData: UpdateOrderStatusDto = req.body;
    const order = await orderService.updateOrderStatus(id, statusData);
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router; 