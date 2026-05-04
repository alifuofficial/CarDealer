"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const rawName = formData.get("name") as string;
  const rawEmail = formData.get("email") as string;

  const validated = profileSchema.safeParse({ name: rawName, email: rawEmail });
  if (!validated.success) {
    throw new Error(validated.error.errors[0].message);
  }

  const { name, email } = validated.data;
  const userId = (session.user as any).id;
  
  // Check if email is already taken by another user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.id !== userId) {
    throw new Error("Email already in use");
  }

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

  const updateData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = passwordSchema.safeParse(updateData);
  if (!validated.success) {
    throw new Error(validated.error.errors[0].message);
  }

  const { currentPassword, newPassword } = validated.data;

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
