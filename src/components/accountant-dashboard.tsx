"use client";

import React from "react";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Building2, 
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  TrendingUp,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatByPreference } from "@/lib/ethiopian-calendar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type AccountantDashboardProps = {
  stats: {
    totalRevenue: number;
    pendingCount: number;
    paidCount: number;
    underReviewProformas: any[];
    recentPaidProformas: any[];
  };
};

export function AccountantDashboard({ stats }: AccountantDashboardProps) {
  const { totalRevenue, pendingCount, paidCount, underReviewProformas, recentPaidProformas } = stats;

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-8">
      {/* High Density Header */}
      <div className="flex items-center justify-between bg-white p-3 px-5 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Financial Control</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Role: Financial Controller</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Ethiopia</span>
            <span className="text-xs font-bold text-slate-900">{formatByPreference(new Date(), "ETHIOPIAN")}</span>
          </div>
          <div className="h-6 w-px bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Gregorian</span>
            <span className="text-xs font-bold text-slate-900">{formatByPreference(new Date(), "GREGORIAN")}</span>
          </div>
        </div>
      </div>

      {/* KPI Row - Slim */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `ETB ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50/50" },
          { label: "Under Review", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50/50" },
          { label: "Finalized Sales", value: paidCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/50" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", kpi.bg)}>
                <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
              </div>
              <ArrowUpRight className="h-3 w-3 text-slate-300 group-hover:text-slate-900 transition-colors" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Approvals - Compact */}
        <div className="bg-white border rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-slate-50/30 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Pending Review</h3>
            <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[8px] px-2">{pendingCount} ITEMS</Badge>
          </div>
          <div className="flex-1 divide-y divide-slate-50">
            {underReviewProformas.map((p) => (
              <div key={p.id} className="p-4 px-6 hover:bg-amber-50/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Receipt className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-none truncate">{p.customer.name.split(" - ")[0]}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold mt-1">{p.number} • {p.carUnit.model.name}</p>
                      <p className="text-xs font-black text-slate-800 mt-1">ETB {(p.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <Link href={`/proformas/${p.id}/review`}>
                    <div className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors shrink-0 shadow-sm shadow-amber-200">
                      <ShieldCheck className="h-3 w-3" />
                      Review
                    </div>
                  </Link>
                </div>
              </div>
            ))}
            {underReviewProformas.length === 0 && (
              <div className="p-12 text-center">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-5 w-5 text-emerald-300" />
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Revenue - Compact */}
        <div className="bg-white border rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-slate-50/30 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Recent Collections</h3>
            <DollarSign className="h-3.5 w-3.5 text-slate-300" />
          </div>
          <div className="flex-1 divide-y divide-slate-50">
            {recentPaidProformas.map((p) => (
              <div key={p.id} className="p-3 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-none">{p.customer.name.split(" - ")[0]}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-widest">{new Date(p.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 leading-none">ETB {p.amount.toLocaleString()}</p>
                  <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter mt-1 inline-block">Archived</span>
                </div>
              </div>
            ))}
            {recentPaidProformas.length === 0 && (
              <div className="p-12 text-center text-slate-300 uppercase font-bold text-[10px] tracking-widest">No recent transactions</div>
            )}
          </div>
        </div>
      </div>

      {/* High Density Utility Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Sales Journal", href: "/reports", icon: DollarSign },
          { label: "Company Banks", href: "/settings", icon: Building2 },
          { label: "Current Assets", href: "/cars", icon: FileText },
          { label: "Payment Files", href: "/proformas", icon: Receipt },
        ].map((link, idx) => (
          <Link key={idx} href={link.href}>
            <div className="bg-white border rounded-xl p-3 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm group">
              <div className="h-6 w-6 rounded-md bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                <link.icon className="h-3 w-3 text-slate-400 group-hover:text-slate-900" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{link.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
