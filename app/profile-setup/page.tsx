"use client";

import type { ChangeEvent, FormEvent } from "react";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StepId = "details" | "socials" | "workspace";

type ProfileDraft = {
  fullName: string;
  username: string;
  email: string;
  title: string;
  timezone: string;
  workingHours: string;
  bio: string;
  twitter: string;
  website: string;
  linkedin: string;
  workspace: string;
  focus: string;
  cadence: string;
};

const profileSteps: Array<{ id: StepId; label: string }> = [
  { id: "details", label: "Personal details" },
  { id: "socials", label: "Socials" },
  { id: "workspace", label: "Workspace" },
];

const initialProfile: ProfileDraft = {
  fullName: "",
  username: "",
  email: "",
  title: "Startup Explorer",
  timezone: "GMT-3",
  workingHours: "9 AM - 6 PM",
  bio: "",
  twitter: "",
  website: "",
  linkedin: "",
  workspace: "Calc Workspace",
  focus: "Startup signals",
  cadence: "Weekly digest",
};

// Shared signal so only one CustomSelect is open at a time
let openSelectSetter: ((v: boolean) => void) | null = null;

type CustomSelectProps = {
  value: string;
  options: string[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

function CustomSelect({ value, options, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Register this instance so others can close it
  const openRef = useRef(isOpen);
  openRef.current = isOpen;

  const open = useCallback(() => {
    // Close whichever other select is open
    if (openSelectSetter && openSelectSetter !== setIsOpen) {
      openSelectSetter(false);
    }
    openSelectSetter = setIsOpen;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (openSelectSetter === setIsOpen) openSelectSetter = null;
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  const select = useCallback((option: string) => {
    // Synthesize a ChangeEvent so the existing updateProfile handler works unchanged
    const syntheticEvent = {
      target: { value: option },
    } as ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    close();
  }, [onChange, close]);

  return (
    <div className="cs-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`cs-trigger${isOpen ? " is-open" : ""}`}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="cs-value">{value}</span>
        <svg
          className="cs-chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <ul className="cs-dropdown" role="listbox">
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={`cs-option${opt === value ? " is-selected" : ""}`}
              onPointerDown={(e) => {
                e.preventDefault(); // prevent blur before click
                select(opt);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProfileSetupView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startup = searchParams.get("startup") ?? "";
  const [stepIndex, setStepIndex] = useState(0);
  const [visibleStepIndex, setVisibleStepIndex] = useState(0);
  const [stepMotion, setStepMotion] = useState<"idle" | "leaving" | "entering">("idle");
  const [avatarPulseKey, setAvatarPulseKey] = useState(0);
  const [workspacePulseKey, setWorkspacePulseKey] = useState(0);
  const [profile, setProfile] = useState<ProfileDraft>(initialProfile);
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stepExitTimeoutRef = useRef<number | null>(null);
  const stepEnterTimeoutRef = useRef<number | null>(null);

  const currentStep = profileSteps[visibleStepIndex];

  const dashboardHref = useMemo(() => {
    const params = new URLSearchParams();
    if (startup) params.set("startup", startup);
    return `/${params.toString() ? `?${params.toString()}` : ""}`;
  }, [startup]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace(startup ? `/login?startup=${encodeURIComponent(startup)}` : "/login");
        return;
      }

      const user = data.session.user;
      setProfile((draft) => ({
        ...draft,
        fullName:
          draft.fullName ||
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          "",
        username: draft.username || user.email?.split("@")[0] || "",
        email: draft.email || user.email || "",
      }));
    });
  }, [router, startup]);

  useEffect(() => {
    return () => {
      if (stepExitTimeoutRef.current) {
        window.clearTimeout(stepExitTimeoutRef.current);
      }

      if (stepEnterTimeoutRef.current) {
        window.clearTimeout(stepEnterTimeoutRef.current);
      }
    };
  }, []);

  const transitionToStep = (nextStepIndex: number) => {
    if (stepMotion !== "idle") {
      return;
    }

    if (nextStepIndex === stepIndex) {
      return;
    }

    if (stepExitTimeoutRef.current) {
      window.clearTimeout(stepExitTimeoutRef.current);
    }

    if (stepEnterTimeoutRef.current) {
      window.clearTimeout(stepEnterTimeoutRef.current);
    }

    setStepIndex(nextStepIndex);
    setStepMotion("leaving");

    stepExitTimeoutRef.current = window.setTimeout(() => {
      setVisibleStepIndex(nextStepIndex);
      setStepMotion("entering");

      stepEnterTimeoutRef.current = window.setTimeout(() => {
        setStepMotion("idle");
      }, 280);
    }, 280);
  };

  const updateProfile =
    (field: keyof ProfileDraft) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setProfile((draft) => ({ ...draft, [field]: event.target.value }));

      if (field === "fullName") {
        setAvatarPulseKey((key) => key + 1);
      }

      if (field === "workspace" || field === "focus" || field === "cadence") {
        setWorkspacePulseKey((key) => key + 1);
      }
    };

  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }

    transitionToStep(Math.max(stepIndex - 1, 0));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (stepMotion !== "idle") {
      return;
    }

    if (stepIndex < profileSteps.length - 1) {
      transitionToStep(stepIndex + 1);
      return;
    }

    router.push(dashboardHref);
  };

  const initials =
    profile.fullName
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CX";

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPhoto(url);
  };

  const handleCopyProfile = () => {
    const username = profile.username || "username";
    navigator.clipboard.writeText(`https://calc.co/${username}`).catch(() => {});
  };

  return (
    <main className="profile-flow-page">
      <section className="profile-flow-shell" aria-label="Create profile">
        <div className="profile-flow-stepper" aria-label="Profile setup progress">
          {profileSteps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`profile-flow-step ${index === stepIndex ? "is-active" : ""} ${index < stepIndex ? "is-complete" : ""}`}
              onClick={() => transitionToStep(index)}
              aria-current={index === stepIndex ? "step" : undefined}
            >
              <span>{index + 1}</span>
              {step.label}
            </button>
          ))}
        </div>

        <form className="profile-flow-card" onSubmit={handleSubmit}>
          <header className="profile-flow-head">
            <div>
              <h1>Edit your profile</h1>
              <p>Build the public profile and workspace people will see on Calc.</p>
            </div>
            <button type="button" className="profile-flow-close" onClick={() => router.push(dashboardHref)} aria-label="Close">
              X
            </button>
          </header>

          <div className="profile-flow-body">
            <div className={`profile-flow-questions is-${stepMotion}`}>
              {currentStep.id === "details" && (
                <>
                  <div className="profile-flow-section-title">
                    <h2>Let's start with your details</h2>
                    <p>Provide essential information to create your account identity.</p>
                  </div>

                  <label className="profile-flow-question">
                    <span>Full name</span>
                    <input value={profile.fullName} onChange={updateProfile("fullName")} placeholder="Alex Ratner" />
                  </label>

                  <label className="profile-flow-question">
                    <span>Username</span>
                    <div className="profile-flow-prefix-field">
                      <strong>calc.co/</strong>
                      <input value={profile.username} onChange={updateProfile("username")} placeholder="alexratner" />
                    </div>
                  </label>

                  <label className="profile-flow-question">
                    <span>Email address</span>
                    <input type="email" value={profile.email} onChange={updateProfile("email")} placeholder="alex@company.com" />
                  </label>

                  <div className="profile-flow-question-row">
                    <label className="profile-flow-question">
                      <span>Timezone</span>
                      <CustomSelect
                        value={profile.timezone}
                        options={["GMT-8", "GMT-5", "GMT-3", "GMT+0", "GMT+1"]}
                        onChange={updateProfile("timezone")}
                      />
                    </label>

                    <label className="profile-flow-question">
                      <span>Working hours</span>
                      <input value={profile.workingHours} onChange={updateProfile("workingHours")} placeholder="10 AM - 6 PM" />
                    </label>
                  </div>

                  <label className="profile-flow-question profile-flow-question--last">
                    <span>Title</span>
                    <input value={profile.title} onChange={updateProfile("title")} placeholder="Startup Explorer" />
                  </label>
                </>
              )}

              {currentStep.id === "socials" && (
                <>
                  <div className="profile-flow-section-title">
                    <h2>Add your social context</h2>
                    <p>These links help founders understand who you are and where to follow you.</p>
                  </div>

                  <label className="profile-flow-question">
                    <span>Bio</span>
                    <textarea value={profile.bio} onChange={updateProfile("bio")} placeholder="Curating startup signals, market notes, and favorite products worth following." />
                  </label>

                  <div className="profile-flow-question-row">
                    <label className="profile-flow-question">
                      <span>X / Twitter</span>
                      <input value={profile.twitter} onChange={updateProfile("twitter")} placeholder="@username" />
                    </label>

                    <label className="profile-flow-question">
                      <span>Website</span>
                      <input value={profile.website} onChange={updateProfile("website")} placeholder="https://..." />
                    </label>
                  </div>

                  <label className="profile-flow-question">
                    <span>LinkedIn</span>
                    <input value={profile.linkedin} onChange={updateProfile("linkedin")} placeholder="linkedin.com/in/username" />
                  </label>
                </>
              )}

              {currentStep.id === "workspace" && (
                <>
                  <div className="profile-flow-section-title">
                    <h2>Create your workspace</h2>
                    <p>Set the default space for saved startups, notes, and dashboard signals.</p>
                  </div>

                  <label className="profile-flow-question">
                    <span>Workspace name</span>
                    <input value={profile.workspace} onChange={updateProfile("workspace")} placeholder="Calc Workspace" />
                  </label>

                  <div className="profile-flow-question-row">
                    <label className="profile-flow-question">
                      <span>Main focus</span>
                      <CustomSelect
                        value={profile.focus}
                        options={["Startup signals", "Market research", "Brand inspiration", "Funding notes"]}
                        onChange={updateProfile("focus")}
                      />
                    </label>

                    <label className="profile-flow-question">
                      <span>Updates</span>
                      <CustomSelect
                        value={profile.cadence}
                        options={["Daily briefing", "Weekly digest", "Only important alerts"]}
                        onChange={updateProfile("cadence")}
                      />
                    </label>
                  </div>

                  <div key={workspacePulseKey} className="profile-flow-summary-block">
                    <span>Workspace preview</span>
                    <strong>{profile.workspace || "Calc Workspace"}</strong>
                    <p>{profile.focus} with {profile.cadence.toLowerCase()}.</p>
                  </div>
                </>
              )}
            </div>

            <aside className="profile-flow-preview" aria-label="Profile preview">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="profile-flow-avatar-input"
                onChange={handleAvatarUpload}
                aria-label="Upload profile photo"
              />

              {/* Avatar with camera icon */}
              <button
                type="button"
                className="profile-flow-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile photo"
              >
                <div key={avatarPulseKey} className="profile-flow-preview-avatar">
                  {avatarPhoto ? (
                    <img src={avatarPhoto} alt="" className="profile-flow-avatar-photo" />
                  ) : (
                    <>
                      {initials}
                      <span aria-hidden="true">/</span>
                    </>
                  )}
                </div>
                <span className="profile-flow-camera-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </span>
              </button>

              <h3>{profile.fullName || "James Carter"}</h3>
              <p>{profile.title || "Project manager"}</p>
              <span className="profile-flow-hours">{profile.workingHours || "10 AM - 6 PM"}</span>
              <div className="profile-flow-preview-bio">
                {profile.bio || "Your short bio and social context will appear here as you answer the questions."}
              </div>


            </aside>
          </div>

          <footer className="profile-flow-footer">
            <span>Last updated: Jun 12, 2026</span>
            <div className="profile-flow-actions">
              <button type="button" className="profile-flow-secondary" onClick={goBack}>
                {stepIndex === 0 ? "Go back" : "Back"}
              </button>
              <button type="submit" className="profile-flow-primary">
                {stepIndex === profileSteps.length - 1 ? (
                  "Save changes"
                ) : (
                  <>
                    Next Step <span aria-hidden="true">-&gt;</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </main>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<main className="profile-flow-page" />}>
      <ProfileSetupView />
    </Suspense>
  );
}
