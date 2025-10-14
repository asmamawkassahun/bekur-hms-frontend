'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchRoomTypes } from '@/store/slices/roomTypeSlice';
import { fetchDormitories } from '@/store/slices/dormitorySlice';
import {
  setActiveTab,
  generateOccupancyReport,
  generateRevenueReport,
  generateOperationalReport,
  generateFinancialReport,
  generateGuestAnalyticsReport,
  clearError,
  updateFilters,
} from '@/store/slices/reportSlice';
import { useNotification } from '@/hooks/useNotification';
import { ReportType } from '@/types/report.types';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { OccupancyReportView } from '@/components/features/reports/OccupancyReportView';
import { RevenueReportView } from '@/components/features/reports/RevenueReportView';
import { OperationalReportView } from '@/components/features/reports/OperationalReportView';
import { FinancialReportView } from '@/components/features/reports/FinancialReportView';
import { GuestAnalyticsReportView } from '@/components/features/reports/GuestAnalyticsReportView';
import { ReportExportButtons } from '@/components/features/reports/ReportExportButtons';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function ReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((s: RootState) => s.property);
  const { roomTypes } = useSelector((s: RootState) => s.roomType);
  const { dormitories } = useSelector((s: RootState) => s.dormitory);
  const { generatedReports, activeTab, filters, loading, error } = useSelector(
    (s: RootState) => s.reports,
  );
  const { error: showError, success } = useNotification();

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 100 }));
    }
    if (!roomTypes || roomTypes.length === 0) {
      dispatch(fetchRoomTypes({ page: 1, limit: 100 }));
    }
    if (!dormitories || dormitories.length === 0) {
      dispatch(fetchDormitories({ page: 1, limit: 100 }));
    }
  }, [dispatch, properties, roomTypes, dormitories]);

  // Set default property when properties are loaded
  useEffect(() => {
    if (properties && properties.length > 0 && !filters.propertyId) {
      dispatch(updateFilters({ propertyId: properties[0].id }));
    }
  }, [properties, filters.propertyId, dispatch]);

  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const handleGenerateReport = async () => {
    try {
      // Validate required fields
      if (!filters.propertyId) {
        showError('Please select a property to generate the report');
        return;
      }

      // Prepare report data with proper validation
      const reportData: any = {
        propertyId: filters.propertyId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy,
        includeCharts: filters.includeCharts,
      };

      // Only add optional fields if they have values
      if (filters.roomTypeId) {
        reportData.roomTypeId = filters.roomTypeId;
      }
      if (filters.dormitoryId) {
        reportData.dormitoryId = filters.dormitoryId;
      }
      if (filters.paymentMethod) {
        reportData.paymentMethod = filters.paymentMethod;
      }
      if (filters.guestId) {
        reportData.guestId = filters.guestId;
      }

      switch (activeTab) {
        case ReportType.OCCUPANCY:
          await dispatch(generateOccupancyReport(reportData)).unwrap();
          break;
        case ReportType.REVENUE:
          await dispatch(generateRevenueReport(reportData)).unwrap();
          break;
        case ReportType.OPERATIONAL:
          await dispatch(generateOperationalReport(reportData)).unwrap();
          break;
        case ReportType.FINANCIAL:
          await dispatch(generateFinancialReport(reportData)).unwrap();
          break;
        case ReportType.GUEST_ANALYTICS:
          await dispatch(generateGuestAnalyticsReport(reportData)).unwrap();
          break;
      }
      success('Report generated successfully');
    } catch (err) {
      console.error('Report generation failed:', err);
      showError(
        `Failed to generate report: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  };

  const getCurrentReport = () => {
    const report = generatedReports[activeTab];
    // The generatedReports directly stores the report data
    return report || null;
  };

  const isGenerating = loading.generating[activeTab];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Generate comprehensive reports and analytics for your properties"
      />

      {/* Filters */}
      <ReportFilters onGenerate={handleGenerateReport} loading={isGenerating} />

      {/* Export Buttons */}
      <div className="flex justify-end">
        <ReportExportButtons filters={filters} />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => dispatch(setActiveTab(value as ReportType))}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value={ReportType.OCCUPANCY}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Occupancy</span>
          </TabsTrigger>
          <TabsTrigger
            value={ReportType.REVENUE}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Revenue</span>
          </TabsTrigger>
          <TabsTrigger
            value={ReportType.OPERATIONAL}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Operational</span>
          </TabsTrigger>
          <TabsTrigger
            value={ReportType.FINANCIAL}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger
            value={ReportType.GUEST_ANALYTICS}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Guest Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={ReportType.OCCUPANCY} className="mt-6">
          {getCurrentReport() ? (
            <OccupancyReportView data={getCurrentReport() as any} />
          ) : (
            <EmptyState
              title="No Occupancy Report"
              description="Generate an occupancy report to view room and bed occupancy analytics"
              icon={TrendingUp}
            />
          )}
        </TabsContent>

        <TabsContent value={ReportType.REVENUE} className="mt-6">
          {getCurrentReport() ? (
            <RevenueReportView data={getCurrentReport() as any} />
          ) : (
            <EmptyState
              title="No Revenue Report"
              description="Generate a revenue report to view financial performance and trends"
              icon={DollarSign}
            />
          )}
        </TabsContent>

        <TabsContent value={ReportType.OPERATIONAL} className="mt-6">
          {getCurrentReport() ? (
            <OperationalReportView data={getCurrentReport() as any} />
          ) : (
            <EmptyState
              title="No Operational Report"
              description="Generate an operational report to view daily operations and guest management"
              icon={FileText}
            />
          )}
        </TabsContent>

        <TabsContent value={ReportType.FINANCIAL} className="mt-6">
          {getCurrentReport() ? (
            <FinancialReportView data={getCurrentReport() as any} />
          ) : (
            <EmptyState
              title="No Financial Report"
              description="Generate a financial report to view financial health and invoice tracking"
              icon={BarChart3}
            />
          )}
        </TabsContent>

        <TabsContent value={ReportType.GUEST_ANALYTICS} className="mt-6">
          {getCurrentReport() ? (
            <GuestAnalyticsReportView data={getCurrentReport() as any} />
          ) : (
            <EmptyState
              title="No Guest Analytics Report"
              description="Generate a guest analytics report to view demographics and behavior patterns"
              icon={UserCheck}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
