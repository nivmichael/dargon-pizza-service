import React from 'react';
import { OrderList } from './components/OrderList';
import { OrderFilters } from './components/OrderFilters';
import { OrderMap } from './components/OrderMap';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Pizza Service Dashboard</h1>
      </header>
      <main className="main-content">
        <div className="orders-section">
          <OrderFilters />
          <OrderList />
        </div>
        <div className="map-section">
          <OrderMap />
        </div>
      </main>
    </div>
  );
}

export default App; 