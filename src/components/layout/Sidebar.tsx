'use client';

import React from 'react';
import { SidebarContent } from './SidebarContent';

interface SidebarProps {
  sidebarOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({}: SidebarProps) {
  return (
    <div className="flex h-screen flex-col bg-sidebar text-sidebar-foreground fixed left-0 top-0 w-64 z-10 overflow-y-auto">
      <SidebarContent />
    </div>
  );
}
