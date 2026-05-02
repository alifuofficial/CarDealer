"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";
import { createCustomer } from "@/lib/actions/customers";

export function NewCustomerDialog({ showTrigger = true }: { showTrigger?: boolean }) {
  if (!showTrigger) return null;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="h-9 bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md">
            <User className="mr-2 h-4 w-4" /> New Customer
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">New Customer</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Add a new customer to the database. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form action={createCustomer} className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</Label>
              <Input id="name" name="name" placeholder="Full name or Company" className="h-10 font-medium" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</Label>
              <Input id="phone" name="phone" placeholder="09... or 2519..." className="h-10 font-medium" required />
              <p className="text-[10px] text-slate-400 font-medium">Auto-formats to 251 format</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Type</Label>
              <Select name="type" defaultValue="INDIVIDUAL" required>
                <SelectTrigger className="h-10 font-medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL" className="font-medium">Individual</SelectItem>
                  <SelectItem value="BUSINESS" className="font-medium">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button type="submit" className="w-full h-10 bg-blue-600 text-sm font-bold text-white hover:bg-blue-700">
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
