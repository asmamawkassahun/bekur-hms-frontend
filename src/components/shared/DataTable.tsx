import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  searchBar?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  renderRow?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  title,
  description,
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  searchBar,
  filters,
  actions,
  onSort,
  sortColumn,
  sortDirection,
  renderRow,
  className = '',
}: DataTableProps<T>) {
  const handleSort = (column: string) => {
    if (!onSort || !columns.find((col) => col.key === column)?.sortable) return;

    const newDirection =
      sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  };

  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and filters */}
        {(searchBar || filters) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {searchBar}
            {filters}
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table className="table-fixed w-full min-w-[600px]">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={column.width || 'w-auto'}
                    onClick={() => handleSort(String(column.key))}
                    style={{
                      cursor: column.sortable ? 'pointer' : 'default',
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`h-3 w-3 ${
                              sortColumn === column.key &&
                              sortDirection === 'asc'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                          <ChevronDown
                            className={`h-3 w-3 -mt-1 ${
                              sortColumn === column.key &&
                              sortDirection === 'desc'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) =>
                  renderRow ? (
                    renderRow(item, index)
                  ) : (
                    <TableRow key={index} className="hover:bg-muted/50">
                      {columns.map((column) => (
                        <TableCell
                          key={String(column.key)}
                          className="truncate"
                        >
                          {column.render
                            ? column.render(item)
                            : String(item[column.key] || '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
