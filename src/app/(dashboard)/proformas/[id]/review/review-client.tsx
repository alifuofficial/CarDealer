"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  User,
  Hash,
  Building2,
  Car,
  ArrowLeft,
  FileCheck,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { approvePayment, rejectPayment } from "@/lib/actions/proformas";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

interface PaymentReviewClientProps {
  proforma: any;
  companyAccounts: any[];
}

export function PaymentReviewClient({ proforma, companyAccounts }: PaymentReviewClientProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const receivingAccount = companyAccounts.find(a => a.id === proforma.receivingAccountId);

  async function handleApprove() {
    setIsApproving(true);
    try {
      await approvePayment(proforma.id);
      toast.success("Payment approved and finalized");
      router.push("/proformas");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve payment");
      setIsApproving(false);
    }
  }

  async function handleReject() {
    setIsRejecting(true);
    try {
      await rejectPayment(proforma.id);
      toast.success("Payment rejected — sent back to seller");
      router.push("/proformas");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject payment");
      setIsRejecting(false);
    }
  }

  const hasFile = proforma.paymentReceiptUrl && proforma.paymentReceiptUrl !== "NO_FILE";
  const isPdf = hasFile && (proforma.paymentReceiptUrl.startsWith("data:application/pdf") || proforma.paymentReceiptUrl.toLowerCase().endsWith(".pdf"));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link href="/proformas">
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Payment Review</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proforma {proforma.number} — Awaiting Verification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Payment & Proforma Info */}
        <div className="space-y-5">
          {/* Status Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">Pending Your Approval</p>
              <p className="text-[10px] text-amber-700 font-medium mt-0.5">Review the submitted payment details below and confirm or reject.</p>
            </div>
          </div>

          {/* Proforma Details */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Proforma Details</h3>
            <div className="space-y-3">
              {[
                { icon: Car, label: "Vehicle", value: proforma.carUnit.model.name },
                { icon: Hash, label: "Chassis No.", value: proforma.carUnit.chassisNumber },
                { icon: User, label: "Customer", value: proforma.customer.name.split(" - ")[0] },
                { icon: Building2, label: "Total Amount", value: `ETB ${(proforma.amount || 0).toLocaleString()}` },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 text-slate-400">
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Submission Details */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Submitted Payment Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sender Name</span>
                <span className="text-xs font-bold text-slate-900">
                  {proforma.paymentSenderName || <span className="text-slate-300 italic">Not provided</span>}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Transaction ID</span>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {proforma.paymentTransactionId || <span className="text-slate-300 italic font-sans">Not provided</span>}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deposited To</span>
                <div className="text-right">
                  {receivingAccount ? (
                    <>
                      <p className="text-xs font-bold text-slate-900">{receivingAccount.bankName}</p>
                      <p className="text-[9px] font-mono text-slate-400">{receivingAccount.accountNumber}</p>
                    </>
                  ) : (
                    <span className="text-slate-300 italic text-xs">Unknown account</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 h-12 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 hover:text-red-700 rounded-xl"
              disabled={isRejecting || isApproving}
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Reject & Clear
                </div>
              )}
            </Button>
            <Button
              onClick={handleApprove}
              className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-100"
              disabled={isApproving || isRejecting}
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Confirm & Finalize
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Receipt Viewer */}
        <div className="space-y-4">
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b bg-slate-50/30 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-slate-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Payment Receipt</h3>
            </div>

            <div className="flex-1 min-h-[500px] bg-slate-100 relative group">
              {hasFile ? (
                isPdf ? (
                  <iframe
                    src={proforma.paymentReceiptUrl}
                    className="w-full h-full min-h-[500px] border-none"
                    title="Payment Receipt PDF"
                  />
                ) : (
                  <div className="w-full h-full min-h-[500px] flex items-center justify-center overflow-auto p-4 bg-slate-100">
                    <img
                      src={proforma.paymentReceiptUrl}
                      alt="Payment Receipt"
                      className="max-w-full h-auto shadow-2xl rounded-lg"
                    />
                  </div>
                )
              ) : (
                <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 gap-3">
                  <AlertCircle className="h-12 w-12 text-slate-200" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Receipt Attached</p>
                    <p className="text-[10px] text-slate-300 font-medium mt-1">The seller did not upload a receipt file.</p>
                  </div>
                </div>
              )}

              {hasFile && (
                <button
                  onClick={() => {
                    const win = window.open();
                    win?.document.write(`<iframe src="${proforma.paymentReceiptUrl}" frameborder="0" style="border:0;width:100%;height:100vh;"></iframe>`);
                  }}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow text-[9px] font-black uppercase tracking-widest border text-slate-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  ⛶ Expand Full View
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
