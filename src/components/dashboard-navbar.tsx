"use client";

import { Bell, Search, User, ShieldCheck, Cloud } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/components/organization-provider";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function DashboardNavbar() {
  const { data: session } = useSession();
  const { organization } = useOrganization();
  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden items-center gap-2 md:flex border-l pl-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Access:
          </span>
          <Badge variant="secondary" className="rounded-sm bg-slate-100 text-slate-900 px-2 text-[10px] font-bold">
            {role}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            placeholder="Quick search..."
            className="h-8 w-48 rounded border bg-slate-50 pl-8 pr-4 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-slate-900 text-white text-[10px] font-bold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-bold text-slate-900">
                  {session?.user?.name}
                </span>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization</span>
                <span className="text-sm font-bold text-slate-900 truncate">
                  {organization?.name || "CarDealer"}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <Link href="/settings" className="w-full text-xs font-bold flex items-center cursor-pointer">
                  <User className="mr-2 h-3.5 w-3.5" />
                  Profile
                </Link>
              }
            />
            <DropdownMenuItem
              render={
                <Link href="/settings" className="w-full text-xs font-bold flex items-center cursor-pointer">
                  <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                  Settings
                </Link>
              }
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 text-xs font-bold cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
