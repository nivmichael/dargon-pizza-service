import React from 'react';
import { OrderList } from './components/OrderList';
import { OrderFilters } from './components/OrderFilters';
import { OrderMap } from './components/OrderMap';

function App() {
  return (
    <div>
      <header>
        <h1>Pizza Service Dashboard</h1>
      </header>
      <main>
        <OrderFilters />
        <div>
          <OrderList />
          <OrderMap />
        </div>
      </main>
    </div>
  );
}

export default App; 