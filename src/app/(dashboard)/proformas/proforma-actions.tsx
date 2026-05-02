"use client";

import React, { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Send,
  Loader2,
  CreditCard,
  FileCheck,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { deleteProforma, updateProforma, submitPayment, approvePayment, rejectPayment } from "@/lib/actions/proformas";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProformaActionsProps {
  proforma: any;
  banks: any[];
  companyAccounts: any[];
  vatSettings: {
    enabled: boolean;
    rate: number;
  };
  canManage?: boolean;
}

export function ProformaActions({ proforma, banks, companyAccounts, vatSettings, canManage = false }: ProformaActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAccountant = role === "ACCOUNTANT" || role === "ADMIN";

  // Payment states
  const [senderName, setSenderName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [receivingAccountId, setReceivingAccountId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isFinalized = proforma.status === "PAID" || proforma.status === "UNDER_REVIEW";

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("senderName", senderName);
      formData.append("transactionId", transactionId);
      formData.append("receivingAccountId", receivingAccountId);
      if (selectedFile) {
        formData.append("receiptFile", selectedFile);
      }

      await submitPayment(proforma.id, formData);
      toast.success("Payment submitted for review");
      setIsPayOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit payment");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove() {
    setIsLoading(true);
    try {
      await approvePayment(proforma.id);
      toast.success("Payment approved and finalized");
      setIsReviewOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve payment");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReject() {
    setIsLoading(true);
    try {
      await rejectPayment(proforma.id);
      toast.success("Payment rejected and sent back");
      setIsReviewOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject payment");
    } finally {
      setIsLoading(false);
    }
  }

  // Edit states
  const [amount, setAmount] = useState<string>(
    (proforma.amount / (vatSettings.enabled ? (1 + vatSettings.rate / 100) : 1)).toFixed(2)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(proforma.paymentMethod);
  const [advancePercentage, setAdvancePercentage] = useState<number>(
    proforma.paymentMethod === "CREDIT" 
      ? Math.round(((proforma.advancePayment - (proforma.amount - (proforma.amount / (1 + vatSettings.rate / 100)))) / (proforma.amount / (1 + vatSettings.rate / 100))) * 100)
      : 50
  );
  const [status, setStatus] = useState<string>(proforma.status);
  const [bankId, setBankId] = useState<string>(proforma.bankId || "");

  const netPrice = parseFloat(amount || "0");
  const totalVat = vatSettings.enabled ? (netPrice * vatSettings.rate) / 100 : 0;
  const grandTotal = netPrice + totalVat;
  const percentage = paymentMethod === "CREDIT" ? Math.max(50, advancePercentage) : 100;
  const advancePayment = (netPrice * (percentage / 100)) + totalVat;
  const creditAmount = paymentMethod === "CREDIT" ? netPrice - (netPrice * (percentage / 100)) : 0;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteProforma(proforma.id);
      toast.success("Proforma deleted successfully");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete proforma");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("paymentMethod", paymentMethod);
      if (bankId) formData.append("bankId", bankId);
      formData.append("advancePayment", advancePayment.toString());
      formData.append("creditAmount", creditAmount.toString());
      formData.append("status", status);

      await updateProforma(proforma.id, formData);
      toast.success("Proforma updated successfully");
      setIsEditOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update proforma");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Workflow</DropdownMenuLabel>
            <DropdownMenuItem render={
              <Link href={`/proformas/${proforma.id}`} className="flex items-center">
                <Eye className="mr-2 h-3.5 w-3.5" /> View Proforma
              </Link>
            } />
            {!isFinalized && (
              <DropdownMenuItem onClick={() => setIsPayOpen(true)} className="text-blue-600 font-bold">
                <CreditCard className="mr-2 h-3.5 w-3.5" /> Pay Now
              </DropdownMenuItem>
            )}
            {isAccountant && (proforma.status === "UNDER_REVIEW" || proforma.status === "PAID") && (
              <DropdownMenuItem onClick={() => setIsReviewOpen(true)} className="bg-emerald-50 text-emerald-700 font-bold">
                <ShieldCheck className="mr-2 h-3.5 w-3.5" /> {proforma.status === "PAID" ? "View Payment Proof" : "Review Payment"}
              </DropdownMenuItem>
            )}
            {canManage && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Management</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)} disabled={isFinalized}>
                  <Edit className="mr-2 h-3.5 w-3.5" /> Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:bg-red-50 focus:text-red-600 font-bold"
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={isFinalized}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> {isFinalized ? "Locked" : "Delete"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Proforma</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Update proforma details for {proforma.number}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</Label>
                  <Select value={status} onValueChange={(val: string | null) => setStatus(val || "DRAFT")}>
                    <SelectTrigger className="w-full h-10 font-medium text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT" label="Draft">Draft</SelectItem>
                      <SelectItem value="SENT" label="Sent">Sent</SelectItem>
                      <SelectItem value="PAID" label="Paid">Paid</SelectItem>
                      <SelectItem value="UNDER_REVIEW" label="Under Review">Under Review</SelectItem>
                      <SelectItem value="CANCELLED" label="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Option</Label>
                  <Select value={paymentMethod} onValueChange={(val: string | null) => setPaymentMethod(val || "CASH")}>
                    <SelectTrigger className="w-full h-10 font-medium text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH" label="Full Cash">Full Cash</SelectItem>
                      <SelectItem value="CREDIT" label="Credit (Bank/MFI)">Credit (Bank/MFI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Price (ETB)</Label>
                  <Input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-10 font-bold" 
                    required 
                  />
                </div>
                {paymentMethod === "CREDIT" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-right-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Advance (%)</Label>
                    <Input 
                      type="number" 
                      min="50"
                      max="100"
                      value={advancePercentage}
                      onChange={(e) => setAdvancePercentage(parseInt(e.target.value) || 0)}
                      onBlur={() => { if (advancePercentage < 50) setAdvancePercentage(50); }}
                      className={cn("h-10 font-bold", advancePercentage < 50 && "border-red-500")} 
                    />
                  </div>
                )}
              </div>

              {paymentMethod === "CREDIT" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Bank/MFI</Label>
                  <Select value={bankId} onValueChange={(val: string | null) => setBankId(val || "")}>
                    <SelectTrigger className="w-full h-10 font-medium text-slate-700">
                      <SelectValue placeholder="Choose institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b.id} value={b.id} label={b.name} className="font-medium">
                          {b.name} ({b.type === "BANK" ? "Bank" : "MFI"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="rounded-xl border bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>New Total Payable</span>
                  <span>ETB {grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-blue-600">
                  <span>Advance ({percentage}%)</span>
                  <span>ETB {advancePayment.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
                disabled={isLoading || (paymentMethod === "CREDIT" && advancePercentage < 50)}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pay Now Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <CreditCard className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">Verify Payment</DialogTitle>
            </div>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Submit proof of payment for {proforma.number}. This will be sent to the accountant for final approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePay} className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Deposited To (Select Bank)</Label>
                <Select value={receivingAccountId} onValueChange={(val: string | null) => setReceivingAccountId(val || "")}>
                  <SelectTrigger className="w-full h-10 font-bold text-slate-700 bg-slate-50/50">
                    <SelectValue placeholder="Choose Company Bank Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id} label={`${acc.bankName} - ${acc.accountNumber}`}>
                        <div className="flex flex-col text-left">
                          <span className="font-bold">{acc.bankName}</span>
                          <span className="text-[10px] text-slate-400">{acc.accountNumber}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender's Full Name</Label>
                <Input 
                  placeholder="e.g. John Doe"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="h-10 font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Transaction ID / Reference</Label>
                <Input 
                  placeholder="FT240502..."
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-10 font-mono font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Upload Receipt (Image/PDF)</Label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer group",
                    selectedFile ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {selectedFile ? (
                    <>
                      <FileCheck className="h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest truncate max-w-full px-4">
                        {selectedFile.name}
                      </p>
                      <p className="text-[9px] text-blue-400 font-bold mt-1 uppercase">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-8 w-8 text-slate-300 group-hover:text-blue-500 transition-colors mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to select file</p>
                      <p className="text-[9px] text-slate-300 italic mt-1">Images or PDF accepted</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex gap-3">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-700 leading-normal uppercase">
                Once submitted, this proforma will be locked and cannot be edited or deleted during the review process.
              </p>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Approval"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Payment Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[95vh] overflow-y-auto shadow-2xl border-slate-200">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">Review Submission</DialogTitle>
            </div>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Verify the payment details for proforma {proforma.number}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 rounded-2xl p-4 border space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Sender</span>
                <span className="text-xs font-bold text-slate-900">{proforma.paymentSenderName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Transaction ID</span>
                <span className="text-xs font-mono font-bold text-blue-600">{proforma.paymentTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Amount to Verify</span>
                <span className="text-sm font-black text-slate-900 underline decoration-blue-500 decoration-2">ETB {proforma.amount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] relative group">
              {proforma.paymentReceiptUrl && proforma.paymentReceiptUrl !== "NO_FILE" ? (
                proforma.paymentReceiptUrl.startsWith("data:application/pdf") ? (
                  <iframe 
                    src={proforma.paymentReceiptUrl} 
                    className="w-full h-full border-none"
                    title="Receipt PDF"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 overflow-auto">
                    <img 
                      src={proforma.paymentReceiptUrl} 
                      alt="Payment Receipt" 
                      className="max-w-full h-auto shadow-2xl"
                    />
                  </div>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <AlertCircle className="h-8 w-8 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase">No receipt attached</p>
                </div>
              )}
              
              {proforma.paymentReceiptUrl && proforma.paymentReceiptUrl !== "NO_FILE" && (
                <button 
                  onClick={() => {
                    const win = window.open();
                    win?.document.write(`<iframe src="${proforma.paymentReceiptUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                  }}
                  className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  Expand View
                </button>
              )}
            </div>
          </div>

          {proforma.status !== "PAID" ? (
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleReject}
                variant="outline"
                className="flex-1 h-11 border-red-200 text-red-600 font-bold hover:bg-red-50 hover:text-red-700"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject & Clear"}
              </Button>
              <Button 
                onClick={handleApprove}
                className="flex-2 w-[60%] h-11 bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Confirm & Finalize
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="pt-2">
               <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-[10px] font-black uppercase">
                 <CheckCircle className="h-4 w-4" />
                 Transaction Verified & Archived
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete Proforma</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Are you sure you want to delete <strong>{proforma.number}</strong>? This action will restore the vehicle status to AVAILABLE and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1 font-bold">Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="flex-1 font-bold bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
