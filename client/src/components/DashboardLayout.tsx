import React from 'react';
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Construction, 
  FileText, 
  Activity,
  Settings,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { label: "Simulator", href: "/", icon: Activity },
    { label: "Retrofit Lab", href: "/retrofit", icon: Construction },
    { label: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">STRUCTURA.IO</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-card border-r border-border">
            <div className="flex flex-col gap-6 mt-10">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm h-screen sticky top-0 z-10">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
               <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight font-mono">STRUCTURA</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground uppercase tracking-widest">Engineering Suite v1.0</div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}
                `}>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Physics Engine Ready
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
