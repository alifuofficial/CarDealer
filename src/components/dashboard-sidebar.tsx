"use client";

import {
  LayoutDashboard,
  Car,
  Users,
  UserPlus,
  PlusCircle,
  LogOut,
  ChevronRight,
  Settings,
  ShieldCheck,
  FileText,
  Shield,
  Bell,
  BarChart3,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/components/organization-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const { data: session } = useSession();
  const { state } = useSidebar();
  const { organization } = useOrganization();
  const pathname = usePathname();
  const role = (session?.user as any)?.role;

  const isCollapsed = state === "collapsed";

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SELLER", "ACCOUNTANT"],
    },
    {
      title: "Cars",
      href: "/cars",
      icon: Car,
      roles: ["ADMIN"],
    },
    {
      title: "Import Cars",
      href: "/cars/import",
      icon: PlusCircle,
      roles: ["ADMIN"],
    },
    {
      title: "Customers",
      href: "/customers",
      icon: Users,
      roles: ["ADMIN", "SELLER"],
    },
    {
      title: "Create Customer",
      href: "/customers/create",
      icon: UserPlus,
      roles: ["SELLER"],
    },
    {
      title: "Proformas",
      href: "/proformas",
      icon: FileText,
      roles: ["ADMIN", "SELLER", "ACCOUNTANT"],
    },
    {
      title: "Notify",
      href: "/notify",
      icon: Bell,
      roles: ["ADMIN"],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
      title: "User Management",
      href: "/users",
      icon: Shield,
      roles: ["ADMIN"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["ADMIN", "SELLER", "ACCOUNTANT"],
    },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-900 text-white overflow-hidden">
            {organization?.logoUrl ? (
              <img src={organization.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
            ) : (
              <Car className="h-4 w-4" />
            )}
          </div>
          {!isCollapsed && (
            <span className="text-sm font-bold tracking-tight text-slate-900 uppercase truncate">
              {organization?.siteTitle || "CarDealer"}
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span className="text-xs font-semibold">{item.title}</span>}
                      </Link>
                    }
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className={cn(
                      "h-9 px-3",
                      pathname === item.href
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                    )}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="h-3 w-3" />
            {!isCollapsed && (
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Protected Session
              </span>
            )}
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
