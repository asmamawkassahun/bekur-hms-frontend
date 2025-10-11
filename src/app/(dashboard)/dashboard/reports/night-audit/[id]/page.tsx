'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';

// Import all section components
import { FinancialAnalysisSection } from '@/components/features/night-audit/report/FinancialAnalysisSection';
import { OccupancyAnalysisSection } from '@/components/features/night-audit/report/OccupancyAnalysisSection';
import { RevenueAnalysisSection } from '@/components/features/night-audit/report/RevenueAnalysisSection';
import { OperationalAnalysisSection } from '@/components/features/night-audit/report/OperationalAnalysisSection';
import { GuestAnalysisSection } from '@/components/features/night-audit/report/GuestAnalysisSection';
import { GuestLedgerSection } from '@/components/features/night-audit/report/GuestLedgerSection';
import { ComparisonSection } from '@/components/features/night-audit/report/ComparisonSection';

// Import service
import { nightAuditService } from '@/services/night-audit.service';
import type { NightAudit } from '@/types/night-audit.types';

export default function NightAuditDetailReportPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.id as string;

  const [audit, setAudit] = useState<NightAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the specific audit
  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await nightAuditService.getOne(auditId);
        setAudit(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load night audit report');
      } finally {
        setLoading(false);
      }
    };

    if (auditId) {
      fetchAudit();
    }
  }, [auditId]);

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    alert('Excel export coming soon!');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Loading night audit report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-lg text-destructive mb-4">
                {error || 'Audit not found'}
              </p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currency = audit.property?.currency || 'ETB';

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Night Audit Report - ${new Date(
          audit.businessDate,
        ).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`}
        description="Comprehensive end-of-day financial and operational analysis"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </PageHeader>

      {/* Audit Summary Card */}
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Business Date</p>
                <p className="font-semibold">
                  {new Date(audit.businessDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Audit Date</p>
                <p className="font-semibold">
                  {new Date(audit.auditDate).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-600/10">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Performed By</p>
                <p className="font-semibold">
                  {audit.performedByStaff?.user?.firstName || 'System'}{' '}
                  {audit.performedByStaff?.user?.lastName || ''}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  audit.status === 'COMPLETED'
                    ? 'bg-green-600/10'
                    : 'bg-amber-600/10'
                }`}
              >
                <CheckCircle2
                  className={`h-5 w-5 ${
                    audit.status === 'COMPLETED'
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold">{audit.status}</p>
              </div>
            </div>
          </div>
          {audit.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{audit.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Sections */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="operational">Operations</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <FinancialAnalysisSection audit={audit} currency={currency} />
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <OccupancyAnalysisSection audit={audit} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueAnalysisSection audit={audit} currency={currency} />
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <OperationalAnalysisSection audit={audit} />
        </TabsContent>

        <TabsContent value="guests" className="space-y-6">
          <GuestAnalysisSection audit={audit} currency={currency} />
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6">
          <GuestLedgerSection audit={audit} currency={currency} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <ComparisonSection audit={audit} currency={currency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
