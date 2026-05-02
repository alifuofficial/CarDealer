"use client";

import React from "react";
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Clock,
  Car,
  ShieldCheck,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SellerDashboardProps {
  stats: {
    myProformasCount: number;
    myPaidProformasCount: number;
    myTotalSales: number;
    availableInventory: number;
    recentMyProformas: any[];
  };
}

export function SellerDashboard({ stats }: SellerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Sales Console</h1>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
            Seller Performance
          </Badge>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time stats</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Sales Volume", 
            value: `ETB ${stats.myTotalSales.toLocaleString()}`, 
            icon: TrendingUp, 
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            sub: `${stats.myPaidProformasCount} Finalized Deals`
          },
          { 
            label: "My Proformas", 
            value: stats.myProformasCount, 
            icon: FileText, 
            color: "text-blue-600",
            bg: "bg-blue-50",
            sub: "Total Issued"
          },
          { 
            label: "Available Units", 
            value: stats.availableInventory, 
            icon: Car, 
            color: "text-amber-600",
            bg: "bg-amber-50",
            sub: "Ready to Sell"
          },
          { 
            label: "Performance Rate", 
            value: `${stats.myProformasCount > 0 ? Math.round((stats.myPaidProformasCount / stats.myProformasCount) * 100) : 0}%`, 
            icon: CheckCircle2, 
            color: "text-slate-900",
            bg: "bg-slate-100",
            sub: "Proforma Conversion"
          },
        ].map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">{kpi.value}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 flex items-center gap-1.5">
                    <span className={cn("h-1 w-1 rounded-full", kpi.bg.replace("bg-", "bg-"))} />
                    {kpi.sub}
                  </p>
                </div>
                <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110 duration-300", kpi.bg, kpi.color)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Recent Proformas</h3>
            <Link href="/proformas" className="text-[10px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
            {stats.recentMyProformas.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic text-xs">No recent activity recorded.</div>
            ) : (
              stats.recentMyProformas.map((p) => (
                <div key={p.id} className="p-4 px-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                      p.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                    )}>
                      {p.status === "PAID" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-none">{p.customer.name.split(" - ")[0]}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mt-1.5">{p.number} • {p.carUnit.model.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900 leading-none">ETB {p.amount.toLocaleString()}</p>
                    <Badge variant="outline" className={cn(
                      "mt-2 text-[8px] font-black uppercase px-1.5 h-4",
                      p.status === "PAID" && "text-emerald-600 bg-emerald-50 border-emerald-100",
                      p.status === "UNDER_REVIEW" && "text-amber-600 bg-amber-50 border-amber-100",
                      p.status === "SENT" && "text-blue-600 bg-blue-50 border-blue-100"
                    )}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors" />
            <h3 className="text-lg font-black tracking-tight mb-1">New Sale?</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed font-medium">Issue a proforma to reserve a unit for your customer immediately.</p>
            <Link href="/proformas">
              <button className="w-full bg-white text-slate-900 h-11 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-white/5 flex items-center justify-center gap-2">
                <PlusCircle className="h-4 w-4" /> Create Proforma
              </button>
            </Link>
          </div>

          <div className="bg-white border rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Seller Checklist
            </h3>
            <ul className="space-y-4">
              {[
                { text: "Verify customer TIN for business sales", done: true },
                { text: "Check chassis availability before issuing PF", done: true },
                { text: "Follow up on proformas expiring today", done: false },
                { text: "Remind customers to upload bank receipts", done: false },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                    item.done ? "bg-emerald-500 border-emerald-500" : "border-slate-200"
                  )}>
                    {item.done && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <span className={cn("text-[11px] font-medium leading-snug", item.done ? "text-slate-400 line-through" : "text-slate-600")}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
