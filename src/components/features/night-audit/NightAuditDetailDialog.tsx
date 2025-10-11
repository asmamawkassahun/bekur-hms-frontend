import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { NightAudit } from '@/types/night-audit.types';

interface NightAuditDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audit: NightAudit | null;
}

export function NightAuditDetailDialog({ open, onOpenChange, audit }: NightAuditDetailDialogProps) {
  if (!audit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            Night Audit — {new Date(audit.businessDate).toLocaleDateString()} ({audit.status})
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="financial">
          <TabsList>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
            <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
          </TabsList>
          <TabsContent value="financial">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>Total Revenue: {audit.totalRevenue.toLocaleString()}</div>
              <div>Total Payments: {audit.totalPayments.toLocaleString()}</div>
              <div>Refunds: {audit.totalRefunds.toLocaleString()}</div>
              <div>Commission: {audit.totalCommission.toLocaleString()}</div>
              <div>Net: {audit.netRevenue.toLocaleString()}</div>
              <div>Net After Commission: {audit.netAfterCommission.toLocaleString()}</div>
            </div>
          </TabsContent>
          <TabsContent value="occupancy">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>Rooms: {audit.occupiedRooms}/{audit.totalRooms}</div>
              <div>Beds: {audit.occupiedBeds}/{audit.totalBeds}</div>
              <div>Room Occ: {audit.roomOccupancyRate.toFixed(1)}%</div>
              <div>Bed Occ: {audit.bedOccupancyRate.toFixed(1)}%</div>
            </div>
          </TabsContent>
          <TabsContent value="bookings">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>Total: {audit.totalBookings}</div>
              <div>Check-ins: {audit.checkIns}</div>
              <div>Check-outs: {audit.checkOuts}</div>
              <div>Cancellations: {audit.cancellations}</div>
              <div>No-shows: {audit.noShows}</div>
            </div>
          </TabsContent>
          <TabsContent value="guests">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>Total Guests: {audit.totalGuests}</div>
              <div>New Guests: {audit.newGuests}</div>
              <div>Returning Guests: {audit.returningGuests}</div>
            </div>
          </TabsContent>
          <TabsContent value="ledger">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {audit.guestLedger.map((entry) => (
                <div key={entry.bookingId} className="rounded border p-3">
                  <div className="font-medium">{entry.primaryGuest.name}</div>
                  <div className="text-sm text-muted-foreground">{entry.accommodation}</div>
                  <div className="text-sm">
                    Charges: {entry.charges.totalAmount.toLocaleString()} — Balance: {entry.balance.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="discrepancies">
            <ul className="list-disc pl-6 space-y-1">
              {audit.discrepancies.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


