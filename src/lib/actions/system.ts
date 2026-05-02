"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function resetSystemData() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const currentUserId = (session.user as any).id;

  try {
    // Delete in order of dependency to avoid foreign key constraints
    await prisma.proforma.deleteMany();
    await prisma.smsLog.deleteMany();
    await prisma.carUnit.deleteMany();
    await prisma.carModel.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.bank.deleteMany();
    await prisma.companyAccount.deleteMany();
    
    // Delete all users except the current admin
    await prisma.user.deleteMany({
      where: {
        id: { not: currentUserId }
      }
    });

    // Reset organization settings but keep the singleton
    await prisma.organization.update({
      where: { id: "singleton" },
      data: {
        name: "Alif Soreti Car Dealer",
        logoUrl: null,
        faviconUrl: null,
        address: null,
        phone: null,
        email: null,
        website: null,
        tin: null,
        siteTitle: "Soreti Car Dealer",
        isVatEnabled: true,
        vatRate: 15.0,
        isSmsEnabled: false,
        isEmailEnabled: false,
        smsApiKey: null,
        smtpHost: null,
        smtpPort: 587,
        smtpUser: null,
        smtpPassword: null,
        smtpFromEmail: null,
        smtpFromName: null,
        defaultExpiryDays: 15,
      }
    });

    // We keep SmsTemplate because they are system defaults, 
    // but you could wipe them too if requested.

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/customers");
    revalidatePath("/inventory");
    revalidatePath("/proformas");
    revalidatePath("/users");
    revalidatePath("/settings");

    return { success: true, message: "System data has been completely reset." };
  } catch (error: any) {
    console.error("Reset Error:", error);
    throw new Error("Failed to reset system data: " + error.message);
  }
}
