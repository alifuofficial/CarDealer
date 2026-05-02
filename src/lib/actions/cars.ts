"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function importCarBatch(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const mode = (formData.get("mode") as string) ?? "auto";
  const unitPrice = parseFloat(formData.get("unitPrice") as string) || 0;

  if (mode === "auto") {
    const modelName = formData.get("modelName") as string;
    const totalUnits = parseInt(formData.get("totalUnits") as string);

    if (!modelName || isNaN(totalUnits) || totalUnits <= 0 || unitPrice <= 0) {
      throw new Error("Invalid input. Model name, units, and unit price are required.");
    }

    // Create Car Model
    const carModel = await prisma.carModel.create({
      data: {
        name: modelName,
        totalUnits: totalUnits,
      },
    });

    // Generate Car Units
    const unitsData = [];
    for (let i = 1; i <= totalUnits; i++) {
      const chassisNumber = `${modelName.substring(0, 3).toUpperCase()}-${Date.now()}-${i
        .toString()
        .padStart(3, "0")}`;
      unitsData.push({
        chassisNumber,
        modelId: carModel.id,
        status: "AVAILABLE",
        unitPrice: unitPrice,
      });
    }

    await prisma.carUnit.createMany({
      data: unitsData,
    });

    revalidatePath("/cars");
    revalidatePath("/dashboard");
    redirect("/cars");
  } else if (mode === "manual") {
    const modelName = formData.get("modelName") as string;
    const manualChassis = (formData.get("manualChassis") as string) || "";
    const chassisList = manualChassis
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!modelName || chassisList.length === 0 || unitPrice <= 0) {
      throw new Error("Invalid input. Model name, chassis list, and unit price are required.");
    }

    // Find or create model
    let carModel = await prisma.carModel.findFirst({ where: { name: modelName } });
    if (!carModel) {
      carModel = await prisma.carModel.create({
        data: { name: modelName, totalUnits: chassisList.length },
      });
    } else {
      // Update totalUnits to reflect new additions
      await prisma.carModel.update({
        where: { id: carModel.id },
        data: { totalUnits: (carModel.totalUnits ?? 0) + chassisList.length },
      });
    }

    const unitsData = chassisList.map((chassis) => ({ 
      chassisNumber: chassis, 
      modelId: carModel!.id, 
      status: "AVAILABLE",
      unitPrice: unitPrice 
    }));
    await prisma.carUnit.createMany({ data: unitsData });

    revalidatePath("/cars");
    revalidatePath("/dashboard");
    redirect("/cars");
  } else if (mode === "csv") {
    const file = formData.get("importFile") as File;
    if (!file) {
      throw new Error("Invalid input. CSV file is required.");
    }
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const rows: string[][] = lines.map((l) => l.split(',').map((p) => p.trim()));

    // Detect header: if first row contains typical headers, skip it
    let startIndex = 0;
    if (rows.length > 0) {
      const first = rows[0].map((c) => c.toLowerCase());
      if (first.includes("chassisnumber") || first.includes("chassis") || first.includes("modelname") || first.length >= 2) {
        startIndex = 1;
      }
    }

    const modelMap: Map<string, string[]> = new Map();
    for (let i = startIndex; i < rows.length; i++) {
      const [chassis, modelName] = rows[i];
      if (!chassis || !modelName) continue;
      if (!modelMap.has(modelName)) modelMap.set(modelName, []);
      modelMap.get(modelName)!.push(chassis);
    }

    // Process each model group
    for (const [modelName, chassisList] of modelMap.entries()) {
      if (chassisList.length === 0) continue;
      let carModel = await prisma.carModel.findFirst({ where: { name: modelName } });
      if (!carModel) {
        carModel = await prisma.carModel.create({ data: { name: modelName, totalUnits: chassisList.length } });
      } else {
        await prisma.carModel.update({ where: { id: carModel.id }, data: { totalUnits: (carModel.totalUnits ?? 0) + chassisList.length } });
      }
      const unitsData = chassisList.map((chassis) => ({ 
        chassisNumber: chassis, 
        modelId: carModel!.id, 
        status: "AVAILABLE",
        unitPrice: unitPrice // Use the unitPrice from form for simplicity
      }));
      await prisma.carUnit.createMany({ data: unitsData });
    }

    revalidatePath("/cars");
    revalidatePath("/dashboard");
    redirect("/cars");
  }
}

export async function updateCarPrice(id: string, price: number) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.carUnit.update({
    where: { id },
    data: { unitPrice: price },
  });

  revalidatePath("/cars");
}

export async function updateModelPrices(modelId: string, price: number) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.carUnit.updateMany({
    where: { modelId },
    data: { unitPrice: price },
  });

  revalidatePath("/cars");
}

export async function updateCarUnit(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const chassisNumber = formData.get("chassisNumber") as string;
  const status = formData.get("status") as string;

  await prisma.carUnit.update({
    where: { id },
    data: {
      chassisNumber,
      status,
    },
  });

  revalidatePath("/cars");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCarUnit(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.carUnit.delete({
    where: { id },
  });

  revalidatePath("/cars");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAllCars() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Delete all units first
  await prisma.carUnit.deleteMany();
  // Optionally delete models too if requested, but user said "delete all cars"
  await prisma.carModel.deleteMany();

  revalidatePath("/cars");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCarsByModel(modelId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.carUnit.deleteMany({
    where: { modelId },
  });

  // Also remove the model itself
  await prisma.carModel.delete({
    where: { id: modelId },
  });

  revalidatePath("/cars");
  revalidatePath("/dashboard");
  return { success: true };
}
