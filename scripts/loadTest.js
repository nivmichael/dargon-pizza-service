const axios = require('axios');
const WebSocket = require('ws');

// Configuration
const config = {
    apiUrl: 'http://localhost:3001/api/v1',
    wsUrl: 'ws://localhost:3001',
    totalOrders: 300,
    delayBetweenOrders: 100, // milliseconds
    pizzaTypes: [
        'Margherita',
        'Pepperoni',
        'Vegetarian',
        'BBQ Chicken',
        'Supreme',
        'Hawaiian',
        'Mushroom',
        'Four Cheese'
    ],
    statuses: ['PENDING', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED']
};

// Sample order data template
const createOrderTemplate = (index) => ({
    title: `Test Order ${index + 1}`,
    items: [
        {
            title: config.pizzaTypes[Math.floor(Math.random() * config.pizzaTypes.length)],
            amount: Math.floor(Math.random() * 3) + 1
        },
        {
            title: 'Coca Cola',
            amount: Math.floor(Math.random() * 2) + 1
        }
    ],
    delivery: {
        address: `${Math.floor(Math.random() * 1000)} Test Street, New York`,
        coordinates: [
            40.7128 + (Math.random() - 0.5) * 0.1, // Random latitude around NYC
            -74.0060 + (Math.random() - 0.5) * 0.1  // Random longitude around NYC
        ]
    }
});

// WebSocket connection for monitoring updates
const ws = new WebSocket(config.wsUrl);
let wsMessageCount = 0;

ws.on('open', () => {
    console.log('WebSocket connected');
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data);
        if (message.type === 'NEW_ORDER' || message.type === 'ORDER_UPDATE') {
            wsMessageCount++;
            console.log(`WebSocket received ${message.type}: Order ${message.data.id}`);
        }
    } catch (error) {
        console.error('Error parsing WebSocket message:', error);
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('WebSocket disconnected');
});

// Function to create a single order
async function createOrder(orderData) {
    try {
        const response = await axios.post(`${config.apiUrl}/orders`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error.message);
        throw error;
    }
}

// Main load testing function
async function runLoadTest() {
    console.log(`Starting load test with ${config.totalOrders} orders...`);
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < config.totalOrders; i++) {
        try {
            const orderData = createOrderTemplate(i);
            await createOrder(orderData);
            successCount++;
            console.log(`Created order ${i + 1}/${config.totalOrders}`);
            
            // Add delay between orders
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenOrders));
        } catch (error) {
            errorCount++;
            console.error(`Failed to create order ${i + 1}:`, error.message);
        }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // in seconds

    console.log('\nLoad Test Results:');
    console.log('------------------');
    console.log(`Total Orders Attempted: ${config.totalOrders}`);
    console.log(`Successful Orders: ${successCount}`);
    console.log(`Failed Orders: ${errorCount}`);
    console.log(`WebSocket Messages Received: ${wsMessageCount}`);
    console.log(`Total Duration: ${duration.toFixed(2)} seconds`);
    console.log(`Average Order Creation Rate: ${(successCount / duration).toFixed(2)} orders/second`);
}

// Run the load test
runLoadTest().catch(console.error); 