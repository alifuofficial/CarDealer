import { prisma } from "@/lib/prisma";
import { CheckCircle2, AlertCircle, Calendar, ShieldCheck, Car, User } from "lucide-react";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function VerifyProformaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const proforma = await prisma.proforma.findUnique({
    where: { id },
    include: {
      customer: true,
      carUnit: {
        include: {
          model: true,
        },
      },
    },
  });

  if (!proforma) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-red-100">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Invalid Document</h1>
          <p className="text-slate-500 font-medium mb-8">The proforma document you are trying to verify does not exist or has been removed from our system.</p>
          <div className="pt-6 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Alif Soreti Car Dealer Security System
          </div>
        </div>
      </div>
    );
  }

  const isPaid = proforma.status === "PAID";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
        <div className={`p-8 text-center ${isPaid ? "bg-green-600" : "bg-blue-600"}`}>
          <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldCheck className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Document Verified</h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/30">
            {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            {isPaid ? "Payment Confirmed" : "Status: " + proforma.status}
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> Proforma Number
              </span>
              <p className="font-black text-slate-900 uppercase">#{proforma.number}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-2">
                <Calendar className="h-3 w-3" /> Date Issued
              </span>
              <p className="font-bold text-slate-900">{format(new Date(proforma.createdAt), "MMM dd, yyyy")}</p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</span>
                <p className="font-black text-slate-900 uppercase leading-none">{proforma.customer.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Description</span>
                <p className="font-black text-slate-900 uppercase leading-none">{proforma.carUnit.model.name}</p>
                <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-tight">CHASSIS: {proforma.carUnit.chassisNumber}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-6 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
              <span className="text-2xl font-black text-blue-600">ETB {proforma.amount.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
            Verified by Alif Soreti Security System
          </p>
        </div>
      </div>
    </div>
  );
}
