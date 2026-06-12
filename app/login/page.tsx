"use client";

import type { FormEvent } from "react";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AuthMode = "create" | "login";

function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const startup = searchParams.get("startup") ?? "";
  const onboardingHref = useMemo(() => {
    const params = new URLSearchParams();
    if (startup) params.set("startup", startup);
    return `/onboarding${params.toString() ? `?${params.toString()}` : ""}`;
  }, [startup]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim() || (mode === "create" && !name.trim())) {
      setLoading(false);
      setMessage("Complete the required fields.");
      setMessageType("error");
      return;
    }

    const result =
      mode === "create"
        ? await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              data: { name: name.trim() },
            },
          })
        : await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      setMessageType("error");
      return;
    }

    setMessage(mode === "create" ? "Account created. Continue setting up your profile." : "Welcome back.");
    setMessageType("success");
    router.push(onboardingHref);
  };

  const handleOAuth = async (provider: "google" | "twitter") => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    const redirectTo = `${window.location.origin}${onboardingHref}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  return (
    <main className="login-page">
      <section className="login-window" aria-label="Calc account access">
        <div className="login-window-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="login-form-panel">
          <a className="login-brand" href="/" aria-label="Calc home">
            <img src="/assets/calc-logo.png" alt="" />
            <span>Calc</span>
          </a>

          <div className="login-copy">
            <p>{mode === "create" ? "Create account" : "Welcome back"}</p>
            <h1>{mode === "create" ? "Create an account" : "Sign in to Calc"}</h1>
            <span>
              {mode === "create"
                ? "Choose startups, save signals, and finish your profile setup."
                : "Continue to your startup discovery workspace."}
            </span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === "create" && (
              <label>
                <span>Name</span>
                <input value={name} placeholder="Your name" autoComplete="name" onChange={(event) => setName(event.target.value)} />
              </label>
            )}

            <label>
              <span>Email</span>
              <input value={email} type="email" placeholder="you@company.com" autoComplete="email" onChange={(event) => setEmail(event.target.value)} />
            </label>

            <label>
              <span>Password</span>
              <input value={password} type="password" placeholder="Enter password" autoComplete={mode === "create" ? "new-password" : "current-password"} onChange={(event) => setPassword(event.target.value)} />
            </label>

            {message && <p className={`login-message ${messageType}`}>{message}</p>}

            <button className="login-primary" type="submit" disabled={loading}>
              {loading ? "Please wait..." : mode === "create" ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="login-socials" aria-label="Social login options">
            <button type="button" onClick={() => handleOAuth("google")} disabled={loading}>
              <span>G</span>
              Sign up with Google
            </button>
            <button type="button" onClick={() => handleOAuth("twitter")} disabled={loading}>
              <span>X</span>
              Sign in with X
            </button>
          </div>

          <p className="login-switch">
            {mode === "create" ? "Already have an account?" : "Need an account?"}{" "}
            <button type="button" onClick={() => setMode((current) => (current === "create" ? "login" : "create"))}>
              {mode === "create" ? "Login" : "Create account"}
            </button>
          </p>
        </div>

        <aside className="login-visual-panel" aria-label="Calc preview carousel">
          <div className="login-visual-carousel">
            <div className="login-visual-track">
              <figure className="login-visual-slide">
                <div className="login-visual-art login-visual-art-discover" role="img" aria-label="Discover startups and build your idea" />
              </figure>
              <figure className="login-visual-slide">
                <div className="login-visual-art login-visual-art-ideas" role="img" aria-label="Find Startup Ideas" />
              </figure>
              <figure className="login-visual-slide">
                <div className="login-visual-art login-visual-art-hit-rate" role="img" aria-label="Startup hit rate preview" />
              </figure>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="login-page" />}>
      <LoginView />
    </Suspense>
  );
}
