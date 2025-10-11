import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { nightAuditService } from '@/services/night-audit.service';
import { runNightAudit } from '@/store/slices/nightAuditSlice';
import { handleApiError } from '@/lib/api/error-handler';
import { useNotification } from '@/hooks/useNotification';

interface RunNightAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string | null;
}

export function RunNightAuditDialog({ open, onOpenChange, propertyId }: RunNightAuditDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { success, error } = useNotification();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessDate, setBusinessDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrent = async () => {
      if (!open || !propertyId) return;
      try {
        const res = await nightAuditService.getCurrent(propertyId);
        setBusinessDate(res.data.data?.businessDate?.slice(0, 10) || null);
      } catch (e) {
        const apiErr = handleApiError(e as any);
        error(apiErr.message);
      }
    };
    fetchCurrent();
  }, [open, propertyId, error]);

  const handleRun = async () => {
    if (!propertyId || !businessDate) return;
    setLoading(true);
    try {
      await dispatch(
        runNightAudit({ propertyId, businessDate, notes: notes || undefined }),
      ).unwrap();
      success('Night audit completed successfully');
      onOpenChange(false);
      setNotes('');
    } catch (e) {
      const apiErr = handleApiError(e as any);
      error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run Night Audit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Property</div>
            <div className="font-medium">{propertyId || 'Select a property'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Business Date</div>
            <div className="font-medium">{businessDate || 'Loading...'}</div>
          </div>
          <div>
            <div className="text-sm mb-1">Notes (optional)</div>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleRun} disabled={!propertyId || !businessDate || loading} className="cursor-pointer">
              {loading ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


