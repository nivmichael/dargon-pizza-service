import express from 'express';
import { orderService } from '../services/orderService';
import { wss } from '../index';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatus } from '../types/order';

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status as OrderStatus | undefined,
      includeDelivered: req.query.includeDelivered === 'true'
    };
    const orders = await orderService.getAllOrders(filters);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const orderData: CreateOrderDto = req.body;
    const newOrder = await orderService.createOrder(orderData);
    // Broadcast new order to all connected clients
    wss.broadcastNewOrder(newOrder);
    res.status(201).json(newOrder);
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
    const updatedOrder = await orderService.updateOrderStatus(id, statusData);
    // Broadcast order update to all connected clients
    wss.broadcastOrderUpdate(updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router; 