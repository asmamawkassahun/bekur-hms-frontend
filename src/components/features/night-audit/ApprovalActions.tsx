import React from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { approveNightAudit, reopenNightAudit, deleteNightAudit } from '@/store/slices/nightAuditSlice';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import { PermissionGuard } from '@/components/guards/PermissionGuard';

interface ApprovalActionsProps {
  auditId: string;
}

export function ApprovalActions({ auditId }: ApprovalActionsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { success, error } = useNotification();

  const onApprove = async () => {
    try {
      await dispatch(approveNightAudit({ id: auditId, data: {} })).unwrap();
      success('Night audit approved');
    } catch (e) {
      const apiErr = handleApiError(e as any);
      error(apiErr.message);
    }
  };

  const onReopen = async () => {
    try {
      await dispatch(reopenNightAudit(auditId)).unwrap();
      success('Night audit reopened');
    } catch (e) {
      const apiErr = handleApiError(e as any);
      error(apiErr.message);
    }
  };

  const onDelete = async () => {
    try {
      await dispatch(deleteNightAudit(auditId)).unwrap();
      success('Night audit deleted');
    } catch (e) {
      const apiErr = handleApiError(e as any);
      error(apiErr.message);
    }
  };

  return (
    <div className="flex gap-2">
      <PermissionGuard permission="night-audit:approve">
        <Button size="sm" onClick={onApprove} className="cursor-pointer">Approve</Button>
      </PermissionGuard>
      <PermissionGuard permission="night-audit:reopen">
        <Button size="sm" variant="outline" onClick={onReopen} className="cursor-pointer">Reopen</Button>
      </PermissionGuard>
      <PermissionGuard permission="night-audit:delete">
        <Button size="sm" variant="destructive" onClick={onDelete} className="cursor-pointer">Delete</Button>
      </PermissionGuard>
    </div>
  );
}


