"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;

  if (!name || !email || !password || !role) {
    throw new Error("Invalid input");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        phone: phone?.trim() || null,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      if (target.includes('email')) throw new Error("This email is already registered.");
      if (target.includes('phone')) throw new Error("This phone number is already linked to an account.");
      throw new Error("Email or Phone already in use.");
    }
    throw error;
  }

  revalidatePath("/users");
}

export async function updateUser(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  const data: any = { name, email, role, phone: phone?.trim() || null };

  if (password && password.trim().length > 0) {
    data.password = await bcrypt.hash(password, 10);
  }

  try {
    await prisma.user.update({
      where: { id },
      data,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      if (target.includes('email')) throw new Error("This email is already registered to another user.");
      if (target.includes('phone')) throw new Error("This phone number is already linked to another user.");
      throw new Error("Email or Phone already in use.");
    }
    throw error;
  }

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Prevent self-deletion
  if ((session.user as any).id === id) {
    throw new Error("You cannot delete your own account");
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/users");
  return { success: true };
}
