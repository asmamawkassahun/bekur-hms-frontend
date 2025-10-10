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
import { ChevronUp, ChevronDown, FileDown, FileSpreadsheet, FileText, Printer } from 'lucide-react';

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
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  const handleSort = (column: string) => {
    if (!onSort || !columns.find((col) => col.key === column)?.sortable) return;

    const newDirection =
      sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  };

  const getVisibleText = (el: Element): string => {
    // innerText respects CSS visibility (excludes display:none), closer to what user sees
    const text = (el as HTMLElement).innerText ?? '';
    return text.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const collectTableData = () => {
    const tableElement = tableContainerRef.current?.querySelector('table');
    if (!tableElement) return { headers: [] as string[], rows: [] as string[][] };

    const headerCells = Array.from(
      tableElement.querySelectorAll('thead th')
    );
    const headers = headerCells.map((th) => getVisibleText(th));

    const bodyRows = Array.from(tableElement.querySelectorAll('tbody tr'));
    const rows = bodyRows.map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => getVisibleText(td))
    );

    // Exclude action columns from export (by header label)
    const excludedIndexes = headers.reduce<number[]>((acc, h, idx) => {
      if (h.trim().toLowerCase() === 'actions') acc.push(idx);
      return acc;
    }, []);

    if (excludedIndexes.length === 0) return { headers, rows };

    const filteredHeaders = headers.filter((_, idx) => !excludedIndexes.includes(idx));
    const filteredRows = rows.map((r) => r.filter((_, idx) => !excludedIndexes.includes(idx)));

    return { headers: filteredHeaders, rows: filteredRows };
  };

  const buildHTMLTable = (headers: string[], rows: string[][]) => {
    const thead = `<thead><tr>${headers
      .map((h) => `<th>${escapeHtml(h)}</th>`)
      .join('')}</tr></thead>`;
    const tbody = `<tbody>${rows
      .map(
        (r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`
      )
      .join('')}</tbody>`;
    return `<table>${thead}${tbody}</table>`;
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const downloadBlob = (content: BlobPart, mime: string, filename: string) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileBaseName = () =>
    `${title || 'table'}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleExportCSV = () => {
    const { headers, rows } = collectTableData();
    if (!headers.length) return;

    const escapeCsvField = (val: string) => {
      const needsQuotes = /[",\n]/.test(val);
      const escaped = val.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const csvLines = [headers, ...rows]
      .map((row) => row.map(escapeCsvField).join(','))
      .join('\r\n');

    downloadBlob(csvLines, 'text/csv', `${getFileBaseName()}.csv`);
  };

  const handleExportExcel = () => {
    const { headers, rows } = collectTableData();
    if (!headers.length) return;

    const tableHtml = buildHTMLTable(headers, rows);
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        thead th { background: #f4f4f5; font-weight: 600; }
      </style>
    `;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${styles}</head><body>${tableHtml}</body></html>`;
    downloadBlob(html, 'application/vnd.ms-excel', `${getFileBaseName()}.xls`);
  };

  const ensurePrintStyles = () => {
    if (document.getElementById('data-table-print-styles')) return;
    const style = document.createElement('style');
    style.id = 'data-table-print-styles';
    style.textContent = `
@media screen { #data-table-print-container { display: none; } }
@media print {
  body * { visibility: hidden; }
  #data-table-print-container, #data-table-print-container * { visibility: visible; }
  #data-table-print-container { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
}
#data-table-print-container h1 { font-size: 20px; margin-bottom: 12px; }
#data-table-print-container .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
#data-table-print-container table { border-collapse: collapse; width: 100%; }
#data-table-print-container th, #data-table-print-container td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
#data-table-print-container thead th { background: #f4f4f5; font-weight: 600; }
`;
    document.head.appendChild(style);
  };

  const handleExportPDF = async () => {
    const { headers, rows } = collectTableData();
    if (!headers.length) return;

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const orientation = headers.length > 6 ? 'landscape' : 'portrait';
    const doc = new jsPDF({ orientation });

    doc.setFontSize(14);
    doc.text(String(title || 'Export'), 14, 16);

    // Use function-style API for better typings
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 22,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [244, 244, 245], // #f4f4f5 to match UI
        textColor: 0,
      },
      tableWidth: 'auto',
      theme: 'striped',
    });

    doc.save(`${getFileBaseName()}.pdf`);
  };

  const handlePrint = () => {
    const { headers, rows } = collectTableData();
    if (!headers.length) return;

    ensurePrintStyles();
    const container = document.createElement('div');
    container.id = 'data-table-print-container';
    const content = `
      <h1>${escapeHtml(title || 'Print')}</h1>
      ${buildHTMLTable(headers, rows)}
    `;
    container.innerHTML = content;
    document.body.appendChild(container);

    const cleanup = () => {
      container.remove();
      window.removeEventListener('afterprint', cleanup);
      document.title = originalTitle;
    };
    const originalTitle = document.title;
    document.title = '';
    window.addEventListener('afterprint', cleanup);
    window.print();
    // Fallback cleanup in case afterprint is not fired
    setTimeout(cleanup, 1500);
  };

  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} aria-label="Export CSV">
            <FileDown className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} aria-label="Export Excel">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Excel</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} aria-label="Export PDF">
            <FileText className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} aria-label="Print">
            <Printer className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Print</span>
          </Button>
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
        <div className="rounded-md border overflow-x-auto" ref={tableContainerRef}>
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
