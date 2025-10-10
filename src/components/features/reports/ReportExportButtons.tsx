'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';
import { reportService } from '@/services/report.service';
import { useNotification } from '@/hooks/useNotification';

interface ReportExportButtonsProps {
  filters: {
    propertyId?: string;
    startDate: string;
    endDate: string;
    [key: string]: any;
  };
}

export function ReportExportButtons({ filters }: ReportExportButtonsProps) {
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const { success, error } = useNotification();

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExporting(format);
      
      const response = format === 'pdf' 
        ? await reportService.exportPdf(filters)
        : await reportService.exportExcel(filters);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      success(`${format.toUpperCase()} report downloaded successfully`);
    } catch (err) {
      error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={exporting === 'pdf'}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('excel')}
        disabled={exporting === 'excel'}
        className="flex items-center gap-2"
      >
        <Table className="h-4 w-4" />
        {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
      </Button>
    </div>
  );
}

