"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function OnboardingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startup = searchParams.get("startup") ?? "";
  const [isEntered, setIsEntered] = useState(false);

  const profileHref = useMemo(() => {
    const params = new URLSearchParams();
    if (startup) params.set("startup", startup);
    return `/profile-setup${params.toString() ? `?${params.toString()}` : ""}`;
  }, [startup]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace(startup ? `/login?startup=${encodeURIComponent(startup)}` : "/login");
      }
    });
  }, [router, startup]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsEntered(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="onboarding-empty-page">
      <section className={`onboarding-empty-card ${isEntered ? "is-entered" : ""}`} aria-label="Create profile and workspace">
        <img className="onboarding-empty-icon" src="/assets/onboarding-document.png" alt="" />

        <h1>Create your profile workspace</h1>
        <p>This is where you will manage your profile, social links, saved startups, and workspace setup.</p>

        <button type="button" onClick={() => router.push(profileHref)}>
          Create New
        </button>
      </section>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<main className="onboarding-empty-page" />}>
      <OnboardingView />
    </Suspense>
  );
}
