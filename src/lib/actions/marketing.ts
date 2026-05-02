"use server";

import { prisma } from "@/lib/prisma";
import { sendSMS, replaceSmsVariables } from "@/lib/sms";
import { revalidatePath } from "next/cache";

export async function sendBulkMarketingSMS(customerIds: string[], message: string) {
  const customers = await prisma.customer.findMany({
    where: {
      id: { in: customerIds },
    },
  });

  const results = [];
  for (const customer of customers) {
    if (customer.phone) {
      // Replace variables per customer
      const personalizedMessage = replaceSmsVariables(message, {
        CustomerName: customer.name.split(" - ")[0],
        Year: new Date().getFullYear().toString(),
      });
      
      const result = await sendSMS(customer.phone, personalizedMessage);
      results.push({ customer: customer.name, result });
    }
  }

  revalidatePath("/notify");
  return { success: true, count: results.length };
}

export async function getSmsTemplates() {
  return await prisma.smsTemplate.findMany({
    orderBy: { name: "asc" },
  });
}

export async function updateSmsTemplate(id: string, content: string) {
  await prisma.smsTemplate.update({
    where: { id },
    data: { content },
  });
  revalidatePath("/settings");
  return { success: true };
}

export async function getSMSLogs() {
  return await prisma.smsLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getSMSStats() {
  const stats = await prisma.smsLog.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  return {
    success: stats.find((s) => s.status === "success")?._count.status || 0,
    error: stats.find((s) => s.status === "error")?._count.status || 0,
  };
}
