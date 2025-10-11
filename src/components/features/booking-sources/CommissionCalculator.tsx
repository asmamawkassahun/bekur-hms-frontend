import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { calculateCommission } from '@/store/slices/bookingSourceSlice';
import { useNotification } from '@/hooks/useNotification';
import type { BookingSource } from '@/services/booking.service';

interface CommissionCalculatorProps {
  bookingSource: BookingSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommissionCalculator({
  bookingSource,
  open,
  onOpenChange,
}: CommissionCalculatorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useNotification();
  const [amount, setAmount] = useState<number>(1000);
  const [result, setResult] = useState<{
    amount: number;
    commissionRate: number;
    commissionAmount: number;
    netAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!bookingSource) return null;

  const handleCalculate = async () => {
    if (amount <= 0) {
      error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(
        calculateCommission({
          amount: amount,
          commissionRate: bookingSource.commissionRate,
        }),
      ).unwrap();
      setResult(response.data);
    } catch (err) {
      error('Failed to calculate commission');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Commission Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Source:</span>
                <span className="font-medium">{bookingSource.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission Rate:</span>
                <span className="font-medium">
                  {bookingSource.commissionRate}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Booking Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="Enter booking amount"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={handleCalculate}
            disabled={loading || amount <= 0}
            className="w-full"
          >
            {loading ? 'Calculating...' : 'Calculate Commission'}
          </Button>

          {/* Results */}
          {result && (
            <Card className="bg-primary/5">
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(result.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Commission Rate:
                  </span>
                  <span className="font-medium">{result.commissionRate}%</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                  <span className="font-medium">Commission Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(result.commissionAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span className="font-medium">Net Revenue:</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(result.netAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
