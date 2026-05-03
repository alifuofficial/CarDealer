"use client";

import React, { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Loader2,
  Info,
  Lock,
  Unlock
} from "lucide-react";
import { deleteCarUnit, toggleCarLock } from "@/lib/actions/cars";
// I'll add updateCarUnit to cars.ts in the next step
import { updateCarUnit } from "@/lib/actions/cars"; 
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

interface CarActionsProps {
  car: any;
}

export function CarActions({ car }: CarActionsProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Edit states
  const [chassis, setChassis] = useState(car.chassisNumber);
  const [status, setStatus] = useState(car.status);
  const [cashPrice, setCashPrice] = useState(car.cashPrice.toString());
  const [creditPrice, setCreditPrice] = useState(car.creditPrice.toString());

  async function handleToggleLock() {
    setIsLoading(true);
    try {
      await toggleCarLock(car.id);
      toast.success(car.isLocked ? "Unit unlocked" : "Unit locked successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to toggle lock");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteCarUnit(car.id);
      toast.success("Car unit deleted");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete car unit");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("chassisNumber", chassis);
      formData.append("status", status);
      formData.append("cashPrice", cashPrice);
      formData.append("creditPrice", creditPrice);
      
      await updateCarUnit(car.id, formData);
      toast.success("Unit updated successfully");
      setIsEditOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update unit. Chassis might be duplicate.");
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
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Unit Management</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit Unit
            </DropdownMenuItem>
            
            {isAdmin && (
              <DropdownMenuItem 
                onClick={handleToggleLock}
                className={car.isLocked ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}
              >
                {car.isLocked ? (
                  <><Unlock className="mr-2 h-3.5 w-3.5" /> Unlock Unit</>
                ) : (
                  <><Lock className="mr-2 h-3.5 w-3.5" /> Lock Unit</>
                )}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 font-bold" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Car Unit</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Update unit details for {car.model.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Chassis Number</Label>
                  <Input 
                    value={chassis}
                    onChange={(e) => setChassis(e.target.value)}
                    className="h-10 font-bold uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-10 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE" label="Available">Available</SelectItem>
                      <SelectItem value="RESERVED" label="Reserved">Reserved</SelectItem>
                      <SelectItem value="SOLD" label="Sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cash Price (ETB)</Label>
                  <Input 
                    type="number"
                    value={cashPrice}
                    onChange={(e) => setCashPrice(e.target.value)}
                    className="h-10 font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Credit Price (ETB)</Label>
                  <Input 
                    type="number"
                    value={creditPrice}
                    onChange={(e) => setCreditPrice(e.target.value)}
                    className="h-10 font-bold"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 font-bold text-white"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete Car Unit</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Are you sure you want to delete unit <strong>{car.chassisNumber}</strong>? This action cannot be undone.
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
