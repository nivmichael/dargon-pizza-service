import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { Order, OrderStatus } from '../types/order';
import { useOrderStore } from '../store/orderStore';

export const OrderList: React.FC = () => {
  const { orders, isLoading, error } = useOrderStore();
  
  // Create a helper for defining columns
  const columnHelper = createColumnHelper<Order>();

  // Define table columns
  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('orderTime', {
      header: 'Order Time',
      cell: info => new Date(info.getValue()).toLocaleString()
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <select
          value={info.getValue()}
          onChange={(e) => {
            const order = info.row.original;
            useOrderStore.getState().updateOrderStatus(order.id, e.target.value as OrderStatus);
          }}
        >
          {Object.values(OrderStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      )
    }),
    columnHelper.accessor('items', {
      header: 'Items',
      cell: info => (
        <ul>
          {info.getValue().map((item, index) => (
            <li key={index}>{item.title} x{item.amount}</li>
          ))}
        </ul>
      )
    })
  ];

  // Create the table instance
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Orders</h2>
      <div>
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
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
              <tr key={row.id}>
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