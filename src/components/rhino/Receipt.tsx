import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bundleName, money, paymentName, type Purchase } from "@/lib/purchases";

export function Receipt({ purchase }: { purchase: Purchase }) {
  const entries = [
    ["Transaction ID", purchase.id], ["Amount", money(purchase.bundle.price)],
    ["Bundle", `${bundleName(purchase.bundle)} · ${purchase.bundle.network}`],
    ["Paid with", `${paymentName(purchase.method)} ${purchase.payer}`],
    ["Recipient", purchase.recipient], ["Date", new Date(purchase.at).toLocaleString("en-UG")],
    ["Payment", `${purchase.status} (demo)`], ["Bundle status", purchase.status === "Success" ? "Processing Bundle (demo)" : "Not delivered"],
  ];
  function download() {
    const blob = new Blob([`RHINO DATABANK — DEMO RECEIPT\nNo money charged. No data delivered.\n\n${entries.map(([label, value]) => `${label}: ${value}`).join("\n")}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${purchase.id}.txt`; a.click(); URL.revokeObjectURL(url);
  }
  return <section className="space-y-4"><p className="text-xs font-semibold text-muted-foreground">DEMO RECEIPT · NO MONEY CHARGED</p><dl className="divide-y divide-border rounded-2xl border border-border bg-card px-4">{entries.map(([label, value]) => <div key={label} className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 py-3 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="break-words text-right font-semibold">{value}</dd></div>)}</dl><Button variant="outline" className="h-12 w-full" onClick={download}><Download className="size-4" />Download Receipt</Button></section>;
}