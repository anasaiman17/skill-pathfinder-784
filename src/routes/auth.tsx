import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or register — Skillwise" },
      { name: "description", content: "Sign in to Skillwise or create an account to access your career planning workspace." },
      { property: "og:title", content: "Sign in or register — Skillwise" },
      { property: "og:description", content: "Access your Skillwise career planning workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "signin" | "register";

function AuthPage() {
  const navigate = useNavigate({ from: "/auth" });
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void navigate({ to: "/" });
      if (active) setCheckingSession(false);
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
        });

    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }

    void navigate({ to: "/" });
    setBusy(false);
  }

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Checking your account…</div>;
  }

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-cyan shadow-[4px_4px_0_var(--cyan)]"><Compass className="h-5 w-5" /></span>
          <span className="font-display text-[1.22rem] font-bold tracking-tight text-ink">skill<span className="text-cyan">wise</span></span>
        </Link>
        <Button asChild variant="ghost" className="text-ink/65 hover:bg-transparent hover:text-ink">
          <Link to="/"><ArrowLeft /> Back to dashboard</Link>
        </Button>
      </div>

      <div className="mx-auto grid w-full max-w-[1160px] items-center gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <section className="max-w-lg">
          <div className="mb-6 flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan"><span className="h-2 w-2 rounded-full bg-cyan" /> Keep your momentum</div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-6xl">Your next move, all in one place.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-ink/60">Create an account to access Skillwise whenever you need it. Your career planning details still stay on this device.</p>
          <div className="mt-9 space-y-4 text-sm text-ink/65">
            <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan" /> Sign in from any session</div>
            <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan" /> Keep your account separate from your profile data</div>
            <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan" /> Return to your skill roadmap in one click</div>
          </div>
        </section>

        <section className="blueprint-panel mx-auto w-full max-w-md bg-card">
          <div className="mb-7 flex gap-1 border-b border-ink/10">
            <button type="button" onClick={() => switchMode("signin")} className={`-mb-px border-b-2 px-3 pb-3 text-sm font-bold transition-colors ${mode === "signin" ? "border-cyan text-ink" : "border-transparent text-ink/40 hover:text-ink"}`}>Sign in</button>
            <button type="button" onClick={() => switchMode("register")} className={`-mb-px border-b-2 px-3 pb-3 text-sm font-bold transition-colors ${mode === "register" ? "border-cyan text-ink" : "border-transparent text-ink/40 hover:text-ink"}`}>Create account</button>
          </div>
          <div className="mb-7">
            <div className="app-kicker text-cyan">{mode === "signin" ? "Welcome back" : "Start your account"}</div>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">{mode === "signin" ? "Sign in to Skillwise" : "Register with email"}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">{mode === "signin" ? "Continue building your career roadmap." : "Use your email to create a Skillwise account."}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-ink">Email address<span className="mt-2 flex items-center gap-2"><Mail className="h-4 w-4 text-ink/35" /><input className="app-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></span></label>
            <label className="block text-sm font-semibold text-ink">Password<span className="mt-2 flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-ink/35" /><input className="app-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required /></span></label>
            {mode === "register" && <label className="block text-sm font-semibold text-ink">Confirm password<span className="mt-2 flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-ink/35" /><input className="app-input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" minLength={6} required /></span></label>}
            {error && <p role="alert" className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            {message && <p role="status" className="rounded-md border border-cyan/25 bg-cyan/10 px-3 py-2 text-sm text-ink">{message}</p>}
            <Button type="submit" disabled={busy} className="mt-2 h-11 w-full rounded-lg bg-ink font-bold text-ink-foreground hover:bg-ink/90">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}<ArrowRight /></Button>
          </form>
        </section>
      </div>
    </main>
  );
}