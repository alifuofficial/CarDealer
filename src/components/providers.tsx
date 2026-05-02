"use client";

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { OrganizationProvider } from "./organization-provider";
import { BrandingUpdater } from "./branding-updater";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OrganizationProvider>
        <BrandingUpdater />
        <TooltipProvider>
          {children}
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </OrganizationProvider>
    </SessionProvider>
  );
}
