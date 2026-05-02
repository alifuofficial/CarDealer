"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCompanyAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Unauthorized");

  const bankName = formData.get("bankName") as string;
  const accountName = formData.get("accountName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const swiftCode = formData.get("swiftCode") as string;

  await prisma.companyAccount.create({
    data: {
      bankName,
      accountName,
      accountNumber,
      swiftCode: swiftCode || null,
    },
  });

  revalidatePath("/settings");
}

export async function deleteCompanyAccount(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.companyAccount.delete({
    where: { id },
  });

  revalidatePath("/settings");
}

export async function getCompanyAccounts() {
  return await prisma.companyAccount.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}
