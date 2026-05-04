"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import path from "path";
import { z } from "zod";

const organizationSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  tin: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  website: z.string().url("Invalid URL").or(z.literal("")).optional(),
  siteTitle: z.string().optional(),
  calendarType: z.enum(["GREGORIAN", "ETHIOPIAN"]).optional(),
  vatRate: z.number().min(0).max(100).optional(),
  isVatEnabled: z.boolean().optional(),
  defaultExpiryDays: z.number().int().min(1).optional(),
  // Email/SMTP
  isEmailEnabled: z.boolean().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFromEmail: z.string().email().or(z.literal("")).optional(),
  smtpFromName: z.string().optional(),
  // SMS
  isSmsEnabled: z.boolean().optional(),
  smsApiKey: z.string().optional(),
  // FTP
  isFtpEnabled: z.boolean().optional(),
  ftpHost: z.string().optional(),
  ftpPort: z.number().int().optional(),
  ftpUser: z.string().optional(),
  ftpPassword: z.string().optional(),
  ftpRoot: z.string().optional(),
  ftpIsSecure: z.boolean().optional(),
  ftpBaseUrl: z.string().url().or(z.literal("")).optional(),
});

export async function updateOrganization(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updateData: any = {};

  // Extract values
  const fields = [
    "name", "tin", "address", "phone", "email", "website", "siteTitle", 
    "calendarType", "smtpHost", "smtpUser", "smtpPassword", 
    "smtpFromEmail", "smtpFromName", "smsApiKey", "ftpHost", "ftpUser", 
    "ftpPassword", "ftpRoot", "ftpBaseUrl"
  ];

  for (const field of fields) {
    if (formData.has(field)) {
      const val = formData.get(field) as string;
      // Don't update sensitive fields if they are still masked
      if (["smtpPassword", "ftpPassword", "smsApiKey"].includes(field) && val === "••••••••") {
        continue;
      }
      updateData[field] = val;
    }
  }

  // Number fields
  const numFields: Record<string, "float" | "int"> = {
    "vatRate": "float",
    "defaultExpiryDays": "int",
    "smtpPort": "int",
    "ftpPort": "int"
  };

  for (const [field, type] of Object.entries(numFields)) {
    if (formData.has(field)) {
      const rawVal = formData.get(field) as string;
      const val = type === "float" ? parseFloat(rawVal) : parseInt(rawVal);
      if (!isNaN(val)) updateData[field] = val;
    }
  }

  // Checkboxes
  const boolFields = ["isVatEnabled", "isSmsEnabled", "isEmailEnabled", "ftpIsSecure", "isFtpEnabled"];
  for (const field of boolFields) {
    if (formData.has(field)) {
      updateData[field] = formData.get(field) === "on";
    } else if (formData.has(`__has_${field}`)) {
      updateData[field] = false;
    }
  }

  // Validate with Zod
  const validated = organizationSchema.safeParse(updateData);
  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }

  const logo = formData.get("logo") as File;
  if (logo && logo.size > 0) {
    updateData.logoUrl = await uploadFile(logo, "logo");
  }

  const favicon = formData.get("favicon") as File;
  if (favicon && favicon.size > 0) {
    updateData.faviconUrl = await uploadFile(favicon, "favicon");
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

export async function testFtpConnection(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const host = formData.get("ftpHost") as string;
  const port = parseInt(formData.get("ftpPort") as string) || 21;
  const user = formData.get("ftpUser") as string;
  let password = formData.get("ftpPassword") as string;
  const secure = formData.get("ftpIsSecure") === "on";

  if (password === "••••••••") {
    const org = await getOrganizationSecure();
    password = org?.ftpPassword || "";
  }

  const ftp = require("basic-ftp");
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host,
      port,
      user,
      password,
      secure,
    });
    return { success: true, message: "FTP Connection Successful!" };
  } catch (err: any) {
    return { success: false, message: `FTP Connection Failed: ${err.message}` };
  } finally {
    client.close();
  }
}

export async function testFtpUpload(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const host = formData.get("ftpHost") as string;
  const port = parseInt(formData.get("ftpPort") as string) || 21;
  const user = formData.get("ftpUser") as string;
  let password = formData.get("ftpPassword") as string;
  const secure = formData.get("ftpIsSecure") === "on";
  const remoteRoot = formData.get("ftpRoot") as string || "/";

  if (password === "••••••••") {
    const org = await getOrganizationSecure();
    password = org?.ftpPassword || "";
  }

  const ftp = require("basic-ftp");
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host,
      port,
      user,
      password,
      secure,
    });
    
    await client.ensureDir(remoteRoot);
    
    const { Readable } = require("stream");
    const testContent = `FTP Test Upload from CarDealer App - ${new Date().toISOString()}`;
    const buffer = Buffer.from(testContent);
    const stream = Readable.from(buffer);
    const testFileName = `test-upload-${Date.now()}.txt`;
    
    await client.uploadFrom(stream, testFileName);
    
    try {
      await client.remove(testFileName);
    } catch (e) {
      console.error("Failed to cleanup FTP test file:", e);
    }
    
    return { success: true, message: "FTP Test Upload Successful!" };
  } catch (err: any) {
    return { success: false, message: `FTP Test Upload Failed: ${err.message}` };
  } finally {
    client.close();
  }
}

export async function getOrganization() {
  const org = await prisma.organization.findUnique({
    where: { id: "singleton" },
  });

  if (!org) return null;

  // Mask sensitive fields for client consumption
  return {
    ...org,
    smtpPassword: org.smtpPassword ? "••••••••" : "",
    ftpPassword: org.ftpPassword ? "••••••••" : "",
    smsApiKey: org.smsApiKey ? "••••••••" : "",
  };
}

/**
 * Server-side only function to get the actual secrets
 */
export async function getOrganizationSecure() {
  return await prisma.organization.findUnique({
    where: { id: "singleton" },
  });
}
