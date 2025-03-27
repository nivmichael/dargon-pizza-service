import { create } from 'zustand';
import { Order, OrderFilters, OrderStatus } from '../types/order';
import { api } from '../services/api';

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
  setFilters: (filters: OrderFilters) => void;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,
  filters: {
    status: undefined,
    includeDelivered: false
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchOrders();
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await api.getOrders(get().filters);
      set({ orders, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch orders', isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, { status });
      set(state => ({
        orders: state.orders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update order status' });
    }
  }
})); 