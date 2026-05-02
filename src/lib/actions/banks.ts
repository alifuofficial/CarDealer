"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBank(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;

  if (!name || !type) throw new Error("Name and type are required");

  await prisma.bank.create({
    data: { name, type },
  });

  revalidatePath("/settings");
}

export async function deleteBank(id: string) {
  await prisma.bank.delete({ where: { id } });
  revalidatePath("/settings");
}

export async function getBanks() {
  return await prisma.bank.findMany({
    orderBy: { name: "asc" }
  });
}
