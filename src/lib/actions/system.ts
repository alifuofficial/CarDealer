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
        name: "Soreti International Trading",
        logoUrl: null,
        faviconUrl: null,
        address: "",
        phone: "",
        email: "",
        website: "",
        tin: "",
        siteTitle: "Soreti International Trading",
        isVatEnabled: true,
        vatRate: 15.0,
        isSmsEnabled: false,
        isEmailEnabled: false,
        smsApiKey: "",
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPassword: "",
        smtpFromEmail: "",
        smtpFromName: "",
        defaultExpiryDays: 15,
        ftpHost: "",
        ftpPort: 21,
        ftpUser: "",
        ftpPassword: "",
        ftpRoot: "/",
        ftpIsSecure: false,
        isFtpEnabled: false,
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
