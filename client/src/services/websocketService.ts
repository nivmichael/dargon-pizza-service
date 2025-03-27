import { Order } from '../types/order';
import { config } from '../config';

type WebSocketMessage = {
  type: 'NEW_ORDER' | 'ORDER_UPDATE';
  data: Order;
};

type MessageHandler = (order: Order) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;

  constructor() {
    if (config.websocket.enabled) {
      this.connect();
    }
  }

  private connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    const wsUrl = `ws://${window.location.hostname}:3001`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket received:', message);
        this.messageHandlers.forEach(handler => handler(message.data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnecting = false;
      // Attempt to reconnect after the configured interval
      this.reconnectTimeout = setTimeout(() => this.connect(), config.websocket.refreshInterval);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  public subscribe(handler: MessageHandler) {
    if (!config.websocket.enabled) return () => {};
    
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

export const websocketService = new WebSocketService(); 