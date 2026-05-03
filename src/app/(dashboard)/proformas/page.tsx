import { prisma } from "@/lib/prisma";
import { Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateProformaDialog } from "./create-proforma-dialog";
import { ProformaActions } from "./proforma-actions";
import { formatByPreference } from "@/lib/ethiopian-calendar";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function ProformasPage(props: { searchParams: Promise<{ status?: string }> }) {
  const { status: currentStatus = "all" } = await props.searchParams;

  const [allProformas, customers, availableCars, org, banks, companyAccounts] = await Promise.all([
    prisma.proforma.findMany({
      include: {
        customer: true,
        carUnit: {
          include: { model: true }
        },
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.carUnit.findMany({
      where: { 
        status: "AVAILABLE",
        isLocked: false 
      },
      include: { model: true },
      orderBy: { model: { name: "asc" } },
    }),
    prisma.organization.findUnique({ where: { id: "singleton" } }),
    prisma.bank.findMany({ orderBy: { name: "asc" } }),
    prisma.companyAccount.findMany({ orderBy: { bankName: "asc" } }),
  ]);

  const filteredProformas = allProformas.filter(pf => {
    if (currentStatus === "all") return true;
    if (currentStatus === "draft") return pf.status === "DRAFT" || pf.status === "SENT";
    if (currentStatus === "under-review") return pf.status === "UNDER_REVIEW";
    if (currentStatus === "approved") return pf.status === "PAID";
    if (currentStatus === "rejected") return pf.status === "REJECTED";
    return true;
  });

  const vatSettings = {
    enabled: org?.isVatEnabled ?? true,
    rate: org?.vatRate ?? 15.0,
  };

  const calendarType = (org?.calendarType as any) || "GREGORIAN";

  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const canCreate = role === "ADMIN" || role === "SELLER";
  const canManage = role === "ADMIN";

  const tabs = [
    { label: "All", value: "all" },
    { label: "Draft/Sent", value: "draft" },
    { label: "Under Review", value: "under-review" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Proformas</h1>
          <p className="text-sm font-medium text-slate-500">Manage customer invoices and reservations</p>
        </div>
        {canCreate && (
          <CreateProformaDialog 
            customers={customers} 
            availableCars={availableCars} 
            banks={banks}
            vatSettings={vatSettings} 
          />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl w-fit border">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/proformas?status=${tab.value}`}
              className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                currentStatus === tab.value
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span className="ml-2 opacity-50">
                ({allProformas.filter(pf => {
                  if (tab.value === "all") return true;
                  if (tab.value === "draft") return pf.status === "DRAFT" || pf.status === "SENT";
                  if (tab.value === "under-review") return pf.status === "UNDER_REVIEW";
                  if (tab.value === "approved") return pf.status === "PAID";
                  if (tab.value === "rejected") return pf.status === "REJECTED";
                  return false;
                }).length})
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by number or customer..."
              className="h-9 w-full rounded-lg border bg-white pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
          <Button variant="outline" className="h-9 gap-2 px-3 text-xs font-bold">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Car Unit</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProformas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No proformas found for this category.
                  </td>
                </tr>
              ) : (
                filteredProformas.map((pf) => (
                  <tr key={pf.id} className="transition-hover hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{pf.number}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{pf.customer.name}</span>
                        <span className="text-[10px] text-slate-400">{pf.customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{pf.carUnit.model.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{pf.carUnit.chassisNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ETB {pf.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "rounded-sm px-2 text-[10px] font-bold uppercase",
                          pf.status === "PAID" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                          pf.status === "UNDER_REVIEW" && "bg-amber-50 text-amber-700 border-amber-100",
                          pf.status === "REJECTED" && "bg-red-50 text-red-700 border-red-100",
                          (pf.status === "DRAFT" || pf.status === "SENT") && "bg-slate-100 text-slate-700 border-slate-200"
                        )}
                      >
                        {pf.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {pf.expiryDate ? (
                        <span className={`text-[10px] font-bold uppercase ${new Date() > new Date(pf.expiryDate) ? "text-red-500" : "text-slate-400"}`}>
                          {formatByPreference(new Date(pf.expiryDate), calendarType)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold uppercase">No Limit</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ProformaActions 
                        proforma={pf} 
                        banks={banks} 
                        companyAccounts={companyAccounts}
                        vatSettings={vatSettings}
                        canManage={canManage}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
