import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { handleApiError } from '@/lib/api/error-handler';
import { useNotification } from '@/hooks/useNotification';
import { fetchSettings, updateSettings } from '@/store/slices/nightAuditSlice';

interface SettingsFormProps {
  propertyId: string | null;
}

export function SettingsForm({ propertyId }: SettingsFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { success, error } = useNotification();
  const { settings, loading } = useSelector((s: RootState) => s.nightAudit);

  const [form, setForm] = useState({
    dayOpenTime: '06:00',
    dayCloseTime: '23:59',
    autoRunNightAudit: false,
    nightAuditTime: '00:00',
    defaultCheckInTime: '14:00',
    defaultCheckOutTime: '11:00',
    lateCheckOutGracePeriod: 60,
    earlyCheckInGracePeriod: 120,
    autoCloseDay: false,
    requireApproval: true,
  });
  const [loadedPropertyId, setLoadedPropertyId] = useState<string | null>(null);

  // Fetch settings only once per property
  useEffect(() => {
    if (!propertyId) return;
    // Only fetch if we haven't loaded settings for this property yet
    if (propertyId !== loadedPropertyId && !loading['settings']) {
      dispatch(fetchSettings(propertyId));
      setLoadedPropertyId(propertyId);
    }
  }, [dispatch, propertyId, loadedPropertyId, loading]);

  // Update form when settings are loaded
  useEffect(() => {
    if (settings && settings.propertyId === propertyId) {
      setForm({
        dayOpenTime: settings.dayOpenTime,
        dayCloseTime: settings.dayCloseTime,
        autoRunNightAudit: settings.autoRunNightAudit,
        nightAuditTime: settings.nightAuditTime,
        defaultCheckInTime: settings.defaultCheckInTime,
        defaultCheckOutTime: settings.defaultCheckOutTime,
        lateCheckOutGracePeriod: settings.lateCheckOutGracePeriod,
        earlyCheckInGracePeriod: settings.earlyCheckInGracePeriod,
        autoCloseDay: settings.autoCloseDay,
        requireApproval: settings.requireApproval,
      });
    }
  }, [settings, propertyId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: name.includes('GracePeriod') ? Number(value) : value }));
  };

  const handleCheck = (name: keyof typeof form, checked: boolean) => {
    setForm((f) => ({ ...f, [name]: checked }));
  };

  const handleSubmit = async () => {
    if (!propertyId) return;
    try {
      await dispatch(updateSettings({ propertyId, data: form })).unwrap();
      success('Settings updated');
    } catch (e) {
      const apiErr = handleApiError(e as any);
      error(apiErr.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm mb-1 block">Day Open Time</label>
          <Input name="dayOpenTime" value={form.dayOpenTime} onChange={handleChange} placeholder="HH:MM" />
        </div>
        <div>
          <label className="text-sm mb-1 block">Day Close Time</label>
          <Input name="dayCloseTime" value={form.dayCloseTime} onChange={handleChange} placeholder="HH:MM" />
        </div>
        <div>
          <label className="text-sm mb-1 block">Night Audit Time</label>
          <Input name="nightAuditTime" value={form.nightAuditTime} onChange={handleChange} placeholder="HH:MM" />
        </div>
        <div>
          <label className="text-sm mb-1 block">Default Check-In Time</label>
          <Input name="defaultCheckInTime" value={form.defaultCheckInTime} onChange={handleChange} placeholder="HH:MM" />
        </div>
        <div>
          <label className="text-sm mb-1 block">Default Check-Out Time</label>
          <Input name="defaultCheckOutTime" value={form.defaultCheckOutTime} onChange={handleChange} placeholder="HH:MM" />
        </div>
        <div>
          <label className="text-sm mb-1 block">Late Check-Out Grace (min)</label>
          <Input name="lateCheckOutGracePeriod" value={String(form.lateCheckOutGracePeriod)} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm mb-1 block">Early Check-In Grace (min)</label>
          <Input name="earlyCheckInGracePeriod" value={String(form.earlyCheckInGracePeriod)} onChange={handleChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <Checkbox checked={form.autoRunNightAudit} onCheckedChange={(c) => handleCheck('autoRunNightAudit', Boolean(c))} />
          <span>Auto run night audit</span>
        </label>
        <label className="flex items-center space-x-2">
          <Checkbox checked={form.autoCloseDay} onCheckedChange={(c) => handleCheck('autoCloseDay', Boolean(c))} />
          <span>Auto close day</span>
        </label>
        <label className="flex items-center space-x-2">
          <Checkbox checked={form.requireApproval} onCheckedChange={(c) => handleCheck('requireApproval', Boolean(c))} />
          <span>Require approval</span>
        </label>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!propertyId || loading['updateSettings']} className="cursor-pointer">Save</Button>
      </div>
    </div>
  );
}


