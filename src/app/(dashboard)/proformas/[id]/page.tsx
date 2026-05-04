import { getProforma } from "@/lib/actions/proformas";
import { getOrganization } from "@/lib/actions/organization";
import { getCompanyAccounts } from "@/lib/actions/accounts";
import { ProformaView } from "../proforma-view";
import { notFound } from "next/navigation";

export default async function ProformaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [proforma, organization, companyAccounts] = await Promise.all([
    getProforma(id),
    getOrganization(),
    getCompanyAccounts(),
  ]);

  if (!proforma) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ProformaView 
        proforma={proforma} 
        organization={organization} 
        companyAccounts={companyAccounts} 
      />
    </div>
  );
}
