import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect } from "react";

const BG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "RHINO DATABANK — Data Bank of Africa" },
      { name: "description", content: "Save expiring MTN, Airtel and Lyca Mobile data bundles and withdraw anytime." },
      { property: "og:title", content: "RHINO DATABANK — Data Bank of Africa" },
      { property: "og:description", content: "Never lose expiring data again. Deposit, store and withdraw your bundles." },
      { property: "og:image", content: BG },
      { name: "twitter:image", content: BG },
    ],
  }),
  component: Splash,
});

function Splash() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav({ to: "/onboarding" }), 2500);
    return () => clearTimeout(t);
  }, [nav]);
  return (
    <div className="splash-screen relative mx-auto flex max-w-md flex-col items-center justify-center overflow-hidden bg-gradient-splash text-center">
      <img src={BG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="relative flex flex-col items-center animate-rise">
        <ShieldCheck className="h-24 w-24 text-gold" strokeWidth={1.6} />
        <h1 className="mt-4 text-[28px] font-bold text-primary-foreground">RHINO DATABANK</h1>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-normal text-gold">Data Bank of Africa</p>
        <div className="mt-10 flex gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-gold animate-dot" style={{ animationDelay: `${i * 0.16}s` }} />
          ))}
        </div>
        <p className="mt-4 text-[13px] text-gold opacity-70">Initializing Secure Data Vault...</p>
      </div>
    </div>
  );
}
