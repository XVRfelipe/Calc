"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ProfileSetupView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startup = searchParams.get("startup") ?? "";
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace(startup ? `/login?startup=${encodeURIComponent(startup)}` : "/login");
      }
    });
  }, [router, startup]);

  return (
    <main className="profile-builder-page">
      <section className="profile-builder-shell" aria-label="Create profile">
        <div className={`profile-builder-add ${isCreating ? "is-open" : ""}`}>
          {isCreating && (
            <span className="profile-builder-avatar profile-builder-add-avatar profile-builder-user-icon" aria-hidden="true" />
          )}
          <button
            type="button"
            aria-label="Create profile"
            aria-expanded={isCreating}
            onClick={() => setIsCreating(true)}
          >
            +
          </button>
        </div>
      </section>
    </main>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<main className="profile-builder-page" />}>
      <ProfileSetupView />
    </Suspense>
  );
}
