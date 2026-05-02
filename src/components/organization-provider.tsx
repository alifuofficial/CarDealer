"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getOrganization } from "@/lib/actions/organization";

type Organization = {
  name: string;
  siteTitle: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

type OrganizationContextType = {
  organization: Organization | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children, initialData }: { children: React.ReactNode, initialData?: any }) {
  const [organization, setOrganization] = useState<Organization | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  const fetchOrganization = async () => {
    try {
      const data = await getOrganization();
      setOrganization(data as any);
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchOrganization();
    }
  }, [initialData]);

  return (
    <OrganizationContext.Provider value={{ organization, loading, refresh: fetchOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
