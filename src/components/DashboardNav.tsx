"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutDashboard, FileSearch, Activity } from "lucide-react";
import UserNav from "@/components/UserNav";

export default function DashboardNav() {
  const pathname = usePathname();

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={15} /> },
    { label: "Analyze", href: "/dashboard/analyze", icon: <FileSearch size={15} /> },
    { label: "Monitoring", href: "/dashboard/admin", icon: <Activity size={15} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 font-bold text-slate-900 text-base hover:text-blue-600 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Bot size={15} className="text-white" />
        </div>
        <span>AI Career Copilot</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === link.href
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      {/* User */}
      <UserNav />
    </nav>
  );
}