import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home, Receipt, User, Wifi } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`app-frame mx-auto w-full max-w-md bg-background ${className}`}>{children}</div>;
}

export function AppBar({ title, right }: { title: string; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="app-bar sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-card px-4 py-4 shadow-soft">
      <div className="flex min-w-0 items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="Back" onClick={() => router.history.back()} className="h-10 w-10 shrink-0 rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5 text-ink" />
      </Button>
      <h1 className="min-w-0 text-base font-extrabold text-ink">{title}</h1>
      </div>
      <div className="shrink-0">{right}</div>
    </header>
  );
}

const tabs = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/bundles", label: "Bundles", icon: Wifi },
  { to: "/purchases", label: "My Purchases", icon: Receipt },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav aria-label="Main navigation" className="pro-theme bottom-nav fixed inset-x-0 bottom-0 z-20 mx-auto grid w-full max-w-md grid-cols-4 items-center border-t border-border bg-card shadow-elegant">
      {tabs.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className="nav-item flex min-w-0 flex-col items-center gap-1 py-2 text-[10px] font-semibold text-ink" activeProps={{ className: "text-primary", "aria-current": "page" }}>
          <Icon className="h-6 w-6" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function PrimaryButton({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button {...p} className={`flex h-14 w-full items-center justify-center gap-3 rounded-[14px] bg-primary text-base font-bold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-50 ${p.className ?? ""}`}>
      {children}
    </Button>
  );
}
