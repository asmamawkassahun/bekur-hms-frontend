'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { propertyService } from '@/services/property.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { AiosellStatsCards } from '@/components/features/aiosell/AiosellStatsCards';
import { AiosellTableRow } from '@/components/features/aiosell/AiosellTableRow';
import type { Property } from '@/types';

export default function AiosellOverviewPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertyService.getAll();
      // Filter only properties with hotelCode
      const aiosellProperties = response.data.data.filter(
        (p: Property) => p.hotelCode,
      );
      setProperties(aiosellProperties);
    } catch (error) {
      console.error('Failed to load properties', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'property', label: 'Property', width: 'w-[200px]' },
    { key: 'hotelCode', label: 'Hotel Code', width: 'w-[150px]' },
    { key: 'location', label: 'Location', width: 'w-[180px]' },
    { key: 'syncStatus', label: 'Sync Status', width: 'w-[150px]' },
    { key: 'actions', label: 'Actions', width: 'w-[200px]', sortable: false },
  ];

  const renderAiosellRow = (property: Property) => (
    <AiosellTableRow key={property.id} property={property} />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Channel Manager"
        description="Manage Aiosell integration and OTA distribution"
      >
        <Button asChild className="cursor-pointer">
          <Link href="/dashboard/properties">
            <Plus className="mr-2 h-4 w-4" />
            Configure Properties
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <AiosellStatsCards connectedProperties={properties.length} />

      {/* Data Table */}
      <DataTable
        title="Connected Properties"
        description="Properties integrated with Aiosell Channel Manager"
        columns={columns}
        data={properties}
        loading={loading}
        emptyMessage="No properties connected to Aiosell yet. Add a hotel code to your properties to enable integration."
        renderRow={renderAiosellRow}
      />
    </div>
  );
}
