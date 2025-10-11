import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Receipt,
  Tag,
  TrendingDown,
  Percent,
} from 'lucide-react';

interface PricingRule {
  name?: string;
  adjustmentType?: string;
  value: number;
}

interface PricingBreakdownProps {
  pricingData: {
    pricing: {
      nights: number;
      basePricePerNight: number;
      subtotal: number;
      pricingRulesApplied: PricingRule[];
      priceAfterRules: number;
      taxRate: number;
      taxAmount: number;
      discount: number;
      totalPrice: number;
      finalPrice: number;
    };
    commission?: {
      commissionRate: number;
      commissionAmount: number;
      netRevenue: number;
    } | null;
  } | null;
  currency: string;
}

export function PricingBreakdown({
  pricingData,
  currency,
}: PricingBreakdownProps) {
  const [showRules, setShowRules] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'ETB',
    }).format(amount);
  };

  if (!pricingData || !pricingData.pricing) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Select accommodation to see pricing details</p>
      </div>
    );
  }

  const { pricing, commission } = pricingData;

  return (
    <div className="space-y-4">
      {/* Base Pricing */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Base Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Number of Nights</span>
            <span className="font-medium">{pricing.nights}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price per Night</span>
            <span className="font-medium">
              {formatCurrency(pricing.basePricePerNight)}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span>{formatCurrency(pricing.subtotal)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Rules Applied */}
      {pricing.pricingRulesApplied &&
        pricing.pricingRulesApplied.length > 0 && (
          <Card className="bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Dynamic Pricing Rules Applied
                  <Badge variant="secondary" className="ml-2">
                    {pricing.pricingRulesApplied.length}
                  </Badge>
                </CardTitle>
                <button
                  onClick={() => setShowRules(!showRules)}
                  className="text-primary hover:text-primary/80"
                >
                  {showRules ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </CardHeader>
            {showRules && (
              <CardContent className="space-y-2">
                {pricing.pricingRulesApplied.map(
                  (rule: PricingRule, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm p-2 bg-background rounded"
                    >
                      <span className="text-muted-foreground">
                        {rule.name || `Rule ${index + 1}`}
                      </span>
                      <span className="font-medium text-primary">
                        {rule.adjustmentType === 'PERCENTAGE'
                          ? `${rule.value}%`
                          : formatCurrency(rule.value)}
                      </span>
                    </div>
                  ),
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Price After Rules</span>
                  <span>{formatCurrency(pricing.priceAfterRules)}</span>
                </div>
              </CardContent>
            )}
          </Card>
        )}

      {/* Tax & Charges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Tax & Charges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax Rate</span>
            <span className="font-medium">{pricing.taxRate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax Amount</span>
            <span className="font-medium">
              {formatCurrency(pricing.taxAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service Charge</span>
            <span className="font-medium">{formatCurrency(0)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Discount */}
      {pricing.discount > 0 && (
        <Card className="bg-green-500/10 dark:bg-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingDown className="h-4 w-4" />
              Discount Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm font-semibold text-green-700 dark:text-green-400">
              <span>Discount Amount</span>
              <span>-{formatCurrency(pricing.discount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission (only if booking source is selected) */}
      {commission && (
        <Card className="bg-orange-500/10 dark:bg-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Commission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Commission Rate</span>
              <span className="font-medium">{commission.commissionRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Commission Amount</span>
              <span className="font-medium">
                {formatCurrency(commission.commissionAmount)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Net Revenue</span>
              <span className="text-primary">
                {formatCurrency(commission.netRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Total */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Price</span>
              <span className="font-medium">
                {formatCurrency(pricing.totalPrice)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Final Price</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(pricing.finalPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
