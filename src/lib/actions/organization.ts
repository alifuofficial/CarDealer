"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import path from "path";

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

  if (formData.has("ftpHost")) updateData.ftpHost = formData.get("ftpHost") as string;
  if (formData.has("ftpUser")) updateData.ftpUser = formData.get("ftpUser") as string;
  if (formData.has("ftpPassword")) updateData.ftpPassword = formData.get("ftpPassword") as string;
  if (formData.has("ftpRoot")) updateData.ftpRoot = formData.get("ftpRoot") as string;

  if (formData.has("ftpPort")) {
    const val = parseInt(formData.get("ftpPort") as string);
    if (!isNaN(val)) updateData.ftpPort = val;
  }

  if (formData.has("ftpIsSecure")) {
    updateData.ftpIsSecure = formData.get("ftpIsSecure") === "on";
  } else if (formData.has("__has_ftpIsSecure")) {
    updateData.ftpIsSecure = false;
  }

  if (formData.has("isFtpEnabled")) {
    updateData.isFtpEnabled = formData.get("isFtpEnabled") === "on";
  } else if (formData.has("__has_isFtpEnabled")) {
    updateData.isFtpEnabled = false;
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
  const password = formData.get("ftpPassword") as string;
  const secure = formData.get("ftpIsSecure") === "on";

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
  const password = formData.get("ftpPassword") as string;
  const secure = formData.get("ftpIsSecure") === "on";
  const remoteRoot = formData.get("ftpRoot") as string || "/";

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
    
    const remotePath = path.posix.join(remoteRoot, testFileName);
    await client.uploadFrom(stream, remotePath);
    
    // Cleanup
    try {
      await client.remove(remotePath);
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
  return await prisma.organization.findUnique({
    where: { id: "singleton" },
  });
}
