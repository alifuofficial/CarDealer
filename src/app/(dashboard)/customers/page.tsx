import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Phone, Calendar, User, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCustomer } from "@/lib/actions/customers";
import { NewCustomerDialog } from "./new-customer-dialog";
import { CustomerActions } from "./customer-actions";
import { CustomerDataTools } from "@/components/customer-data-tools";
import { SearchInput } from "@/components/search-input";

async function getCustomers(page = 1, search = "") {
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : {};

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      include: {
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
  ]);

  return { 
    customers, 
    total, 
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: search = "", page: pageStr = "1" } = await searchParams;
  const page = parseInt(pageStr) || 1;
  const { customers, total, totalPages } = await getCustomers(page, search);
  
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-sm font-medium text-slate-500">
            System-wide customer database ({total} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(session?.user as any)?.role === "ADMIN" && <CustomerDataTools customers={customers} />}
          <NewCustomerDialog />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SearchInput 
          placeholder="Search name or phone..." 
          defaultValue={search}
        />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <div className="flex flex-col">
                          <span>{customer.name.split(" - ")[0]}</span>
                          <span className="text-[10px] italic text-slate-400 font-medium leading-none mt-0.5">
                            Added by {customer.createdBy.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={customer.type === "BUSINESS" ? "bg-slate-100" : ""}>
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <CustomerActions customer={customer} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/customers?page=${page - 1}${search ? `&q=${search}` : ""}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page <= 1 && "pointer-events-none opacity-50"
              )}
            >
              Previous
            </Link>
            <Link
              href={`/customers?page=${page + 1}${search ? `&q=${search}` : ""}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page >= totalPages && "pointer-events-none opacity-50"
              )}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
