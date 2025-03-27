import React, { useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { Order, OrderStatus } from '../types/order';
import { useOrderStore } from '../store/orderStore';
import { websocketService } from '../services/websocketService';
import '../styles/OrderList.css';

export const OrderList: React.FC = () => {
  const { orders, isLoading, error, fetchOrders } = useOrderStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [newOrders, setNewOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = websocketService.subscribe((order) => {
      setNewOrders(prev => new Set([...Array.from(prev), order.id]));
      // Remove the highlight after 5 seconds
      setTimeout(() => {
        setNewOrders(prev => {
          const updated = new Set(Array.from(prev));
          updated.delete(order.id);
          return updated;
        });
      }, 5000);
    });

    return () => unsubscribe();
  }, []);

  // Create a helper for defining columns
  const columnHelper = createColumnHelper<Order>();

  // Define table columns
  const columns = [
    columnHelper.accessor('title', {
      header: 'Order Title',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('orderTime', {
      header: 'Order Time',
      cell: info => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className={`status-${info.getValue().toLowerCase()}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('items', {
      header: 'Items',
      cell: info => (
        <ul>
          {info.getValue().map((item, index) => (
            <li key={index}>
              {item.title} x {item.amount}
            </li>
          ))}
        </ul>
      ),
    }),
  ];

  // Create the table instance
  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="order-list">
      <h2>Orders</h2>
      <div>
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={newOrders.has(row.original.id) ? 'new-order' : ''}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 