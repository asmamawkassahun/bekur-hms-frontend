'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HelpCircle } from 'lucide-react';
import { helpService } from '@/services/help.service';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';
import { useNotification } from '@/hooks/useNotification';
import type { SystemStatus } from '@/types/help.types';

export default function HelpPage() {
  const { success, error } = useNotification();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await helpService.getSystemStatus();
      setStatus(res.data.data || null);
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const submitSupport = async () => {
    try {
      await helpService.submitSupportRequest({ name, email, subject, message, priority: 'MEDIUM' });
      success('Support request submitted');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground mt-1">Guides, FAQs, tutorials, and support</p>
        </div>
      </div>

      {/* Quick Start Guides */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" /><CardTitle>User Guides</CardTitle></div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GuideCard title="Getting Started" description="Overview of navigation, login, and basic workflows" />
          <GuideCard title="Managing Properties" description="Create, edit, and manage properties" />
          <GuideCard title="Rooms & Dormitories" description="Create rooms, beds, and manage occupancy" />
          <GuideCard title="Reservations" description="Search, create, and manage reservations" />
          <GuideCard title="Payments & Invoices" description="Process payments and generate invoices" />
          <GuideCard title="Reports & Analytics" description="View revenue and occupancy metrics" />
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FaqItem q="How do I reset my password?" a="Use Forgot Password on the login page. You'll receive an email with steps." />
          <Separator />
          <FaqItem q="How can I add a new property?" a="Go to Properties and click New Property. Fill the form and save." />
          <Separator />
          <FaqItem q="Why don't I see my newly created room?" a="Make sure filters and pagination are correct; data may require a refresh." />
          <Separator />
          <FaqItem q="How do I contact support?" a="Use the Contact Support form below, or email your admin." />
        </CardContent>
      </Card>

      {/* Video Tutorials */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader><CardTitle>Video Tutorials</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VideoThumb title="Onboarding Tour" />
          <VideoThumb title="Property Management" />
          <VideoThumb title="Rooms & Beds" />
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader><CardTitle>Contact Support</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} /></div>
          <div className="md:col-span-2 space-y-2"><Label>Subject</Label><Input value={subject} onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} /></div>
          <div className="md:col-span-2 space-y-2"><Label>Message</Label><textarea className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} rows={4} /></div>
          <div className="md:col-span-2"><Button className="bg-primary" onClick={submitSupport}>Submit</Button></div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>System Status</CardTitle>
          <Button variant="outline" onClick={loadStatus} disabled={loadingStatus}>Refresh</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={statusColor(status?.overall)}>{status?.overall || 'UNKNOWN'}</Badge>
            {status?.uptimePercentage !== undefined && (
              <span className="text-sm text-muted-foreground">Uptime: {status.uptimePercentage}%</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(status?.services || []).map((s) => (
              <div key={s.name} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.name}</div>
                  <Badge variant={statusColor(s.status)}>{s.status}</Badge>
                </div>
                {s.responseTimeMs !== undefined && (
                  <div className="text-xs text-muted-foreground mt-1">Resp: {s.responseTimeMs} ms</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GuideCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="font-medium mb-1">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <div className="font-medium">{q}</div>
      <div className="text-sm text-muted-foreground mt-1">{a}</div>
    </div>
  );
}

function VideoThumb({ title }: { title: string }) {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="aspect-video w-full rounded bg-muted" />
      <div className="text-sm">{title}</div>
    </div>
  );
}

function statusColor(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'OPERATIONAL': return 'default';
    case 'DEGRADED': return 'secondary';
    case 'OUTAGE': return 'destructive';
    default: return 'outline';
  }
}
