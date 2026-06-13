"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Startup = {
  name: string;
  spec: string;
  mrr: string;
  likes: number;
  thumb: string;
};

const startups: Startup[] = [
  { name: "ProductHub", spec: "3D Asset Marketplace", mrr: "$48k", likes: 128, thumb: "producthub" },
  { name: "Opurent", spec: "Premium Rentals", mrr: "$22k", likes: 92, thumb: "opurent" },
  { name: "CourseHub", spec: "EdTech Platform", mrr: "$12k", likes: 76, thumb: "coursehub" },
  { name: "Amber", spec: "Creative Studio", mrr: "$31k", likes: 145, thumb: "amber" },
  { name: "Probe", spec: "Dev Infrastructure", mrr: "$8.4k", likes: 54, thumb: "probe" },
  { name: "Rowan X", spec: "Brand Studio", mrr: "$17k", likes: 88, thumb: "rowanx" },
  { name: "Elrune", spec: "Interior Design", mrr: "$54k", likes: 39, thumb: "elrune" },
  { name: "Clipzy", spec: "Video Agency", mrr: "$26k", likes: 61, thumb: "clipzy" },
];

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.6 2.5 4.8 13.2h6.1l-1 8.3 9.3-11.9h-6.3l.7-7.1Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4.5A2.5 2.5 0 0 1 9.5 2h5A2.5 2.5 0 0 1 17 4.5V21l-5-3-5 3V4.5Zm2.5-.5A.5.5 0 0 0 9 4.5v12.1l3-1.8 3 1.8V4.5a.5.5 0 0 0-.5-.5h-5Z" />
    </svg>
  );
}

