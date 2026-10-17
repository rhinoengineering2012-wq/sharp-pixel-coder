import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BarChart3, Bell, Eye, EyeOff, Gift, History, PlusCircle, Share2, Wallet } from "lucide-react";
import { useState } from "react";
import { Frame } from "@/components/rhino/AppFrame";
import { UGX_PER_GB, useBank } from "@/lib/store";

const BG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: BG },
      { name: "twitter:image", content: BG },
      { title: "Dashboard — RHINO DATABANK" },
      { name: "description", content: "Your data balance, stats and quick actions." },
      { property: "og:title", content: "Dashboard — RHINO DATABANK" },
      { property: "og:description", content: "See your saved data and act before bundles expire." },
    ],
  }),
  component: Dashboard,
});

const actions = [
  { to: "/deposit", label: "Deposit", icon: PlusCircle },
  { to: "/withdraw", label: "Withdraw", icon: Wallet },
  { to: "/history", label: "History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

function Dashboard() {
  const b = useBank();
  const [hide, setHide] = useState(false);
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
  return (
    <Frame className="pb-28">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5">
        <div className="min-w-0">
          <p className="text-[13px] text-muted-foreground">{greet}, Alex</p>
          <p className="text-lg font-bold text-ink">Data Banker 👋</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative">
            <Bell className="h-7 w-7 text-ink" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">3</span>
          </span>
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" alt="Alex" className="h-10 w-10 rounded-full object-cover" />
        </div>
      </header>

      <section className="relative mx-5 overflow-hidden rounded-4xl bg-gradient-card p-5 shadow-glow animate-rise">
        <img src={BG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
        <div className="relative">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <span className="text-sm font-medium text-primary-foreground/90">Data Balance</span>
            <button onClick={() => setHide(!hide)} className="flex items-center gap-2" aria-label="Toggle balance">
              {hide ? <EyeOff className="h-5 w-5 text-primary-foreground" /> : <Eye className="h-5 w-5 text-primary-foreground" />}
              <span className="font-bold text-gold">UGX {hide ? "•••" : (b.balance * UGX_PER_GB).toLocaleString()}</span>
            </button>
          </div>
          <p className="mt-3 text-[40px] font-extrabold leading-none text-primary-foreground">{hide ? "•••" : `${b.balance} GB`}</p>
          <span className="mt-4 inline-block rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">+0.8GB today</span>
        </div>
      </section>

      <section className="mx-5 mt-5 grid grid-cols-3 gap-2">
        {[[b.stored, "Stored"], [b.withdrawn, "Withdrawn"], [b.earned, "Earned"]].map(([v, l]) => (
          <div key={l} className="rounded-[20px] bg-card p-3 shadow-soft">
            <p className="text-lg font-extrabold text-ink">{v}GB</p>
            <p className="text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </section>

      <section className="mx-5 mt-6 flex justify-between">
        {actions.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-2 text-xs font-bold text-ink">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft transition active:scale-95"><Icon className="h-7 w-7 text-primary" /></span>
            {label}
          </Link>
        ))}
      </section>

      <section className="mx-5 mt-6 flex items-center justify-between rounded-[20px] bg-gradient-gold p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-card p-2"><Gift className="h-5 w-5 text-ink" /></span>
          <div>
            <p className="text-sm font-extrabold text-ink">Invite a Friend</p>
            <p className="text-xs font-medium text-ink/70">Get 1GB FREE</p>
          </div>
        </div>
        <a href="https://wa.me/?text=Join%20me%20on%20RHINO%20DATABANK%20%E2%80%94%20use%20code%20RHINO-ALEX" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-xs font-bold text-ink">
          Share <Share2 className="h-4 w-4 text-success" />
        </a>
      </section>

      <Link to="/deposit" className="mx-5 mt-5 flex items-center gap-3 rounded-[14px] border border-destructive bg-destructive-soft p-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
        <p className="text-[13px] font-bold text-destructive">Your 3GB MTN expires in 2hrs. Save Now!</p>
      </Link>
    </Frame>
  );
}
