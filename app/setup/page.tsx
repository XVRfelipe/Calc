"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";

function SetupView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);
  const startupName = searchParams.get("startup") ?? undefined;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace(startupName ? `/login?startup=${encodeURIComponent(startupName)}` : "/login");
      }
    });
  }, [router, startupName]);

  const finishSetup = () => {
    setIsOpen(false);
    router.push("/");
  };

  return (
    <main className="setup-page" aria-label="Account setup">
      <div className="setup-page-shell" aria-hidden="true">
        <header>
          <img src="/assets/calc-logo.png" alt="" />
          <span>Calc</span>
        </header>
        <section>
          <p>Complete your profile to unlock saved startups, followed companies, favorites, and startup news.</p>
          <div className="setup-page-preview-grid">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </section>
      </div>

      <AuthModal
        isOpen={isOpen}
        startupName={startupName}
        onClose={finishSetup}
        onSuccess={finishSetup}
      />
    </main>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<main className="setup-page" />}>
      <SetupView />
    </Suspense>
  );
}
