'use client';

import { TooltipProvider, Toaster } from '@whop/frosted-ui';
import { ReactNode } from 'react';

export function FrostedUIProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}

