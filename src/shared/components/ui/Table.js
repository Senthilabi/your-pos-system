import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';

const Table = ({
  data = [],
  columns = [],
  sortable = false,
  selectable = false,
  onRowSelect,
  selectedRows = [],
  onSort,
  emptyMessage = 'No data available',
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    
    if (onSort) {
      onSort(key, direction);
    }
  };

  const handleSelectRow = (row, index) => {
    if (!selectable || !onRowSelect) return;
    onRowSelect(row, index);
  };

  const handleSelectAll = () => {
    if (!selectable || !onRowSelect) return;
    
    if (selectedRows.length === data.length) {
      onRowSelect([], 'clear');
    } else {
      onRowSelect(data, 'all');
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 text-gray-300" />;
    }
    
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-gray-600" /> :
      <ChevronDown className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`hover:bg-gray-50 ${
                    selectedRows.some(selected => selected.id === row.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {selectable && (
                    <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        checked={selectedRows.some(selected => selected.id === row.id)}
                        onChange={() => handleSelectRow(row, rowIndex)}
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;