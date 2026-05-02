"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const rawName = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const type = formData.get("type") as string;
  const sellerName = session.user?.name || "Unknown Seller";

  if (!rawName || !phone || !type) {
    throw new Error("Invalid input");
  }

  const formattedName = rawName;

  // Ethiopia Phone Formatting Logic:
  // 1. Remove all non-digits
  // 2. If starts with '0', replace '0' with '251'
  // 3. If doesn't start with '251', prefix with '251'
  let formattedPhone = phone.trim().replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "251" + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith("251")) {
    formattedPhone = "251" + formattedPhone;
  }

  // Double check if phone exists
  const existing = await prisma.customer.findUnique({
    where: { phone: formattedPhone }
  });

  if (existing) {
    throw new Error("A customer with this phone number already exists in the system.");
  }

  try {
    await prisma.customer.create({
      data: {
        name: formattedName,
        phone: formattedPhone,
        type: type,
        createdById: (session.user as any).id,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error("A customer with this phone number already exists.");
    }
    throw error;
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const type = formData.get("type") as string;

  if (!name || !phone || !type) {
    throw new Error("Invalid input");
  }

  await prisma.customer.update({
    where: { id },
    data: { name, phone, type },
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function deleteCustomer(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Check if customer has proformas
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { proformas: true } } }
  });

  if (customer && customer._count.proformas > 0) {
    throw new Error("Cannot delete customer with existing proformas.");
  }

  await prisma.customer.delete({
    where: { id },
  });

  revalidatePath("/customers");
  return { success: true };
}
