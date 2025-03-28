# Dargon Pizza Service

A pizza delivery service management system with real-time order tracking.

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js backend API

## Getting Started

1. Start the backend server:
```bash
cd server
npm install
npm run dev
```

2. Start the frontend application:
```bash
cd client
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001 


To view a live demo please go to: https://dragon.michaelniv.com/

To add new pending order to the live version, please use this format:
```
curl --location 'https://dragon.michaelniv.com/api/v1/orders' \
--header 'Content-Type: application/json' \
--data '{
    "title": "Test Order 7",
    "items": [
        {
            "title": "Noodles",
            "amount": 10
        },
        {
            "title": "Fanta",
            "amount": 10
        }
    ],
    "delivery": {
        "address": "200 W 80th St, New York, NY 10024, USA",
        "coordinates": [40.7431, -73.9042]
    }
}'
```