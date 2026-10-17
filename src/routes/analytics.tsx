import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis } from "recharts";
import { BottomNav, Frame } from "@/components/rhino/AppFrame";
import { UGX_PER_GB, useBank } from "@/lib/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — RHINO DATABANK" },
      { name: "description", content: "Track how much data and money RHINO saved you." },
      { property: "og:title", content: "Analytics — RHINO DATABANK" },
      { property: "og:description", content: "Weekly savings and network breakdown of your data bank." },
    ],
  }),
  component: Analytics,
});

const week = [
  { d: "Mon", gb: 1.2 }, { d: "Tue", gb: 2.4 }, { d: "Wed", gb: 0.8 }, { d: "Thu", gb: 3.1 }, { d: "Fri", gb: 2.0 }, { d: "Sat", gb: 4.5 }, { d: "Sun", gb: 1.5 },
];
const nets = [
  { name: "MTN", v: 58, c: "var(--gold)" }, { name: "Airtel", v: 30, c: "var(--destructive)" }, { name: "Lyca Mobile", v: 12, c: "var(--primary)" },
];

function Analytics() {
  const b = useBank();
  return (
    <Frame className="pb-28">
      <h1 className="px-5 pt-6 text-2xl font-extrabold text-ink">Analytics</h1>
      <div className="mt-4 grid grid-cols-3 gap-3 px-5">
        {[[`${b.stored}GB`, "Saved"], [`${Math.round(b.stored * UGX_PER_GB / 1000)}k`, "UGX saved"], ["94%", "Rescue rate"]].map(([v, l]) => (
          <div key={l} className="rounded-[20px] bg-card p-4 shadow-soft">
            <p className="text-lg font-extrabold text-ink">{v}</p>
            <p className="text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      <section className="mx-5 mt-5 rounded-3xl bg-card p-5 shadow-elegant">
        <p className="text-sm font-bold text-ink">This week</p>
        <div className="mt-3 h-44">
          <ResponsiveContainer>
            <BarChart data={week}>
              <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Bar dataKey="gb" radius={[8, 8, 8, 8]} fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="mx-5 mt-5 flex items-center gap-4 rounded-3xl bg-card p-5 shadow-elegant">
        <div className="h-32 w-32">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={nets} dataKey="v" innerRadius={38} outerRadius={60} paddingAngle={3} stroke="none">
                {nets.map((n) => <Cell key={n.name} fill={n.c} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          <li className="text-sm font-bold text-ink">By network</li>
          {nets.map((n) => (
            <li key={n.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: n.c }} />{n.name}</span>
              <span className="font-bold text-ink">{n.v}%</span>
            </li>
          ))}
        </ul>
      </section>
      <BottomNav />
    </Frame>
  );
}
