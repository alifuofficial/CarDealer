import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PaymentReviewClient } from "./review-client";

export default async function PaymentReviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const [rawProformas, companyAccounts] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT 
        p.*,
        c.name as "customerName", c.phone as "customerPhone",
        cu.chassisNumber as "carChassis",
        m.name as "modelName"
      FROM Proforma p
      LEFT JOIN Customer c ON p.customerId = c.id
      LEFT JOIN CarUnit cu ON p.carUnitId = cu.id
      LEFT JOIN CarModel m ON cu.modelId = m.id
      WHERE p.id = ${id}
      LIMIT 1
    `,
    prisma.companyAccount.findMany({ where: { isActive: true } }),
  ]);

  if (!rawProformas || rawProformas.length === 0) notFound();

  const raw = rawProformas[0];
  const proforma = {
    ...raw,
    customer: { name: raw.customerName, phone: raw.customerPhone },
    carUnit: { chassisNumber: raw.carChassis, model: { name: raw.modelName } },
  };

  // Only accountants can review UNDER_REVIEW proformas
  if (proforma.status !== "UNDER_REVIEW") {
    notFound();
  }

  return <PaymentReviewClient proforma={proforma} companyAccounts={companyAccounts} />;
}
