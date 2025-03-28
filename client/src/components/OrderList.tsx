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

const columnHelper = createColumnHelper<Order>();

// Simple array for status order, easier to maintain
const statusOrder = [
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERING,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED
];

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    cell: info => info.getValue(),
    sortingFn: 'text'
  }),
  columnHelper.accessor('orderTime', {
    header: 'Order Time',
    cell: info => new Date(info.getValue()).toLocaleString(),
    sortingFn: 'datetime'
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span className={`status-${info.getValue().toLowerCase()}`}>
        {info.getValue()}
      </span>
    ),
    sortingFn: (rowA, rowB) => {
      const statusA = rowA.getValue('status') as OrderStatus;
      const statusB = rowB.getValue('status') as OrderStatus;
      return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
    }
  }),
  columnHelper.accessor('items', {
    header: 'Items',
    cell: info => (
      <ul className="items-list">
        {info.getValue().map((item, index) => (
          <li key={index}>
            {item.title} x{item.amount}
          </li>
        ))}
      </ul>
    )
  })
];

export const OrderList: React.FC = () => {
  const { orders, fetchOrders } = useOrderStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [newOrders, setNewOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const unsubscribe = websocketService.subscribe((order: Order) => {
      setNewOrders(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(order.id);
        return newSet;
      });
      setTimeout(() => {
        setNewOrders(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(order.id);
          return newSet;
        });
      }, 3000);
    });

    return () => unsubscribe();
  }, []);

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortingFns: {
      datetime: (rowA, rowB) => {
        const dateA = new Date(rowA.getValue('orderTime')).getTime();
        const dateB = new Date(rowB.getValue('orderTime')).getTime();
        return dateA - dateB;
      }
    }
  });

  if (orders.length === 0) {
    return <div className="loading">Loading orders...</div>;
  }

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
                    className={header.column.getIsSorted() ? 'sorted' : ''}
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