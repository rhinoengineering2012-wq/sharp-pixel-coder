import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Frame, PrimaryButton } from "@/components/rhino/AppFrame";
import { haptic } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" },
      { title: "Welcome — RHINO DATABANK" },
      { name: "description", content: "How RHINO saves your expiring data bundles." },
      { property: "og:title", content: "Welcome — RHINO DATABANK" },
      { property: "og:description", content: "Deposit before midnight, withdraw anytime on any network." },
    ],
  }),
  component: Onboarding,
});

const pages = [
  { img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80", title: "Your Data Expires. We Save It.", sub: "Stop losing 100GB+ yearly. The average Ugandan loses UGX 500k in expired bundles. RHINO saves it." },
  { img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", title: "Deposit Before Midnight", sub: "Secure your MTN, Airtel and Lyca Mobile bundles before 11:59pm. Pay only a 10% fee. Keep 90%." },
  { img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80", title: "Withdraw Anytime, Any Network", sub: "Get your data back as data, MoMo Cash, or sell it on the market. Instant." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const p = pages[i] ?? pages[0];
  if (!p) return null;
  const next = () => { haptic(); i < 2 ? setI(i + 1) : nav({ to: "/login" }); };
  return (
    <Frame className="relative flex flex-col bg-card">
      <Link to="/login" className="absolute right-5 top-5 z-10 rounded-full glass px-3 py-1 text-sm font-medium text-primary-foreground">Skip</Link>
      <img key={p.img} src={p.img} alt="" className="h-[min(42dvh,420px)] w-full rounded-b-[32px] object-cover animate-rise" />
      <div key={i} className="flex flex-1 flex-col px-6 pt-8 text-center animate-rise">
        <h1 className="text-[28px] font-extrabold leading-tight text-ink">{p.title}</h1>
        <p className="mt-4 text-[15px] leading-[22px] text-muted-foreground">{p.sub}</p>
      </div>
      <div className="px-6 pb-6">
        <div className="mb-6 flex justify-center gap-2">
          {pages.map((_, k) => (
            <button key={k} aria-label={`Page ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2 bg-border"}`} />
          ))}
        </div>
        <PrimaryButton onClick={next}>{i < 2 ? "Next" : "Get Started"}</PrimaryButton>
      </div>
    </Frame>
  );
}
