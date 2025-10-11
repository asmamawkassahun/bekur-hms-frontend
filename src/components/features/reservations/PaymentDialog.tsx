'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign, MessageSquare, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { createPayment } from '@/store/slices/paymentSlice';
import { useNotification } from '@/hooks/useNotification';

interface PaymentDialogProps {
    open: boolean;
    onClose: () => void;
    reservation: any;
    unpaidAmount: number;
    onPaymentSuccess: () => void;
}

export function PaymentDialog({
    open,
    onClose,
    reservation,
    unpaidAmount,
    onPaymentSuccess,
}: PaymentDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { success, error: showError } = useNotification();

    const [paymentMode, setPaymentMode] = useState('');
    const [amount, setAmount] = useState(unpaidAmount);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update amount when unpaidAmount changes
    useEffect(() => {
        setAmount(unpaidAmount);
    }, [unpaidAmount]);

    const handlePayment = async () => {
        // Validation
        if (!paymentMode) {
            showError('Please select a payment mode');
            return;
        }

        if (amount <= 0) {
            showError('Payment amount must be greater than 0');
            return;
        }

        if (amount > unpaidAmount) {
            showError(`Payment amount cannot exceed unpaid balance of ${unpaidAmount}`);
            return;
        }

        setIsSubmitting(true);

        try {
            // Map payment mode to API format
            const methodMap: { [key: string]: string } = {
                cash: 'CASH',
                card: 'CARD',
                bank: 'BANK_TRANSFER',
                upi: 'MOBILE_MONEY',
                crypto: 'CRYPTO',
            };

            const paymentData = {
                bookingId: reservation.id,
                guestId: reservation.primaryGuestId,
                amount: amount,
                method: methodMap[paymentMode] as any,
                currency: reservation.property?.currency || 'ETB',
                notes: remarks || 'Payment for checkout',
            };

            await dispatch(createPayment(paymentData)).unwrap();
            success('Payment processed successfully!');

            // Reset form
            setPaymentMode('');
            setAmount(unpaidAmount);
            setRemarks('');

            // Call success callback
            onPaymentSuccess();

            // Close dialog
            onClose();
        } catch (err: any) {
            console.error('Payment Error:', err);
            showError(err.message || 'Failed to process payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setPaymentMode('');
            setAmount(unpaidAmount);
            setRemarks('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Payment Required</DialogTitle>
                    <DialogDescription>
                        Complete payment before checking out the guest.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Reservation Info */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-red-900">Unpaid Balance</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">
                                    {reservation.property?.currency || 'ETB'} {unpaidAmount.toFixed(2)}
                                </p>
                                <p className="text-sm text-red-700 mt-1">
                                    Guest: {reservation.primaryGuest?.firstName} {reservation.primaryGuest?.lastName}
                                </p>
                                <p className="text-xs text-red-600">
                                    Room: {reservation.room?.number || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="paymentMode" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payment Mode*
                            </Label>
                            <Select value={paymentMode} onValueChange={setPaymentMode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose Payment Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                    <SelectItem value="upi">Mobile Money</SelectItem>
                                    <SelectItem value="crypto">Crypto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Payment Amount*
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="Enter amount"
                                min="0"
                                max={unpaidAmount}
                                step="0.01"
                            />
                            <p className="text-xs text-gray-500">
                                Maximum: {unpaidAmount.toFixed(2)} {reservation.property?.currency || 'ETB'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Remarks
                            </Label>
                            <Input
                                id="remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Payment remarks (optional)"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePayment}
                        disabled={isSubmitting || !paymentMode || amount <= 0}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isSubmitting ? 'Processing...' : 'Process Payment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

