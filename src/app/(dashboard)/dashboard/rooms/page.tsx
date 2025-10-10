'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RoomsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/rooms/list');
  }, [router]);

  return null;
}
