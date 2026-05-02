"use client";

import React, { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Loader2,
  User as UserIcon,
  Phone,
  Briefcase
} from "lucide-react";
import { updateCustomer, deleteCustomer } from "@/lib/actions/customers";
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
import { useSession } from "next-auth/react";

interface CustomerActionsProps {
  customer: any;
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // Edit states
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [type, setType] = useState(customer.type);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("type", type);

      await updateCustomer(customer.id, formData);
      toast.success("Customer updated successfully");
      setIsEditOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted successfully");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete customer");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isAdmin) {
    return (
      <Button variant="ghost" size="sm" className="h-8 font-bold text-xs">
        Details
      </Button>
    );
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
            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Customer Options</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit Customer
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 focus:bg-red-50 focus:text-red-600 font-bold" 
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Customer Information</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Update details for {customer.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Name</Label>
                <div className="relative">
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-900 focus:ring-blue-600"
                    required
                  />
                  <UserIcon className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                <div className="relative">
                  <Input 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-900 focus:ring-blue-600"
                    required
                  />
                  <Phone className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-900 focus:ring-blue-600 relative">
                    <Briefcase className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="BUSINESS">Business Entity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 bg-slate-900 font-black text-xs uppercase tracking-widest text-white hover:bg-slate-800 rounded-xl shadow-xl shadow-slate-200"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete Customer</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone if there are no linked records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="flex-1 font-black text-xs uppercase tracking-widest bg-red-600 hover:bg-red-700 rounded-xl shadow-xl shadow-red-100"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
