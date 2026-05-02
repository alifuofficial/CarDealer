import { createCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Customer</h1>
        <p className="text-slate-500">Register a new lead or buyer in the system</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-600">
            <UserPlus className="h-5 w-5" />
            <CardTitle>Customer Details</CardTitle>
          </div>
          <CardDescription>
            Please provide the customer's basic information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomer} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Abdi Mohammed"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. +251..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Customer Type</Label>
              <Select name="type" defaultValue="INDIVIDUAL" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                Create Customer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
        <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5 font-bold">!</div>
        <p>
          <strong>Internal Rule:</strong> Your name will be automatically appended to the customer name (e.g., <em>Abdi Mohammed - Ali Seller</em>) for internal ownership tracking.
        </p>
      </div>
    </div>
  );
}
