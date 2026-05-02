"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateOrganization(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updateData: any = {};

  // Text fields - only add if present in formData
  if (formData.has("name")) updateData.name = formData.get("name") as string;
  if (formData.has("tin")) updateData.tin = formData.get("tin") as string;
  if (formData.has("address")) updateData.address = formData.get("address") as string;
  if (formData.has("phone")) updateData.phone = formData.get("phone") as string;
  if (formData.has("email")) updateData.email = formData.get("email") as string;
  if (formData.has("website")) updateData.website = formData.get("website") as string;
  if (formData.has("siteTitle")) updateData.siteTitle = formData.get("siteTitle") as string;
  if (formData.has("calendarType")) updateData.calendarType = formData.get("calendarType") as string;
  if (formData.has("smsApiKey")) updateData.smsApiKey = formData.get("smsApiKey") as string;
  if (formData.has("smtpHost")) updateData.smtpHost = formData.get("smtpHost") as string;
  if (formData.has("smtpUser")) updateData.smtpUser = formData.get("smtpUser") as string;
  if (formData.has("smtpPassword")) updateData.smtpPassword = formData.get("smtpPassword") as string;
  if (formData.has("smtpFromEmail")) updateData.smtpFromEmail = formData.get("smtpFromEmail") as string;
  if (formData.has("smtpFromName")) updateData.smtpFromName = formData.get("smtpFromName") as string;

  // Number fields
  if (formData.has("vatRate")) {
    const val = parseFloat(formData.get("vatRate") as string);
    if (!isNaN(val)) updateData.vatRate = val;
  }
  if (formData.has("defaultExpiryDays")) {
    const val = parseInt(formData.get("defaultExpiryDays") as string);
    if (!isNaN(val)) updateData.defaultExpiryDays = val;
  }
  if (formData.has("smtpPort")) {
    const val = parseInt(formData.get("smtpPort") as string);
    if (!isNaN(val)) updateData.smtpPort = val;
  }

  // Checkboxes - special handling for "on"
  if (formData.has("isVatEnabled")) {
    updateData.isVatEnabled = formData.get("isVatEnabled") === "on";
  } else if (formData.has("__has_isVatEnabled")) {
    // Hidden field to indicate the checkbox was present but unchecked
    updateData.isVatEnabled = false;
  }

  if (formData.has("isSmsEnabled")) {
    updateData.isSmsEnabled = formData.get("isSmsEnabled") === "on";
  } else if (formData.has("__has_isSmsEnabled")) {
    updateData.isSmsEnabled = false;
  }

  if (formData.has("isEmailEnabled")) {
    updateData.isEmailEnabled = formData.get("isEmailEnabled") === "on";
  } else if (formData.has("__has_isEmailEnabled")) {
    updateData.isEmailEnabled = false;
  }

  // Persistent storage for uploads (logo/favicon)
  const UPLOADS_DIR = process.env.NODE_ENV === "production" ? "/data/uploads" : path.join(process.cwd(), "public", "uploads");

  const logo = formData.get("logo") as File;
  if (logo && logo.size > 0) {
    const bytes = await logo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `logo-${Date.now()}${path.extname(logo.name)}`;
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filePath = path.join(UPLOADS_DIR, fileName);
    await writeFile(filePath, buffer);
    updateData.logoUrl = `/api/uploads/${fileName}`;
  }

  const favicon = formData.get("favicon") as File;
  if (favicon && favicon.size > 0) {
    const bytes = await favicon.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `favicon-${Date.now()}${path.extname(favicon.name)}`;
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filePath = path.join(UPLOADS_DIR, fileName);
    await writeFile(filePath, buffer);
    updateData.faviconUrl = `/api/uploads/${fileName}`;
  }

  await prisma.organization.upsert({
    where: { id: "singleton" },
    update: updateData,
    create: {
      id: "singleton",
      name: "Alif Soreti Car Dealer",
      ...updateData,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}

export async function getOrganization() {
  return await prisma.organization.findUnique({
    where: { id: "singleton" },
  });
}
