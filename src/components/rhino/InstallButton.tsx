import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    const mode = window.matchMedia("(display-mode: standalone)");
    const sync = () => setInstalled(mode.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const complete = () => { setInstalled(true); setPrompt(null); };
    sync();
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", complete);
    mode.addEventListener("change", sync);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", complete);
      mode.removeEventListener("change", sync);
    };
  }, []);
  const install = async () => {
    if (!prompt) { setHelp(true); return; }
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPrompt(null);
    } catch { setPrompt(null); setHelp(true); }
  };
  return <>
    <Button variant="ghost" disabled={installed} onClick={install} title="Install RHINO DATABANK" aria-label={installed ? "RHINO installed" : "Install RHINO DATABANK"} className="nav-item h-auto flex-col gap-1 rounded-lg px-1 py-2 text-ink">
      <Download className="size-5" /><span className="text-[10px] font-semibold">{installed ? "Installed" : "Install"}</span>
    </Button>
    <Dialog open={help} onOpenChange={setHelp}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-lg sm:max-w-sm">
        <DialogTitle>Install RHINO DATABANK</DialogTitle>
        <DialogDescription>{ios ? "In Safari, tap Share, then Add to Home Screen." : "Open RHINO in your browser, then choose Install app or Add to Home screen from the browser menu. If the option is missing, this browser does not offer installation here."}</DialogDescription>
      </DialogContent>
    </Dialog>
  </>;
}