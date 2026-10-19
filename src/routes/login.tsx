import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Frame } from "@/components/rhino/AppFrame";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { validPhone } from "@/lib/purchases";
import { useRhinoAuth } from "@/components/rhino/AuthProvider";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sign In — RHINO DATABANK" },
      { name: "description", content: "Sign in or create your RHINO DATABANK account with email or Google." },
      { property: "og:title", content: "Sign In — RHINO DATABANK" },
      { property: "og:description", content: "Sign up with your Ugandan number and start saving data." },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { user } = useRhinoAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); const [name, setName] = useState("");
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage("");
    if (mode === "signup" && !validPhone(phone)) { setMessage("Use a Ugandan number: 10 digits starting with 07."); return; }
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error; setMessage("Check your email for a password reset link.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { phone, full_name: name }, emailRedirectTo: `${window.location.origin}/login` } });
        if (error) throw error;
        if (data.session) await nav({ to: "/bundles" }); else setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error;
        await nav({ to: "/bundles" });
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not sign in. Please try again."); }
    finally { setBusy(false); }
  }
  async function google() {
    setBusy(true); setMessage("");
    try { const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/login` });
      if (result.error) throw result.error; if (!result.redirected) await nav({ to: "/bundles" });
    } catch (err) { setMessage(err instanceof Error ? err.message : "Google sign-in could not finish."); } finally { setBusy(false); }
  }
  return <Frame className="pro-theme"><header className="px-6 pb-6 pt-10"><img src="/icons/icon-192.png" alt="RHINO" className="size-14 rounded-xl object-cover" /><p className="mt-5 text-xs font-bold text-gold">RHINO DATABANK</p><h1 className="mt-2 text-3xl font-extrabold">{mode === "signup" ? "Create account" : mode === "reset" ? "Reset password" : "Welcome back"}</h1></header>
  {user && <div className="mx-6 mb-5 rounded-xl border border-border p-4"><p className="break-words text-sm">Signed in as {user.email}</p><Button asChild className="mt-3 w-full"><Link to="/bundles">Continue to Bundles</Link></Button></div>}
  <form onSubmit={submit} className="space-y-4 px-6">
    {mode === "signup" && <><label className="block space-y-2 text-xs font-semibold"><span>Full name</span><input className="pro-input" required value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label><label className="block space-y-2 text-xs font-semibold"><span>Ugandan phone number</span><input className="pro-input" required type="tel" maxLength={10} placeholder="07XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} autoComplete="tel-national" /></label></>}
    <label className="block space-y-2 text-xs font-semibold"><span className="flex items-center gap-2"><Mail className="size-3" />Email</span><input className="pro-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
    {mode !== "reset" && <label className="block space-y-2 text-xs font-semibold"><span>Password</span><div className="relative"><input className="pro-input pr-12" type={show ? "text" : "password"} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" aria-label="Toggle password" onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</Button></div></label>}
    {message && <p role="status" className="text-sm text-gold">{message}</p>}
    <Button disabled={busy} type="submit" className="h-14 w-full bg-gold text-gold-ink hover:bg-gold/90"><LockKeyhole className="size-4" />{busy ? "Please wait…" : mode === "signup" ? "Create Account" : mode === "reset" ? "Send Reset Link" : "Sign In"}</Button>
    {mode !== "reset" && <Button disabled={busy} type="button" variant="outline" className="h-14 w-full" onClick={google}><span className="text-lg font-bold">G</span>Continue with Google</Button>}
    <Button type="button" variant="link" className="w-full text-gold" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>{mode === "signin" ? "Create an account" : "Back to Sign In"}</Button>
    {mode === "signin" && <Button type="button" variant="link" className="w-full text-muted-foreground" onClick={() => { setMode("reset"); setMessage(""); }}>Forgot password?</Button>}
    <Button asChild variant="ghost" className="w-full"><Link to="/bundles">Continue as Guest</Link></Button>
  </form></Frame>;
}
