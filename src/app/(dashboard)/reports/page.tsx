import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN" && (session.user as any).role !== "ACCOUNTANT") {
    redirect("/dashboard");
  }

  const [proformas, carUnits, organization] = await Promise.all([
    prisma.proforma.findMany({
      include: {
        customer: true,
        carUnit: {
          include: {
            model: true
          }
        },
        bank: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.carUnit.findMany({
      include: {
        model: true
      }
    }),
    prisma.organization.findUnique({
      where: { id: "singleton" }
    })
  ]);

  return (
    <ReportsClient 
      proformas={proformas} 
      carUnits={carUnits} 
      organization={organization || {}} 
    />
  );
}
