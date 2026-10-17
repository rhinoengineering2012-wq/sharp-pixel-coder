import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Home, Receipt, User } from "lucide-react";
import type { ReactNode } from "react";

export function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto min-h-screen w-full max-w-md bg-background ${className}`}>{children}</div>;
}

export function AppBar({ title, right }: { title: string; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 bg-card px-4 py-4 shadow-soft">
      <button aria-label="Back" onClick={() => router.history.back()} className="grid h-10 w-10 place-items-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5 text-ink" />
      </button>
      <h1 className="flex-1 text-lg font-extrabold text-ink">{title}</h1>
      {right}
    </header>
  );
}

const tabs = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: Receipt },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-20 max-w-md items-center justify-around rounded-t-4xl bg-card shadow-elegant">
      {tabs.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className="flex flex-col items-center gap-1 text-[11px] font-semibold text-ink" activeProps={{ className: "text-primary" }}>
          <Icon className="h-6 w-6" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function PrimaryButton({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={`flex h-14 w-full items-center justify-center gap-3 rounded-[14px] bg-primary text-base font-bold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-50 ${p.className ?? ""}`}>
      {children}
    </button>
  );
}
