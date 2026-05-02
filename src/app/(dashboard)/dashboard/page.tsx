import { prisma } from "@/lib/prisma";
import {
  Car,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Package,
  Calendar,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InventoryChart, StatusDistributionChart } from "@/components/dashboard-charts";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AccountantDashboard } from "@/components/accountant-dashboard";
import { SellerDashboard } from "@/components/seller-dashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getSellerStats(userId: string) {
  const [myProformasCount, myPaidProformasCount, myTotalSalesResult, availableInventory] = await Promise.all([
    prisma.proforma.count({ where: { createdById: userId } }),
    prisma.proforma.count({ where: { createdById: userId, status: "PAID" } }),
    prisma.proforma.aggregate({
      where: { createdById: userId, status: "PAID" },
      _sum: { amount: true }
    }),
    prisma.carUnit.count({ where: { status: "AVAILABLE" } }),
  ]);

  const recentMyProformas = await prisma.proforma.findMany({
    where: { createdById: userId },
    include: { customer: true, carUnit: { include: { model: true } } },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return {
    myProformasCount,
    myPaidProformasCount,
    myTotalSales: myTotalSalesResult._sum.amount || 0,
    availableInventory,
    recentMyProformas
  };
}

async function getAdminStats() {
  const [totalCars, availableCars, totalCustomers, totalUsers] = await Promise.all([
    prisma.carUnit.count(),
    prisma.carUnit.count({ where: { status: "AVAILABLE" } }),
    prisma.customer.count(),
    prisma.user.count(),
  ]);

  const recentCars = await prisma.carUnit.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { model: true },
  });

  const recentCustomers = await prisma.customer.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { createdBy: true },
  });

  const smsStats = await prisma.smsLog.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return {
    totalCars,
    availableCars,
    totalCustomers,
    totalUsers,
    recentCars,
    recentCustomers,
    smsStats: {
      success: smsStats.find((s) => s.status === "success")?._count.status || 0,
      error: smsStats.find((s) => s.status === "error")?._count.status || 0,
    }
  };
}

async function getAccountantStats() {
  const [paidCount, pendingCount, totalRevenueResult] = await Promise.all([
    prisma.proforma.count({ where: { status: "PAID" } }),
    prisma.proforma.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.proforma.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true }
    })
  ]);

  const underReviewProformas = await prisma.$queryRaw<any[]>`
    SELECT 
      p.*, 
      c.name as "customerName",
      m.name as "modelName"
    FROM Proforma p
    LEFT JOIN Customer c ON p.customerId = c.id
    LEFT JOIN CarUnit cu ON p.carUnitId = cu.id
    LEFT JOIN CarModel m ON cu.modelId = m.id
    WHERE p.status = 'UNDER_REVIEW'
    ORDER BY p.createdAt DESC
    LIMIT 10
  `.then(raw => raw.map(r => ({
    ...r,
    customer: { name: r.customerName },
    carUnit: { model: { name: r.modelName } }
  })));

  const recentPaidProformas = await prisma.proforma.findMany({
    where: { status: "PAID" },
    include: { customer: true },
    orderBy: { updatedAt: "desc" },
    take: 5
  });

  return {
    totalRevenue: totalRevenueResult._sum.amount || 0,
    pendingCount,
    paidCount,
    underReviewProformas,
    recentPaidProformas
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  if (role === "ACCOUNTANT") {
    const stats = await getAccountantStats();
    return <AccountantDashboard stats={stats} />;
  }

  if (role === "SELLER") {
    const stats = await getSellerStats(userId);
    return <SellerDashboard stats={stats} />;
  }

  const stats = await getAdminStats();
  return <AdminDashboard stats={stats} />;
}
