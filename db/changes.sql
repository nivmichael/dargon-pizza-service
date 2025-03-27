-- Insert sample orders
INSERT INTO orders (title, order_time, status, delivery_address, delivery_latitude, delivery_longitude) VALUES
('Margherita Pizza', NOW(), 'PENDING', '123 Main St, New York', 40.7128, -74.0060),
('Pepperoni Special', NOW(), 'PREPARING', '456 Park Ave, New York', 40.7580, -73.9855),
('Vegetarian Delight', NOW(), 'READY', '789 Broadway, New York', 40.7614, -73.9776),
('BBQ Chicken Pizza', NOW(), 'DELIVERING', '321 5th Ave, New York', 40.7527, -73.9772),
('Supreme Pizza', NOW(), 'DELIVERED', '654 Madison Ave, New York', 40.7587, -73.9787);

-- Insert order items for each order
INSERT INTO order_items (order_id, title, amount) VALUES
(1, 'Margherita Pizza', 1),
(1, 'Coca Cola', 2),
(2, 'Pepperoni Special', 1),
(2, 'Garlic Bread', 1),
(3, 'Vegetarian Delight', 1),
(3, 'Salad', 1),
(4, 'BBQ Chicken Pizza', 1),
(4, 'Wings', 1),
(5, 'Supreme Pizza', 1),
(5, 'Ice Cream', 2); 