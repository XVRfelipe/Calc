"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────
type Tab = "saved" | "mystartups" | "settings";

type SavedStartup = {
  id: string;
  name: string;
  spec: string;
  mrr: string;
};

type MyStartup = {
  id: string;
  name: string;
  spec: string;
  mrr: string;
  likes: number;
};

// ── Helpers ────────────────────────────────────────────────────────
function initials(name: string) {
  return (
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "C"
  );
}

// ── Share icon SVG ─────────────────────────────────────────────────
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M7 4.5A2.5 2.5 0 0 1 9.5 2h5A2.5 2.5 0 0 1 17 4.5V21l-5-3-5 3V4.5Z"/>
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}

// ── Startup card used in both tabs ────────────────────────────────
function StartupCard({ name, spec, mrr }: { name: string; spec: string; mrr: string }) {
  return (
    <div className="pf2-startup-card">
      <div className="pf2-startup-icon">{name.charAt(0)}</div>
      <div className="pf2-startup-meta">
        <strong>{name}</strong>
        <span>{spec}</span>
      </div>
      {mrr && <span className="pf2-startup-mrr">{mrr}</span>}
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────
function ProfileView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "saved";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // left-col data
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [focus, setFocus] = useState("");
  const [starsTotal, setStarsTotal] = useState(0);
  const [myStartupsCount, setMyStartupsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // right-col data
  const [savedStartups, setSavedStartups] = useState<SavedStartup[]>([]);
  const [myStartups, setMyStartups] = useState<MyStartup[]>([]);

  // settings
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // nav menu
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const accountEmail = user?.email ?? "";
  const accountAvatar = user?.user_metadata?.avatar_url as string | undefined;
  const accountInitials = initials(fullName);

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace("/login"); return; }
      const u = data.session.user;
      setUser(u);
      const name =
        (u.user_metadata?.full_name as string | undefined) ||
        (u.user_metadata?.name as string | undefined) ||
        u.email?.split("@")[0] || "";
      const uname =
        (u.user_metadata?.username as string | undefined) ||
        u.email?.split("@")[0] || "";
      const foc = (u.user_metadata?.focus as string | undefined) || "";
      setFullName(name);
      setUsername(uname);
      setFocus(foc);
      setEditName(name);
      setEditUsername(uname);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/login");
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  // ── Fetch data ──
  useEffect(() => {
    if (!user) return;
    (async () => {
      setDataLoading(true);

      const [
        { data: saved },
        { data: mine },
        { count: fwers },
      ] = await Promise.all([
        supabase.from("saved_startups").select("id, name, spec, mrr").eq("user_id", user.id),
        supabase.from("startups").select("id, name, spec, mrr, likes").eq("user_id", user.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
      ]);

      const savedList = (saved ?? []) as SavedStartup[];
      const mineList = (mine ?? []) as MyStartup[];

      setSavedStartups(savedList);
      setMyStartups(mineList);
      setMyStartupsCount(mineList.length);
      setStarsTotal(mineList.reduce((s, m) => s + (m.likes ?? 0), 0));
      setFollowersCount(fwers ?? 0);
      setDataLoading(false);
    })();
  }, [user]);

  // ── Account menu close ──
  useEffect(() => {
    if (!isAccountOpen) return;
    const down = (e: PointerEvent) => {
      if (!accountMenuRef.current?.contains(e.target as Node)) setIsAccountOpen(false);
    };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setIsAccountOpen(false); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [isAccountOpen]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  }, [router]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`https://calc.co/${username}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [username]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg("");
    const { error } = await supabase.auth.updateUser({
      data: { full_name: editName.trim(), username: editUsername.trim() },
    });
    setSaving(false);
    if (error) {
      setSaveMsg("Failed to save.");
    } else {
      setFullName(editName.trim());
      setUsername(editUsername.trim());
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2200);
    }
  }, [user, editName, editUsername]);

  const handleCancel = useCallback(() => {
    setEditName(fullName);
    setEditUsername(username);
    setSaveMsg("");
  }, [fullName, username]);

  const setTab = (t: Tab) => {
    setActiveTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t);
    window.history.replaceState(null, "", url.toString());
  };

  if (loading) {
    return (
      <div className="pf2-page">
        <div className="pf2-loading"><span /></div>
      </div>
    );
  }

  const focusTags = focus ? [focus] : [];

  return (
    <div className="pf2-page">

      {/* ── Navbar ── */}
      <header className="top-nav">
        <a className="brand" href="/" aria-label="Calc home">
          <img src="/assets/calc-logo.png" alt="Calc logo" />
        </a>
        <nav className="main-links" aria-label="Main navigation">
          <div className="main-links-pill" aria-hidden="true" />
          <a href="/">Discover</a>
          <a href="#">Categories</a>
          <a href="#">Founders</a>
          <a href="#">Submit</a>
        </nav>
        <div className="nav-actions">
          <button className="submit-startup" type="button" onClick={() => router.push("/onboarding")}>
            + Submit startup
          </button>
          {user && (
            <div className="account-menu-wrap" ref={accountMenuRef}>
              <button
                className="avatar-circle is-logged-in"
                type="button"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
                onClick={() => setIsAccountOpen((v) => !v)}
              >
                {accountAvatar
                  ? <img src={accountAvatar} alt="" />
                  : <span>{accountInitials}</span>}
              </button>
              <div className={`account-menu${isAccountOpen ? " is-open" : ""}`} role="menu">
                <div className="account-menu-card">
                  <div className="account-menu-profile">
                    <div className="account-menu-copy">
                      <strong>{fullName}</strong>
                      <span>{accountEmail}</span>
                    </div>
                    <button className="account-menu-avatar" type="button"
                      onClick={() => { setIsAccountOpen(false); router.push("/profile"); }}>
                      {accountAvatar ? <img src={accountAvatar} alt="" /> : <span>{accountInitials}</span>}
                    </button>
                  </div>
                  <button className="account-menu-item is-active" type="button" role="menuitem"
                    onClick={() => { setIsAccountOpen(false); router.push("/profile"); }}>
                    <span className="account-menu-icon account-menu-icon-verified" aria-hidden="true" />
                    Profile
                  </button>
                  <button className="account-menu-item" type="button" role="menuitem"
                    onClick={() => { setIsAccountOpen(false); router.push("/profile-setup"); }}>
                    <span className="account-menu-icon account-menu-icon-toggle" aria-hidden="true" />
                    Settings
                  </button>
                  <div className="account-menu-divider" />
                  <button className="account-menu-item" type="button" role="menuitem" onClick={handleSignOut}>
                    <span className="account-menu-icon account-menu-icon-signout" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Two-column layout ── */}
      <div className="pf2-layout">

        {/* ══ LEFT COLUMN ══ */}
        <aside className="pf2-sidebar">

          {/* share icon */}
          <button
            type="button"
            className="pf2-share-btn"
            onClick={handleCopyLink}
            aria-label="Copy profile link"
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
            ) : <ShareIcon />}
          </button>

          {/* avatar */}
          <div className="pf2-avatar">
            {accountAvatar
              ? <img src={accountAvatar} alt={fullName} />
              : <span>{accountInitials}</span>}
          </div>

          {/* name + title */}
          <h1 className="pf2-name">{fullName || "—"}</h1>
          <p className="pf2-title">
            {(user?.user_metadata?.title as string | undefined) || "Startup Explorer"}
          </p>

          {/* tags */}
          {focusTags.length > 0 && (
            <div className="pf2-tags">
              {focusTags.map((t) => (
                <span key={t} className="pf2-tag">{t}</span>
              ))}
            </div>
          )}

          {/* metrics */}
          <div className="pf2-metrics">
            <div className="pf2-metric">
              <strong>{dataLoading ? "—" : starsTotal}</strong>
              <span>Stars</span>
            </div>
            <div className="pf2-metric-divider" />
            <div className="pf2-metric">
              <strong>{dataLoading ? "—" : myStartupsCount}</strong>
              <span>Startups</span>
            </div>
            <div className="pf2-metric-divider" />
            <div className="pf2-metric">
              <strong>{dataLoading ? "—" : followersCount}</strong>
              <span>Followers</span>
            </div>
          </div>

          {/* action buttons */}
          <div className="pf2-actions">
            <button
              type="button"
              className="pf2-btn-edit"
              onClick={() => router.push("/profile-setup")}
            >
              Edit profile
            </button>
            <div className="pf2-btn-row">
              <button type="button" className="pf2-btn-secondary">
                Following
              </button>
              <button type="button" className="pf2-btn-secondary" onClick={handleCopyLink}>
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </aside>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="pf2-main">

          {/* tabs */}
          <div className="pf2-tabs" role="tablist">
            {(["saved", "mystartups", "settings"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={activeTab === t}
                className={`pf2-tab${activeTab === t ? " is-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "saved" && "Saved startups"}
                {t === "mystartups" && "My startups"}
                {t === "settings" && "Settings"}
              </button>
            ))}
          </div>

          {/* ── Saved startups ── */}
          {activeTab === "saved" && (
            <div className="pf2-tab-body" role="tabpanel">
              {dataLoading ? (
                <div className="pf2-skeleton-grid">
                  {[1,2,3,4,5,6].map((i) => <div key={i} className="pf2-skeleton-card" />)}
                </div>
              ) : savedStartups.length === 0 ? (
                <div className="pf2-empty">
                  <BookmarkIcon />
                  <p>No saved startups yet.</p>
                  <a href="/" className="pf2-empty-link">Explore startups →</a>
                </div>
              ) : (
                <div className="pf2-grid">
                  {savedStartups.map((s) => (
                    <StartupCard key={s.id} name={s.name} spec={s.spec} mrr={s.mrr} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── My startups ── */}
          {activeTab === "mystartups" && (
            <div className="pf2-tab-body" role="tabpanel">
              {dataLoading ? (
                <div className="pf2-skeleton-grid">
                  {[1,2,3].map((i) => <div key={i} className="pf2-skeleton-card" />)}
                </div>
              ) : myStartups.length === 0 ? (
                <div className="pf2-empty">
                  <RocketIcon />
                  <p>You haven&apos;t launched a startup yet.</p>
                  <button
                    type="button"
                    className="pf2-empty-action"
                    onClick={() => router.push("/onboarding")}
                  >
                    Submit your startup →
                  </button>
                </div>
              ) : (
                <div className="pf2-grid">
                  {myStartups.map((s) => (
                    <StartupCard key={s.id} name={s.name} spec={s.spec} mrr={s.mrr} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {activeTab === "settings" && (
            <div className="pf2-tab-body pf2-settings" role="tabpanel">

              {/* public profile */}
              <div className="pf2-settings-section">
                <div className="pf2-settings-label">
                  <strong>Public profile</strong>
                  <span>This will be displayed on your profile.</span>
                </div>
                <div className="pf2-settings-fields">
                  <input
                    className="pf2-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Full name"
                    aria-label="Full name"
                  />
                  <div className="pf2-prefix-input">
                    <span>calc.co/</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="username"
                      aria-label="Username"
                    />
                  </div>
                </div>
              </div>

              <div className="pf2-settings-divider" />

              {/* danger zone */}
              <div className="pf2-settings-section pf2-settings-section--row">
                <div className="pf2-settings-label">
                  <strong>Log out of all devices</strong>
                  <span>Log out of all other active sessions on other devices besides this one.</span>
                </div>
                <button type="button" className="pf2-btn-logout" onClick={handleSignOut}>
                  Log out
                </button>
              </div>

              <div className="pf2-settings-divider" />

              {/* footer */}
              <div className="pf2-settings-footer">
                {saveMsg && (
                  <span className={`pf2-save-msg${saveMsg === "Saved!" ? " is-ok" : " is-err"}`}>
                    {saveMsg}
                  </span>
                )}
                <div className="pf2-settings-actions">
                  <button type="button" className="pf2-btn-cancel" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="button" className="pf2-btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="pf2-page"><div className="pf2-loading"><span /></div></div>}>
      <ProfileView />
    </Suspense>
  );
}
