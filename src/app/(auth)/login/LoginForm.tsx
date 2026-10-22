"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error ?? "Login failed");
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-sm card p-6 space-y-4">
        <div className="text-center space-y-1">
          <div className="mx-auto grid place-items-center w-12 h-12 rounded-2xl bg-primary-soft text-2xl">
            🚚
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted">Log in to manage deliveries</p>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <label className="block">
          <span className="label">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="label">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </label>

        <button disabled={loading} className="btn btn-primary w-full">
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="text-sm text-center text-muted">
          No account?{" "}
          <Link href="/signup" className="text-primary font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}