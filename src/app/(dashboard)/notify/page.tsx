import { prisma } from "@/lib/prisma";
import { getSMSLogs, getSmsTemplates } from "@/lib/actions/marketing";
import { NotifyClient } from "./notify-client";

export default async function NotifyPage() {
  const [customers, logs, templates] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: "asc" },
    }),
    getSMSLogs(),
    getSmsTemplates(),
  ]);

  return <NotifyClient customers={customers} initialLogs={logs} templates={templates} />;
}
