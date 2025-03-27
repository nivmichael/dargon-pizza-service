import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import orderRoutes from './routes/orderRoutes';
import { createWebSocketService } from './services/websocketService';

const app = express();
const httpServer = createServer(app);
const wss = createWebSocketService(httpServer);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/orders', orderRoutes);

// Export WebSocket service for use in order routes
export { wss };

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 