function StartupThumb({ type }: { type: string }) {
  if (type === "producthub") {
    return (
      <div className="thumb thumb-producthub">
        <span className="badge">FEATURED</span>
        <div className="thumb-stack">
          <div className="thumb-tile tile-alien">
            <span className="tile-tag">Maya</span>
            <span className="tile-name">Dirk</span>
            <span className="tile-price">$139.99 value</span>
          </div>
          <div className="thumb-tile tile-furry">
            <span className="tile-tag">Cinema 4D</span>
            <span className="tile-name">Furry Felix</span>
            <span className="tile-price">$99.99 value</span>
            <span className="tile-free">Free</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "opurent") {
    return (
      <div className="thumb thumb-opurent">
        <div className="thumb-eye"></div>
        <div className="thumb-copy">
          <span className="thumb-eyebrow">Luxury Car Rental</span>
          <strong>
            Drive Beyond Limits
            <br />
            Live Beyond Time
          </strong>
        </div>
      </div>
    );
  }

  if (type === "coursehub") {
    return (
      <div className="thumb thumb-coursehub">
        <div className="thumb-sidebar">
          <div className="sidebar-row sidebar-row-active"></div>
          <div className="sidebar-row"></div>
          <div className="sidebar-row"></div>
          <div className="sidebar-row"></div>
        </div>
        <div className="thumb-main"></div>
      </div>
    );
  }

  if (type === "amber") {
    return (
      <div className="thumb thumb-amber">
        <span className="thumb-headline">AMBER STUDIO</span>
      </div>
    );
  }

  if (type === "probe") {
    return (
      <div className="thumb thumb-probe">
        <div className="probe-nav"></div>
        <div className="probe-headline">
          <strong>Build smarter.</strong>
          <strong>Move faster.</strong>
        </div>
        <div className="probe-cta">
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (type === "rowanx") {
    return (
      <div className="thumb thumb-rowanx">
        <div className="rowanx-portrait"></div>
        <div className="rowanx-copy">
          <span className="thumb-eyebrow">Rowan Blake</span>
          <strong>
            Shaping bold brands
            <br />
            for the digital age.
          </strong>
        </div>
      </div>
    );
  }

  if (type === "elrune") {
    return (
      <div className="thumb thumb-elrune">
        <div className="elrune-img"></div>
        <div className="elrune-copy">
          <strong>
            Luxury interiors
            <br />
            for iconic <em>living</em>
          </strong>
        </div>
      </div>
    );
  }

  return (
    <div className="thumb thumb-clipzy">
      <div className="clipzy-mock">
        <div className="clipzy-screen"></div>
      </div>
      <span className="thumb-headline-sm">
        Agency that makes your <em>videos &amp; reels</em> viral
      </span>
    </div>
  );
}

function StartupCard({
  startup,
  onOpen,
}: {
  startup: Startup;
  onOpen: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const likeCount = startup.likes + (liked ? 1 : 0);

  const handleLike = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLiked((current) => !current);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <article
      className="startup-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <StartupThumb type={startup.thumb} />
      <div className="card-body">
        <div className="card-head">
          <h3>{startup.name}</h3>
        </div>
        <p className="spec">{startup.spec}</p>
        <div className="mrr-line">
          <span>MRR</span> {startup.mrr}
          <button
            className={`like-button${liked ? " is-liked" : ""}`}
            type="button"
            aria-label={`Like ${startup.name}`}
            aria-pressed={liked}
            onClick={handleLike}
          >
            <LightningIcon />
            <span className="like-count">{likeCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

const startupDescriptions: Record<string, string> = {
  ProductHub:
    "ProductHub is a curated 3D asset marketplace helping creators find high-quality model packs, motion-ready characters, and visual assets with real usage signals.",
  Opurent:
    "Opurent connects premium car owners with travelers seeking luxury experiences, combining concierge service with real-time fleet availability.",
  CourseHub:
    "CourseHub is an edtech platform helping creators launch cohort-based courses with built-in payments, community, and completion analytics.",
  Amber:
    "Amber Studio partners with brands to produce bold visual identities, campaign systems, and launch-ready creative assets.",
  Probe:
    "Probe provides developer infrastructure for teams that need fast observability, deployment guardrails, and production confidence.",
  "Rowan X":
    "Rowan X is a brand studio helping founders shape distinctive positioning, narrative, and design systems for digital products.",
  Elrune:
    "Elrune designs luxury interiors for residential and hospitality projects with a focus on material craft and spatial storytelling.",
  Clipzy:
    "Clipzy is a video agency helping startups produce short-form content optimized for social distribution and conversion.",
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [activeNav, setActiveNav] = useState("Discover");
  const navRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const accountEmail = user?.email ?? "account@calc.app";
  const accountName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    accountEmail.split("@")[0] ||
    "Calc user";
  const accountAvatar =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined);
  const accountInitials = accountName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setIsAccountOpen(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAccountOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountOpen]);

  useEffect(() => {
    document.body.classList.toggle("sheet-open", isSheetOpen);

    return () => {
      document.body.classList.remove("sheet-open");
    };
  }, [isSheetOpen]);

  const openStartup = useCallback(
    (startup: Startup) => {
      setSelectedStartup(startup);

      if (!user) {
        router.push(`/login?startup=${encodeURIComponent(startup.name)}`);
        return;
      }

      setIsSheetOpen(true);
    },
    [router, user],
  );

  const goToAccountStep = useCallback(
    (href: string) => {
      setIsAccountOpen(false);
      router.push(href);
    },
    [router],
  );

  const handleSignOut = useCallback(async () => {
    setIsAccountOpen(false);
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const handleNavClick = useCallback((label: string) => {
    if (label === activeNav) return;
    setActiveNav(label);
  }, [activeNav]);

  // Slide the pill to the active nav item
  useEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;
    const activeEl = nav.querySelector<HTMLElement>("[data-nav-active='true']");
    if (!activeEl) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    pill.style.width = `${itemRect.width}px`;
    pill.style.transform = `translateX(${itemRect.left - navRect.left}px)`;
  }, [activeNav]);

  return (
    <>
      <main className="page">
        <header className="top-nav">
          <a className="brand" href="#" aria-label="Calc home">
            <img src="/assets/calc-logo.png" alt="Calc logo" />
          </a>

          <nav className="main-links" aria-label="Main navigation" ref={navRef}>
            <div className="main-links-pill" ref={pillRef} aria-hidden="true" />
            {(["Discover", "Categories", "Founders", "Submit"] as const).map((label) => (
              <a
                key={label}
                href="#"
                data-nav-active={activeNav === label ? "true" : undefined}
                className={activeNav === label ? "active" : ""}
                aria-current={activeNav === label ? "page" : undefined}
                onClick={(e) => { e.preventDefault(); handleNavClick(label); }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              className="submit-startup"
              type="button"
              onClick={() => {
                router.push(user ? "/onboarding" : "/login");
              }}
            >
              + Submit startup
            </button>
            {user && (
            <div className="account-menu-wrap" ref={accountMenuRef}>
              <button
                className="avatar-circle is-logged-in"
                type="button"
                aria-label="Abrir menu da conta"
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
                onClick={() => setIsAccountOpen((current) => !current)}
              >
                {accountAvatar ? (
                  <img src={accountAvatar} alt="" />
                ) : (
                  <span>{accountInitials || "C"}</span>
                )}
              </button>

              {user && (
                <div className={`account-menu${isAccountOpen ? " is-open" : ""}`} role="menu">
                  <div className="account-menu-card">
                    <div className="account-menu-profile">
                      <div className="account-menu-copy">
                        <strong>{accountName}</strong>
                        <span>{accountEmail}</span>
                      </div>
                      <button
                        className="account-menu-avatar"
                        type="button"
                        aria-label="Abrir perfil"
                        onClick={() => goToAccountStep("/profile-setup")}
                      >
                        {accountAvatar ? <img src={accountAvatar} alt="" /> : <span>{accountInitials || "C"}</span>}
                      </button>
                    </div>

                    <button className="account-menu-item is-active" type="button" role="menuitem" onClick={() => goToAccountStep("/profile")}>
                      <span className="account-menu-icon account-menu-icon-verified" aria-hidden="true"></span>
                      Profile
                    </button>
                    <button className="account-menu-item" type="button" role="menuitem" onClick={() => goToAccountStep("/onboarding")}>
                      <span className="account-menu-icon account-menu-icon-community" aria-hidden="true"></span>
                      Community
                      <em>+</em>
                    </button>
                    <button className="account-menu-item" type="button" role="menuitem">
                      <span className="account-menu-icon account-menu-icon-card" aria-hidden="true"></span>
                      Subscription
                      <b>PRO</b>
                    </button>
                    <button className="account-menu-item" type="button" role="menuitem" onClick={() => goToAccountStep("/profile-setup")}>
                      <span className="account-menu-icon account-menu-icon-toggle" aria-hidden="true"></span>
                      Settings
                    </button>

                    <div className="account-menu-divider"></div>

                    <button className="account-menu-item" type="button" role="menuitem">
                      <span className="account-menu-icon account-menu-icon-info" aria-hidden="true"></span>
                      Help center
                    </button>
                    <button className="account-menu-item" type="button" role="menuitem" onClick={handleSignOut}>
                      <span className="account-menu-icon account-menu-icon-signout" aria-hidden="true"></span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </header>

        <section className="hero" aria-label="Calc discovery hero">
          <h1>
            Startup discovery for founders,
            <br />
            operators, and curious builders
          </h1>
          <p>
            Explore curated products, market signals, revenue notes,
            <br />
            and internet businesses worth studying.
          </p>

          <form className="hero-search">
            <label htmlFor="site-search">Search products</label>
            <span>&#8981;</span>
            <input id="site-search" type="search" placeholder="Search..." />
          </form>
        </section>

        <section className="categories" aria-label="Market signals">
          <div className="news-grid">
            <article className="news-card">
              <div className="news-media media-ai">
                <div className="media-window">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <strong>Workflow OS</strong>
                <em>Operator tools with live adoption data</em>
              </div>
              <div className="news-content">
                <span className="news-label">Market signal</span>
                <h3>AI workflow startups are moving from chatbots to operating systems.</h3>
                <p>Founders are packaging agents around repeatable work, not generic prompts.</p>
                <div className="news-source">
                  <span className="source-icon">C</span>
                  <div>
                    <strong>Calc Briefing</strong>
                    <span>Analysis · 6 min read</span>
                  </div>
                </div>
              </div>
            </article>

            <article className="news-card">
              <div className="news-media media-funding">
                <div className="media-chart">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <strong>$21.5k MRR</strong>
                <em>Revenue-led products are standing out</em>
              </div>
              <div className="news-content">
                <span className="news-label">Funding</span>
                <h3>Vertical SaaS tools with revenue proof are attracting quieter rounds.</h3>
                <p>Investors are tracking MRR, retention, and distribution before broad hype.</p>
                <div className="news-source">
                  <span className="source-icon">F</span>
                  <div>
                    <strong>Founder Ledger</strong>
                    <span>Startups · 4 min read</span>
                  </div>
                </div>
              </div>
            </article>

            <article className="news-card">
              <div className="news-media media-social">
                <div className="tweet-card">
                  <span>@maya_founder</span>
                  <p>Discovery is becoming social again. The best tools now spread through operators.</p>
                </div>
              </div>
              <div className="news-content">
                <span className="news-label">Launches</span>
                <h3>Founder-led marketplaces are becoming the new product discovery layer.</h3>
                <p>Communities are curating tools by trust, use case, and operator context.</p>
                <div className="news-source">
                  <span className="source-icon">X</span>
                  <div>
                    <strong>Post on X</strong>
                    <span>Discovery · 5 min read</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="catalog" aria-label="Startup catalog">
          <div className="catalog-toolbar">
            <div className="filter-group">
              <button className="chip" type="button">
                Pricing <span aria-hidden="true">&#9662;</span>
              </button>
              <button className="chip" type="button">
                Styles <span aria-hidden="true">&#9662;</span>
              </button>
              <button className="chip" type="button">
                Features <span aria-hidden="true">&#9662;</span>
              </button>
            </div>
            <div className="filter-group">
              <button className="chip" type="button">
                Popular <span aria-hidden="true">&#9662;</span>
              </button>
              <button className="chip" type="button">
                Last Week <span aria-hidden="true">&#9662;</span>
              </button>
            </div>
          </div>

          <div className="catalog-grid">
            {startups.map((startup) => (
              <StartupCard
                key={startup.name}
                startup={startup}
                onOpen={() => openStartup(startup)}
              />
            ))}
          </div>
        </section>
      </main>

      {selectedStartup && (
        <div
          className={`detail-overlay${isSheetOpen ? " is-open" : ""}`}
          aria-hidden={!isSheetOpen}
          onClick={() => setIsSheetOpen(false)}
        >
          <section
            className="detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true"></div>

            <div className="sheet-topbar">
              <div className="sheet-identity">
                <div className="sheet-logo">{selectedStartup.name.charAt(0)}</div>
                <div>
                  <div className="sheet-title-row">
                    <h2 id="detail-title">{selectedStartup.name}</h2>
                    <span>{selectedStartup.spec}</span>
                  </div>
                  <div className="founder-line">
                    <div className="founder-avatar" aria-hidden="true"></div>
                    <span>Founder profile</span>
                  </div>
                </div>
              </div>

              <div className="sheet-actions">
                <button
                  className="sheet-icon-button"
                  type="button"
                  aria-label={`Save ${selectedStartup.name}`}
                >
                  <BookmarkIcon />
                </button>
                <button
                  className="sheet-icon-button"
                  type="button"
                  aria-label={`Like ${selectedStartup.name}`}
                >
                  <LightningIcon />
                </button>
              </div>
            </div>

            <div className="sheet-content">
              <div className="sheet-metric">
                <span>MRR</span>
                <strong>{selectedStartup.mrr}</strong>
              </div>

              <p>{startupDescriptions[selectedStartup.name]}</p>

              <div className="sheet-tags" aria-label="Startup tags">
                <span>Organic discovery</span>
                <span>B2B marketplace</span>
                <span>Rising launch signal</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
