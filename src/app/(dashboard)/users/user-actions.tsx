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
  Shield,
  Mail,
  User as UserIcon,
  Lock,
  Phone,
  Eye,
  Calendar
} from "lucide-react";
import { deleteUser, updateUser } from "@/lib/actions/users";
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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface UserActionsProps {
  user: any;
}

export function UserActions({ user }: UserActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Edit states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");

  const isSelf = (session?.user as any)?.id === user.id;

  async function handleDelete() {
    if (isSelf) {
      toast.error("You cannot delete your own account");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      toast.success("User deleted successfully");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("role", role);
      if (password) formData.append("password", password);

      await updateUser(user.id, formData);
      toast.success("User updated successfully");
      setIsEditOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
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
        <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-2xl">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-3 py-2">Account Options</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsDetailsOpen(true)} className="rounded-lg">
              <Eye className="mr-2 h-3.5 w-3.5" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="rounded-lg">
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 focus:bg-red-50 focus:text-red-600 font-black text-xs uppercase tracking-widest rounded-lg" 
            onClick={() => setIsDeleteOpen(true)}
            disabled={isSelf}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> {isSelf ? "Current User" : "Delete User"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-4 right-4 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
              <Shield className={cn("h-6 w-6", user.role === "ADMIN" ? "text-red-400" : "text-blue-400")} />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black backdrop-blur-xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">{user.name}</h2>
                <Badge className="mt-1 bg-white/10 hover:bg-white/20 border-none text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid gap-6">
              <div className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                  <p className="text-sm font-bold text-slate-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900">{user.phone || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Created</p>
                  <p className="text-sm font-bold text-slate-900">{new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 h-11 rounded-xl font-bold text-xs uppercase tracking-widest"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsEditOpen(true);
                }}
              >
                Edit Profile
              </Button>
              <Button 
                className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit User Profile</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Update details for {user.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                <div className="relative">
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 pl-9 font-medium"
                    required
                  />
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                <div className="relative">
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 pl-9 font-medium"
                    required
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number (for OTP)</Label>
                <div className="relative">
                  <Input 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 pl-9 font-medium"
                    placeholder="2519..."
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">System Role</Label>
                <Select value={role} onValueChange={setRole} disabled={isSelf}>
                  <SelectTrigger className="h-10 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN" label="Admin">Admin</SelectItem>
                    <SelectItem value="SELLER" label="Seller">Seller</SelectItem>
                    <SelectItem value="ACCOUNTANT" label="Accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
                {isSelf && <p className="text-[9px] text-amber-600 font-bold italic">You cannot change your own role.</p>}
              </div>
              <div className="space-y-2 border-t pt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password (Optional)</Label>
                <div className="relative">
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="h-10 pl-9 font-medium"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete User</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Are you sure you want to delete <strong>{user.name}</strong>? This user will lose all system access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1 font-bold">Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="flex-1 font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
