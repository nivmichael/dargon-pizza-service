CREATE DATABASE IF NOT EXISTS pizza_service;

USE pizza_service;

CREATE TABLE
    IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM (
            'Received',
            'Preparing',
            'Ready',
            'EnRoute',
            'Delivered'
        ) DEFAULT 'Received',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );