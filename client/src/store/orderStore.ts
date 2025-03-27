import { create } from 'zustand';
import { Order, OrderFilters, OrderStatus } from '../types/order';
import { api } from '../services/api';
import { websocketService } from '../services/websocketService';
import { config } from '../config';

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
  setFilters: (filters: OrderFilters) => void;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
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
  },

  addOrder: (order) => {
    set(state => ({
      orders: [...state.orders, order]
    }));
  },

  updateOrder: (order) => {
    set(state => ({
      orders: state.orders.map(o =>
        o.id === order.id ? order : o
      )
    }));
  }
}));

// Set up polling if WebSocket is disabled
if (!config.websocket.enabled) {
  setInterval(() => {
    useOrderStore.getState().fetchOrders();
  }, config.websocket.refreshInterval);
}

// Subscribe to WebSocket updates if enabled
websocketService.subscribe((order) => {
  const store = useOrderStore.getState();
  const existingOrderIndex = store.orders.findIndex((o) => o.id === order.id);

  if (existingOrderIndex === -1) {
    // New order
    store.addOrder(order);
  } else {
    // Updated order
    store.updateOrder(order);
  }
}); 