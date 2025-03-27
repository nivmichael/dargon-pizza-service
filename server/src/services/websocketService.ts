import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { Order } from '../types/order';

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });
    });
  }

  public broadcastNewOrder(order: Order) {
    const message = JSON.stringify({
      type: 'NEW_ORDER',
      data: order
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public broadcastOrderUpdate(order: Order) {
    const message = JSON.stringify({
      type: 'ORDER_UPDATE',
      data: order
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export const createWebSocketService = (server: Server) => {
  return new WebSocketService(server);
}; 