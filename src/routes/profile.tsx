import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Fingerprint, Gift, HelpCircle, LogOut, ShieldCheck } from "lucide-react";
import { BottomNav, Frame } from "@/components/rhino/AppFrame";
import { useBank } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — RHINO DATABANK" },
      { name: "description", content: "Manage your account, security and referrals." },
      { property: "og:title", content: "Profile — RHINO DATABANK" },
      { property: "og:description", content: "Your RHINO data banker profile and settings." },
    ],
  }),
  component: Profile,
});

const items = [
  { icon: Fingerprint, label: "Biometric login" },
  { icon: ShieldCheck, label: "Security & PIN" },
  { icon: Bell, label: "Expiry alerts" },
  { icon: Gift, label: "Referral code: RHINO-ALEX" },
  { icon: HelpCircle, label: "Help & support" },
];

function Profile() {
  const b = useBank();
  return (
    <Frame className="pb-28">
      <div className="rounded-b-4xl bg-gradient-splash px-5 pb-8 pt-10 text-center">
        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" alt="Alex" className="mx-auto h-20 w-20 rounded-full border-4 border-gold object-cover" />
        <p className="mt-3 text-xl font-extrabold text-primary-foreground">Alex Mukasa</p>
        <p className="text-sm text-primary-foreground/70">+256 771 234 567</p>
        <span className="mt-3 inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">Gold Banker · {b.balance}GB</span>
      </div>
      <ul className="mx-5 mt-5 overflow-hidden rounded-3xl bg-card shadow-soft">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 border-b border-border p-4 last:border-0">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft"><Icon className="h-5 w-5 text-primary" /></span>
            <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </li>
        ))}
      </ul>
      <Link to="/login" className="mx-5 mt-5 flex h-12 items-center justify-center gap-2 rounded-[14px] border border-destructive text-sm font-bold text-destructive">
        <LogOut className="h-4 w-4" />Sign Out
      </Link>
      <BottomNav />
    </Frame>
  );
}
