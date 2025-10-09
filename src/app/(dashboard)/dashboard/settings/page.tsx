'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchSettings, updateSettings } from '@/store/slices/settingsSlice';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading } = useSelector((s: RootState) => s.settings);
  const { success, error } = useNotification();

  const [hotel, setHotel] = useState({ name: '', logoUrl: '', address: '', city: '', country: '' });
  const [prefs, setPrefs] = useState({ timezone: 'Africa/Addis_Ababa', currency: 'ETB', language: 'en' });
  const [notif, setNotif] = useState({ emailEnabled: true, reservationAlerts: true, paymentAlerts: true });
  const [sec, setSec] = useState({ passwordMinLength: 8, requireNumbers: true, requireUppercase: true, requireSymbols: false, sessionTimeoutMinutes: 60 });
  const [integr, setIntegr] = useState({ paymentGatewayKey: '', emailProviderKey: '', webhookUrl: '' });

  useEffect(() => { (async () => { try { await dispatch(fetchSettings()).unwrap(); } catch (e) { const apiErr = handleApiError(e as AxiosError); error(apiErr.message); } })(); }, [dispatch, error]);
  useEffect(() => {
    if (settings) {
      setHotel({ name: settings.hotel?.name || '', logoUrl: settings.hotel?.logoUrl || '', address: settings.hotel?.address || '', city: settings.hotel?.city || '', country: settings.hotel?.country || '' });
      setPrefs({ timezone: settings.preferences?.timezone || 'Africa/Addis_Ababa', currency: settings.preferences?.currency || 'ETB', language: settings.preferences?.language || 'en' });
      setNotif({ emailEnabled: !!settings.notifications?.emailEnabled, reservationAlerts: !!settings.notifications?.reservationAlerts, paymentAlerts: !!settings.notifications?.paymentAlerts });
      setSec({ passwordMinLength: settings.security?.passwordMinLength || 8, requireNumbers: !!settings.security?.requireNumbers, requireUppercase: !!settings.security?.requireUppercase, requireSymbols: !!settings.security?.requireSymbols, sessionTimeoutMinutes: settings.security?.sessionTimeoutMinutes || 60 });
      setIntegr({ paymentGatewayKey: settings.integrations?.paymentGatewayKey || '', emailProviderKey: settings.integrations?.emailProviderKey || '', webhookUrl: settings.integrations?.webhookUrl || '' });
    }
  }, [settings]);

  const onSave = async () => {
    try {
      await dispatch(updateSettings({ hotel, preferences: prefs, notifications: notif, security: sec, integrations: integr } as any)).unwrap();
      success('Settings saved');
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError); error(apiErr.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-foreground">Settings</h1><p className="text-muted-foreground mt-1">Configure hotel settings and preferences</p></div><Button className="bg-primary" onClick={onSave} disabled={loading}>Save Changes</Button></div>

      <Card className="bg-card border-0 shadow-sm"><CardHeader><CardTitle>Hotel Information & Branding</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Name</Label><Input value={hotel.name} onChange={(e) => setHotel((s) => ({ ...s, name: e.target.value }))} /></div><div className="space-y-2"><Label>Logo URL</Label><Input value={hotel.logoUrl} onChange={(e) => setHotel((s) => ({ ...s, logoUrl: e.target.value }))} /></div><div className="space-y-2"><Label>Address</Label><Input value={hotel.address} onChange={(e) => setHotel((s) => ({ ...s, address: e.target.value }))} /></div><div className="space-y-2"><Label>City</Label><Input value={hotel.city} onChange={(e) => setHotel((s) => ({ ...s, city: e.target.value }))} /></div><div className="space-y-2"><Label>Country</Label><Input value={hotel.country} onChange={(e) => setHotel((s) => ({ ...s, country: e.target.value }))} /></div></CardContent></Card>

      <Card className="bg-card border-0 shadow-sm"><CardHeader><CardTitle>System Preferences</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>Timezone</Label><Input value={prefs.timezone} onChange={(e) => setPrefs((s) => ({ ...s, timezone: e.target.value }))} /></div><div className="space-y-2"><Label>Currency</Label><Input value={prefs.currency} onChange={(e) => setPrefs((s) => ({ ...s, currency: e.target.value }))} /></div><div className="space-y-2"><Label>Language</Label><Input value={prefs.language || ''} onChange={(e) => setPrefs((s) => ({ ...s, language: e.target.value }))} /></div></CardContent></Card>

      <Card className="bg-card border-0 shadow-sm"><CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4"><label className="flex items-center gap-2"><Checkbox checked={notif.emailEnabled} onCheckedChange={(v) => setNotif((s) => ({ ...s, emailEnabled: Boolean(v) }))} />Email Notifications</label><label className="flex items-center gap-2"><Checkbox checked={notif.reservationAlerts} onCheckedChange={(v) => setNotif((s) => ({ ...s, reservationAlerts: Boolean(v) }))} />Reservation Alerts</label><label className="flex items-center gap-2"><Checkbox checked={notif.paymentAlerts} onCheckedChange={(v) => setNotif((s) => ({ ...s, paymentAlerts: Boolean(v) }))} />Payment Alerts</label></CardContent></Card>

      <Card className="bg-card border-0 shadow-sm"><CardHeader><CardTitle>Security Configurations</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>Password Min Length</Label><Input type="number" value={sec.passwordMinLength} onChange={(e) => setSec((s) => ({ ...s, passwordMinLength: Number(e.target.value) }))} /></div><label className="flex items-center gap-2"><Checkbox checked={sec.requireNumbers} onCheckedChange={(v) => setSec((s) => ({ ...s, requireNumbers: Boolean(v) }))} />Require Numbers</label><label className="flex items-center gap-2"><Checkbox checked={sec.requireUppercase} onCheckedChange={(v) => setSec((s) => ({ ...s, requireUppercase: Boolean(v) }))} />Require Uppercase</label><label className="flex items-center gap-2"><Checkbox checked={sec.requireSymbols} onCheckedChange={(v) => setSec((s) => ({ ...s, requireSymbols: Boolean(v) }))} />Require Symbols</label><div className="space-y-2"><Label>Session Timeout (min)</Label><Input type="number" value={sec.sessionTimeoutMinutes} onChange={(e) => setSec((s) => ({ ...s, sessionTimeoutMinutes: Number(e.target.value) }))} /></div></CardContent></Card>

      <Card className="bg-card border-0 shadow-sm"><CardHeader><CardTitle>Integration Settings</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>Payment Gateway Key</Label><Input value={integr.paymentGatewayKey || ''} onChange={(e) => setIntegr((s) => ({ ...s, paymentGatewayKey: e.target.value }))} /></div><div className="space-y-2"><Label>Email Provider Key</Label><Input value={integr.emailProviderKey || ''} onChange={(e) => setIntegr((s) => ({ ...s, emailProviderKey: e.target.value }))} /></div><div className="space-y-2 md:col-span-2"><Label>Webhook URL</Label><Input value={integr.webhookUrl || ''} onChange={(e) => setIntegr((s) => ({ ...s, webhookUrl: e.target.value }))} /></div></CardContent></Card>
    </div>
  );
}
