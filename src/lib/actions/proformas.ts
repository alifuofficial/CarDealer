"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendSMS, replaceSmsVariables } from "@/lib/sms";
import { format } from "date-fns";

export async function createProforma(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const customerId = formData.get("customerId") as string;
  const carUnitId = formData.get("carUnitId") as string;
  const baseAmount = parseFloat(formData.get("amount") as string);
  const paymentMethod = formData.get("paymentMethod") as string;
  const bankId = formData.get("bankId") as string || null;
  const advancePayment = parseFloat(formData.get("advancePayment") as string) || 0;
  const creditAmount = parseFloat(formData.get("creditAmount") as string) || 0;

  if (!customerId || !carUnitId || isNaN(baseAmount)) {
    throw new Error("Invalid input");
  }

  // Fetch Organization Settings for VAT and Expiry
  const org = await prisma.organization.findUnique({
    where: { id: "singleton" },
  });

  // Fetch Customer and Car details for SMS
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const carUnit = await prisma.carUnit.findUnique({
    where: { id: carUnitId },
    include: { model: true }
  });

  if (!carUnit || carUnit.status !== "AVAILABLE") {
    throw new Error("This chassis number is already reserved or sold.");
  }

  let totalPayable = baseAmount;
  const isVatEnabled = org?.isVatEnabled ?? true;
  const vatRate = org?.vatRate ?? 15.0;
  const defaultExpiryDays = org?.defaultExpiryDays ?? 15;

  if (isVatEnabled) {
    totalPayable = baseAmount * (1 + vatRate / 100);
  }

  // Calculate Expiry Date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + defaultExpiryDays);

  // Generate Proforma Number
  const count = await prisma.proforma.count();
  const year = new Date().getFullYear();
  const pfNumber = `PF-${year}-${(count + 1).toString().padStart(4, "0")}`;

  const proforma = await prisma.proforma.create({
    data: {
      number: pfNumber,
      customerId,
      carUnitId,
      amount: totalPayable,
      paymentMethod,
      bankId,
      advancePayment: paymentMethod === "CREDIT" ? advancePayment : totalPayable,
      creditAmount: paymentMethod === "CREDIT" ? creditAmount : 0,
      status: "DRAFT",
      expiryDate,
      createdById: (session.user as any).id,
    },
  });

  // Send SMS Notification
  if (org?.isSmsEnabled && customer?.phone) {
    const template = await prisma.smsTemplate.findUnique({
      where: { name: "PROFORMA_CREATED" }
    });

    if (template) {
      const message = replaceSmsVariables(template.content, {
        CustomerName: customer.name.split(" - ")[0],
        ProformaNumber: pfNumber,
        CarModel: carUnit.model.name,
        Amount: totalPayable.toLocaleString(),
        ExpiryDate: format(expiryDate, "MMM dd, yyyy"),
      });
      await sendSMS(customer.phone, message);
    }
  }

  // Update car unit status to RESERVED
  await prisma.carUnit.update({
    where: { id: carUnitId },
    data: { status: "RESERVED" },
  });

  revalidatePath("/proformas");
  revalidatePath("/cars");
  revalidatePath("/dashboard");
  redirect("/proformas");
}

export async function updateProforma(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const amount = parseFloat(formData.get("amount") as string);
  const paymentMethod = formData.get("paymentMethod") as string;
  const bankId = formData.get("bankId") as string || null;
  const advancePayment = parseFloat(formData.get("advancePayment") as string) || 0;
  const creditAmount = parseFloat(formData.get("creditAmount") as string) || 0;
  const status = formData.get("status") as string;

  const org = await prisma.organization.findUnique({ where: { id: "singleton" } });
  const vatRate = org?.vatRate ?? 15.0;
  const isVatEnabled = org?.isVatEnabled ?? true;

  let totalPayable = amount;
  if (isVatEnabled) {
    totalPayable = amount * (1 + vatRate / 100);
  }

  await prisma.proforma.update({
    where: { id },
    data: {
      amount: totalPayable,
      paymentMethod,
      bankId,
      advancePayment: paymentMethod === "CREDIT" ? advancePayment : totalPayable,
      creditAmount: paymentMethod === "CREDIT" ? creditAmount : 0,
      status,
    },
  });

  revalidatePath("/proformas");
  return { success: true };
}

export async function deleteProforma(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const proforma = await prisma.proforma.findUnique({
    where: { id },
    select: { carUnitId: true, status: true }
  });

  if (!proforma) throw new Error("Proforma not found");

  if (proforma.status === "PAID" || proforma.status === "UNDER_REVIEW") {
    throw new Error("This proforma is finalized or under review and cannot be deleted.");
  }

  // Reset car unit status to AVAILABLE
  await prisma.carUnit.update({
    where: { id: proforma.carUnitId },
    data: { status: "AVAILABLE" },
  });

  await prisma.proforma.delete({
    where: { id },
  });

  revalidatePath("/proformas");
  revalidatePath("/cars");
  revalidatePath("/dashboard");
  return { success: true };
}

import path from "path";
import { writeFile, mkdir } from "fs/promises";

export async function submitPayment(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const senderName = formData.get("senderName") as string;
  const transactionId = formData.get("transactionId") as string;
  const receivingAccountId = formData.get("receivingAccountId") as string;
  const receiptFile = formData.get("receiptFile") as File;

  if (!senderName || !transactionId || !receivingAccountId) {
    throw new Error("Missing required payment details");
  }

  let receiptUrl = "UPLOADED_RECEIPT_PLACEHOLDER";
  
  if (receiptFile && receiptFile.size > 0) {
    const UPLOADS_DIR = process.env.NODE_ENV === "production" ? "/data/uploads" : path.join(process.cwd(), "public", "uploads");
    const bytes = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `receipt-${id}-${Date.now()}${path.extname(receiptFile.name)}`;
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filePath = path.join(UPLOADS_DIR, fileName);
    await writeFile(filePath, buffer);
    receiptUrl = `/api/uploads/${fileName}`;
  }

  await prisma.$executeRaw`
    UPDATE Proforma 
    SET 
      status = 'UNDER_REVIEW',
      paymentSenderName = ${senderName},
      paymentTransactionId = ${transactionId},
      paymentReceiptUrl = ${receiptUrl},
      receivingAccountId = ${receivingAccountId},
      updatedAt = ${new Date()}
    WHERE id = ${id}
  `;

  revalidatePath("/proformas");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return { success: true };
}

export async function getProforma(id: string) {
  return await prisma.proforma.findUnique({
    where: { id },
    include: {
      customer: true,
      carUnit: {
        include: {
          model: true,
        },
      },
      bank: true,
      createdBy: true,
    },
  });
}

export async function getOrganization() {
  return await prisma.organization.findUnique({
    where: { id: "singleton" },
  });
}

export async function approvePayment(id: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "ACCOUNTANT") {
    throw new Error("Unauthorized: Only accountants or admins can approve payments");
  }

  await prisma.$executeRaw`
    UPDATE Proforma 
    SET 
      status = 'PAID',
      paymentVerifiedAt = ${new Date()}
    WHERE id = ${id}
  `;

  revalidatePath("/proformas");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function rejectPayment(id: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "ACCOUNTANT") {
    throw new Error("Unauthorized: Only accountants or admins can reject payments");
  }

  await prisma.$executeRaw`
    UPDATE Proforma 
    SET 
      status = 'REJECTED',
      paymentSenderName = NULL,
      paymentTransactionId = NULL,
      paymentReceiptUrl = NULL,
      receivingAccountId = NULL
    WHERE id = ${id}
  `;

  revalidatePath("/proformas");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}
