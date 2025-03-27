import React from 'react';
import { OrderStatus } from '../types/order';
import { useOrderStore } from '../store/orderStore';

export const OrderFilters: React.FC = () => {
  const { filters, setFilters } = useOrderStore();

  // Handle status filter change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: e.target.value as OrderStatus || undefined });
  };

  // Handle include delivered filter change
  const handleIncludeDeliveredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, includeDelivered: e.target.checked });
  };

  return (
    <div>
      <h2>Filters</h2>
      <div>
        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={handleStatusChange}
          >
            <option value="">All</option>
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div>
          <input
            id="includeDelivered"
            type="checkbox"
            checked={filters.includeDelivered}
            onChange={handleIncludeDeliveredChange}
          />
          <label htmlFor="includeDelivered">Include Delivered Orders</label>
        </div>
      </div>
    </div>
  );
}; 