import React from "react";
import { getOrganization } from "@/lib/actions/organization";
import { SettingsClient } from "@/components/settings-client";
import { getBanks } from "@/lib/actions/banks";
import { getCompanyAccounts } from "@/lib/actions/accounts";
import { getSmsTemplates } from "@/lib/actions/marketing";

// Force dynamic rendering to ensure fresh data after deployment
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const [organization, banks, companyAccounts, smsTemplates] = await Promise.all([
    getOrganization(),
    getBanks(),
    getCompanyAccounts(),
    getSmsTemplates(),
  ]);

  return (
    <SettingsClient 
      organization={organization} 
      banks={banks} 
      companyAccounts={companyAccounts} 
      smsTemplates={smsTemplates}
    />
  );
}
