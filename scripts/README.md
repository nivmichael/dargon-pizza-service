# Testing Tools and Documentation

This directory contains tools and documentation for testing the Dragon Pizza Service.

## Load Testing Script

The `loadTest.js` script helps verify that the system can handle multiple orders and that WebSocket updates are working correctly.

### Prerequisites

1. Install required dependencies:
```bash
npm install axios ws
```

2. Make sure both the server and client are running:
```bash
# Terminal 1 - Start the server
cd server
npm start

# Terminal 2 - Start the client
cd client
npm start
```

### Running the Load Test

```bash
node loadTest.js
```

The script will:
1. Create 300 orders with random pizza types and quantities
2. Monitor WebSocket messages for order updates
3. Display statistics about the test run

### Configuration

You can modify the following parameters in the script:
- `totalOrders`: Number of orders to create (default: 300)
- `delayBetweenOrders`: Delay between order creation in milliseconds (default: 100)
- `pizzaTypes`: Available pizza types for random selection
- `statuses`: Possible order statuses

## Manual Testing with Postman

### API Endpoints

#### 1. Create Order
```
POST http://localhost:3001/api/v1/orders
Content-Type: application/json

{
    "title": "Test Order",
    "items": [
        {
            "title": "Margherita",
            "amount": 1
        },
        {
            "title": "Coca Cola",
            "amount": 2
        }
    ],
    "delivery": {
        "address": "35-04 47th Ave, Long Island City, NY 11101, USA",
        "coordinates": [40.7424, -73.9301]
    }
}
```

#### 2. Get All Orders
```
GET http://localhost:3001/api/v1/orders
```

Optional query parameters:
- `status`: Filter by order status (e.g., `?status=PENDING`)
- `includeDelivered`: Include delivered orders (e.g., `?includeDelivered=true`)

#### 3. Update Order Status
```
PATCH http://localhost:3001/api/v1/orders/{orderId}/status
Content-Type: application/json

{
    "status": "PREPARING"
}
```

### WebSocket Testing

To test WebSocket updates:

1. Connect to the WebSocket server:
```
ws://localhost:3001
```

2. You'll receive messages in this format:
```json
{
    "type": "NEW_ORDER" | "ORDER_UPDATE",
    "data": {
        "id": "order-uuid",
        "title": "Order Title",
        "orderTime": "2024-03-27T12:00:00Z",
        "status": "PENDING",
        "items": [...],
        "delivery": {
            "address": "...",
            "coordinates": [lat, lng]
        }
    }
}
```

### Testing Scenarios

1. **Basic Order Creation**
   - Create a new order
   - Verify it appears in the GET orders list
   - Verify WebSocket message is received

2. **Order Status Updates**
   - Create an order
   - Update its status
   - Verify WebSocket message is received
   - Verify status is updated in GET orders list

3. **Multiple Orders**
   - Create multiple orders in quick succession
   - Verify all orders are created successfully
   - Verify WebSocket messages for each order

4. **Error Handling**
   - Try creating an order with invalid data
   - Try updating a non-existent order
   - Verify appropriate error responses 