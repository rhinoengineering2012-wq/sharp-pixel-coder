import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Frame } from "@/components/rhino/AppFrame";
import { supabase } from "@/integrations/supabase/client";
import { useRhinoAuth } from "@/components/rhino/AuthProvider";
export const Route = createFileRoute("/reset-password")({ head: () => ({ meta: [
  { title: "Reset Password — RHINO DATABANK" }, { name: "description", content: "Choose a new password for your RHINO DATABANK account." }, { property: "og:title", content: "Reset Password — RHINO DATABANK" }, { property: "og:description", content: "Securely update your RHINO account password." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: ResetPassword });
function ResetPassword() {
  const { user, ready } = useRhinoAuth(); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? error.message : "Password updated. You can now sign in with your new password."); } catch { setMessage("Could not update your password. Try again."); } finally { setBusy(false); } }
  return <Frame className="pro-theme px-6 pt-10"><h1 className="text-2xl font-bold">New password</h1>{ready && user ? <form onSubmit={submit} className="mt-6 space-y-4"><label className="block space-y-2 text-sm"><span>New password</span><input className="pro-input" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label><Button disabled={busy} className="h-12 w-full">Update Password</Button></form> : <p className="mt-5 text-sm text-muted-foreground">{ready ? "Open the password reset link from your email first." : "Checking your reset link…"}</p>}{message && <p role="status" className="mt-5 text-sm">{message}</p>}<Button variant="link" asChild className="mt-5"><Link to="/login">Back to Sign In</Link></Button></Frame>;
}