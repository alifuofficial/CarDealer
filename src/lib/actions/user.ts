"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) throw new Error("Name and email are required");

  const userId = (session.user as any).id;
  const oldName = session.user?.name;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
    },
  });

  // Also update all customer names created by this user to reflect the new seller name
  // Rule: {Customer Name} - {Seller Name}
  const customers = await prisma.customer.findMany({
    where: { createdById: userId }
  });

  for (const customer of customers) {
    const rawCustomerName = customer.name.split(" - ")[0];
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: `${rawCustomerName} - ${name}`
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath("/dashboard");
}

import bcrypt from "bcryptjs";

export async function updatePassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Incorrect current password");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed }
  });

  return { success: true };
}
