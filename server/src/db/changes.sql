-- Insert sample orders
INSERT INTO orders (id, title, order_time, status, delivery_address, delivery_latitude, delivery_longitude) VALUES
(UUID(), 'Margherita Pizza', NOW(), 'PENDING', '123 Main St, New York', 40.7128, -74.0060),
(UUID(), 'Pepperoni Special', NOW(), 'PREPARING', '456 Park Ave, New York', 40.7580, -73.9855),
(UUID(), 'Vegetarian Delight', NOW(), 'READY', '789 Broadway, New York', 40.7614, -73.9776),
(UUID(), 'BBQ Chicken Pizza', NOW(), 'DELIVERING', '321 5th Ave, New York', 40.7527, -73.9772),
(UUID(), 'Supreme Pizza', NOW(), 'DELIVERED', '654 Madison Ave, New York', 40.7587, -73.9787);

-- Insert order items for each order
INSERT INTO order_items (id, order_id, title, amount)
SELECT UUID(), o.id, 'Margherita Pizza', 1 FROM orders o WHERE o.title = 'Margherita Pizza'
UNION ALL
SELECT UUID(), o.id, 'Coca Cola', 2 FROM orders o WHERE o.title = 'Margherita Pizza'
UNION ALL
SELECT UUID(), o.id, 'Pepperoni Special', 1 FROM orders o WHERE o.title = 'Pepperoni Special'
UNION ALL
SELECT UUID(), o.id, 'Garlic Bread', 1 FROM orders o WHERE o.title = 'Pepperoni Special'
UNION ALL
SELECT UUID(), o.id, 'Vegetarian Delight', 1 FROM orders o WHERE o.title = 'Vegetarian Delight'
UNION ALL
SELECT UUID(), o.id, 'Salad', 1 FROM orders o WHERE o.title = 'Vegetarian Delight'
UNION ALL
SELECT UUID(), o.id, 'BBQ Chicken Pizza', 1 FROM orders o WHERE o.title = 'BBQ Chicken Pizza'
UNION ALL
SELECT UUID(), o.id, 'Wings', 1 FROM orders o WHERE o.title = 'BBQ Chicken Pizza'
UNION ALL
SELECT UUID(), o.id, 'Supreme Pizza', 1 FROM orders o WHERE o.title = 'Supreme Pizza'
UNION ALL
SELECT UUID(), o.id, 'Ice Cream', 2 FROM orders o WHERE o.title = 'Supreme Pizza'; 