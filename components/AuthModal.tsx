"use client";

import type { FormEvent, InputHTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { supabase } from "@/lib/supabase";

type SectionId = "required" | "profile" | "optional";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  startupName?: string;
};

function UserGearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="9.25" cy="9" r="3.25" />
      <path d="M3.75 20c0-3.1 2.9-5.6 6.5-5.6 1.4 0 2.8.4 3.9 1" strokeLinecap="round" />
      <circle cx="16.75" cy="16.25" r="2.35" />
      <path
        d="M16.75 12.85v1.05M16.75 18.6v1.05M13.35 16.25h1.05M19.1 16.25h1.05M14.55 14.05l.75.75M18.2 17.7l.75.75M14.55 18.45l.75-.75M18.2 14.8l.75-.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="11" r="2" />
      <path d="M14 10h5M14 14h5M6.5 15.5c.8-1.2 2-2 2.5-2s1.7.8 2.5 2" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="4" y="6.5" width="16" height="11" rx="2.2" />
      <path d="M5.5 8.2 12 12.6l6.5-4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="6.5" width="17" height="11.5" rx="2.2" />
      <path d="M3.5 10h17" strokeLinecap="round" />
      <path d="M7.5 14.5h4.5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 20c0-3 2.6-5.2 5.5-5.2s5.5 2.2 5.5 5.2" strokeLinecap="round" />
      <circle cx="17.4" cy="10" r="2.4" />
      <path d="M16 20c.3-1.8 1.8-3.2 3.8-3.2.5 0 1 .1 1.4.2" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function FeatherIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M19.5 4.5c-4.4.3-8.5 3-10.6 7.1-.9 1.7-1.4 3.7-1.4 5.8 0 .4 0 .8.1 1.1 2-.1 4-.6 5.8-1.5 4.2-2 6.8-6.1 7.1-10.5-.1-.6-.5-1.2-1-1.7-.5-.5-1.1-.8-1.7-.9Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18 14.5 11.5" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ up }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      style={{ transform: up ? "rotate(180deg)" : undefined, transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)" }}
    >
      <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" />
      </svg>
    ),
    email: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    lock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="3.5" width="8" height="17" rx="1.8" />
        <path d="M11 17.5h2" strokeLinecap="round" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 5.5v3M18 5.5v3M4 9.5h16" strokeLinecap="round" />
        <rect x="4" y="7.5" width="16" height="11" rx="2" />
      </svg>
    ),
    briefcase: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 11h18" strokeLinecap="round" />
      </svg>
    ),
    pin: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    ),
    gear: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3.1" />
        <path d="M12 2.8v2.1M12 19.1v2.1M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" strokeLinecap="round" />
      </svg>
    ),
    feather: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M19.5 4.5c-4.4.3-8.5 3-10.6 7.1-.9 1.7-1.4 3.7-1.4 5.8 0 .4 0 .8.1 1.1 2-.1 4-.6 5.8-1.5 4.2-2 6.8-6.1 7.1-10.5-.1-.6-.5-1.2-1-1.7-.5-.5-1.1-.8-1.7-.9Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 18 14.5 11.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return <span className="auth-field-icon">{icons[type]}</span>;
}

function AuthField({
  id,
  label,
  type,
  icon,
  value,
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  badgeText,
  badgeLabel,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  icon: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  badgeText?: string;
  badgeLabel?: string;
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`auth-field-row${focused ? " is-focused" : ""}`}>
      <FieldIcon type={icon} />
      <label className="auth-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-field-input-wrap">
        <div className={`auth-field-input-shell${focused ? " is-active" : ""}`}>
          <input
            ref={inputRef}
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {badgeText && (
            <span
              className="auth-field-detected-badge"
              aria-label={badgeLabel}
              title={badgeLabel}
            >
              {badgeText}
            </span>
          )}
          {focused && (
            <div className="auth-field-actions">
              {value && (
                <button
                  type="button"
                  className="auth-field-action"
                  aria-label={`Limpar ${label}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange("");
                    inputRef.current?.focus();
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                className="auth-field-action auth-field-action-confirm"
                aria-label={`Confirmar ${label}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.blur()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthSelectField({
  id,
  label,
  icon,
  value,
  placeholder,
  options,
  onChange,
}: {
  id: string;
  label: string;
  icon: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`auth-field-row${focused ? " is-focused" : ""}`}>
      <FieldIcon type={icon} />
      <label className="auth-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-field-input-wrap">
        <div className={`auth-field-input-shell${focused ? " is-active" : ""}`}>
          <select
            id={id}
            className={`auth-field-select${value ? "" : " is-placeholder"}`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

const europeanCountries = new Set([
  "PT",
  "ES",
  "FR",
  "DE",
  "IT",
  "GB",
  "IE",
  "NL",
  "BE",
  "CH",
  "AT",
  "SE",
  "NO",
  "DK",
  "FI",
  "PL",
  "RO",
  "CZ",
  "GR",
  "HU",
]);

const phoneCountryLabels: Record<string, string> = {
  US: "Estados Unidos",
  CA: "Canada",
  BR: "Brasil",
  PT: "Portugal",
  ES: "Espanha",
  FR: "Franca",
  DE: "Alemanha",
  IT: "Italia",
  GB: "Reino Unido",
  IE: "Irlanda",
  NL: "Holanda",
  BE: "Belgica",
  CH: "Suica",
  AT: "Austria",
  SE: "Suecia",
  NO: "Noruega",
  DK: "Dinamarca",
  FI: "Finlandia",
  PL: "Polonia",
  RO: "Romania",
  CZ: "Republica Tcheca",
  GR: "Grecia",
  HU: "Hungria",
  MX: "Mexico",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
};

function detectPhoneCountry(phone: string) {
  const value = phone.trim();

  if (!value) return null;

  const digits = value.replace(/\D/g, "");
  const normalizedInternational = value.replace(/^00/, "+");

  const buildResult = (country: string) => {
    const label = phoneCountryLabels[country] ?? country;

    if (europeanCountries.has(country)) {
      return {
        code: country,
        label,
        description: `${label} (Europa)`,
      };
    }

    return {
      code: country,
      label,
      description: label,
    };
  };

  if (normalizedInternational.startsWith("+")) {
    const parsed = parsePhoneNumberFromString(normalizedInternational);

    if (parsed?.country) {
      return buildResult(parsed.country);
    }
  }

  if (digits.length >= 11) {
    const parsed = parsePhoneNumberFromString(`+${digits}`);

    if (parsed?.country) {
      return buildResult(parsed.country);
    }
  }

  const unitedStatesPattern = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const brazilPattern = /^\(?\d{2}\)?\s?\d{4,5}[\s.-]?\d{4}$/;

  if (brazilPattern.test(value) || /^\d{2}9\d{8}$/.test(digits) || /^\d{10,11}$/.test(digits) && value.startsWith("(") && /^\(\d{2}\)/.test(value)) {
    return buildResult("BR");
  }

  if (unitedStatesPattern.test(value) || digits.length === 10) {
    return {
      code: "US",
      label: "Estados Unidos",
      description: "Estados Unidos/Canada",
    };
  }

  if (/^(3\d|4\d)/.test(digits) && digits.length >= 10) {
    return {
      code: "EU",
      label: "Europa",
      description: "Europa",
    };
  }

  return null;
}

function getFlagEmoji(countryCode?: string) {
  if (!countryCode) return null;

  if (countryCode === "EU") {
    return "🇪🇺";
  }

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return null;
  }

  return String.fromCodePoint(
    ...countryCode
      .split("")
      .map((char) => 127397 + char.charCodeAt(0)),
  );
}

export default function AuthModal({ isOpen, onClose, onSuccess, startupName }: AuthModalProps) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState<SectionId | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerBirthDate, setRegisterBirthDate] = useState("");
  const [registerOccupation, setRegisterOccupation] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerAddress, setRegisterAddress] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerLanguage, setRegisterLanguage] = useState("");
  const [registerBio, setRegisterBio] = useState("");
  const [registerCompany, setRegisterCompany] = useState("");
  const [registerWebsite, setRegisterWebsite] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [paymentName, setPaymentName] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [paymentExpiry, setPaymentExpiry] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const createGeneratedPassword = () => `Calc!${Math.random().toString(36).slice(2, 10)}A1`;
  const hasValue = (value: string) => value.trim().length > 0;

  const formatBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setExpanded("required");
      setMessage("");
      setMessageType("");
      setRegisterPassword(createGeneratedPassword());
      document.body.classList.add("auth-open");
    } else {
      document.body.classList.remove("auth-open");
      const timer = setTimeout(() => setVisible(false), 420);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.classList.remove("auth-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const submitRegister = async () => {
    setLoading(true);
    setMessage("Criando conta...");
    setMessageType("");

    const { error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        data: {
          name: registerName,
          phone: registerPhone,
          phoneCountry: detectedPhoneCountry?.description ?? "",
          birthDate: registerBirthDate,
          occupation: registerOccupation,
          address: registerAddress,
          username: registerUsername,
          language: registerLanguage,
          bio: registerBio,
          company: registerCompany,
          website: registerWebsite,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      return;
    }

    setMessage("Conta criada! Verifique seu email para confirmar.");
    setMessageType("success");
  };

  const handleRegister = (event: FormEvent) => {
    event.preventDefault();
    handleProceed();
  };

  const requiredInProgress = [
    registerName,
    registerPhone,
    registerBirthDate,
    registerOccupation,
    registerEmail,
    registerAddress,
  ].some(hasValue);

  const profileInProgress = [registerUsername, registerLanguage].some(hasValue);
  const optionalInProgress = [registerBio, registerCompany, registerWebsite].some(hasValue);

  const requiredComplete = [
    registerName,
    registerPhone,
    registerBirthDate,
    registerOccupation,
    registerEmail,
    registerAddress,
  ].every(hasValue);

  const profileComplete = [registerUsername, registerLanguage].every(hasValue);
  const optionalComplete = [registerBio, registerCompany, registerWebsite].every(hasValue);
  const detectedPhoneCountry = detectPhoneCountry(registerPhone);
  const detectedPhoneFlag = getFlagEmoji(detectedPhoneCountry?.code);
  const completedCount = [requiredComplete, profileComplete, optionalComplete].filter(Boolean).length;
  const onboardingProgress = Math.round((completedCount / 3) * 100);

  const handleProceed = () => {
    if (!expanded) {
      setExpanded("required");
      return;
    }

    if (expanded === "required" && !requiredComplete) {
      setExpanded("required");
      setMessage("Provide required information.");
      setMessageType("error");
      return;
    }

    if (expanded === "required") {
      setMessage("");
      setMessageType("");
      setExpanded("profile");
      return;
    }

    if (expanded === "profile") {
      setMessage("");
      setMessageType("");
      setExpanded("optional");
      return;
    }

    setMessage("");
    setMessageType("");
    setExpanded(null);
    onSuccess();
  };

  if (!visible && !isOpen) return null;

  const subtitle = startupName
    ? `Complete simple steps to continue with ${startupName}.`
    : "Complete simple steps to get started.";

  return (
    <div
      className={`auth-overlay auth-flow-overlay auth-flow-overlay-register${isOpen ? " is-open" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <section
        className="auth-modal auth-flow-modal auth-flow-register auth-setup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-setup-panel">
          <header className="auth-setup-header">
            <span className="auth-setup-icon">
              <UserGearIcon />
            </span>
            <div className="auth-setup-header-copy">
              <h2 id="auth-modal-title">Account Setup</h2>
              <p>Complete simple steps to get started.</p>
            </div>
            <button className="auth-setup-close" type="button" aria-label="Fechar" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="auth-setup-content">
            <section className={`auth-setup-section${expanded === "required" ? " is-expanded" : ""}`}>
              <span className="auth-setup-section-icon">
                <IdCardIcon />
              </span>
              <div className="auth-setup-section-main">
                <button className="auth-setup-section-head" type="button" onClick={() => setExpanded((current) => (current === "required" ? null : "required"))}>
                  <span>
                    <strong>Required Information <i>i</i></strong>
                    <small>Provide required information.</small>
                  </span>
                  <em className="auth-setup-badge is-progress">In Progress</em>
                  <b className="auth-setup-chevron" aria-hidden="true">
                    <ChevronIcon up={expanded === "required"} />
                  </b>
                </button>

                {expanded === "required" && (
                  <div className="auth-setup-fields">
                    <label>
                      <FieldIcon type="user" />
                      <span>Full Name</span>
                      <input value={registerName} placeholder="Full Name" autoComplete="name" onChange={(event) => setRegisterName(event.target.value)} />
                    </label>
                    <label>
                      <FieldIcon type="phone" />
                      <span>Phone</span>
                      <input value={registerPhone} placeholder="(123) 456-7894" autoComplete="tel" onChange={(event) => setRegisterPhone(event.target.value)} />
                    </label>
                    <label>
                      <FieldIcon type="calendar" />
                      <span>Date of Birth</span>
                      <input value={registerBirthDate} placeholder="12/01/1999" inputMode="numeric" maxLength={10} onChange={(event) => setRegisterBirthDate(formatBirthDate(event.target.value))} />
                    </label>
                    <label>
                      <FieldIcon type="briefcase" />
                      <span>Occupation</span>
                      <input value={registerOccupation} placeholder="Occupation" autoComplete="organization-title" onChange={(event) => setRegisterOccupation(event.target.value)} />
                    </label>
                    <label>
                      <FieldIcon type="email" />
                      <span>Email</span>
                      <input value={registerEmail} placeholder="Enter email address..." autoComplete="email" onChange={(event) => setRegisterEmail(event.target.value)} />
                    </label>
                    <label>
                      <FieldIcon type="pin" />
                      <span>Address</span>
                      <input value={registerAddress} placeholder="Enter address..." autoComplete="street-address" onChange={(event) => setRegisterAddress(event.target.value)} />
                    </label>
                  </div>
                )}
              </div>
            </section>

            <section className={`auth-setup-section${expanded === "profile" ? " is-expanded" : ""}`}>
              <span className="auth-setup-section-icon">
                <GearIcon />
              </span>
              <div className="auth-setup-section-main">
                <button className="auth-setup-section-head" type="button" onClick={() => setExpanded((current) => (current === "profile" ? null : "profile"))}>
                  <span>
                    <strong>Profile Customization <i>i</i></strong>
                    <small>Provide information for profile customization.</small>
                  </span>
                  <em className="auth-setup-badge">Incomplete</em>
                  <b className="auth-setup-chevron" aria-hidden="true">
                    <ChevronIcon up={expanded === "profile"} />
                  </b>
                </button>

                {expanded === "profile" && (
                  <div className="auth-setup-fields">
                    <label>
                      <FieldIcon type="user" />
                      <span>Username</span>
                      <input value={registerUsername} placeholder="Enter username..." autoComplete="username" onChange={(event) => setRegisterUsername(event.target.value)} />
                    </label>
                    <label>
                      <FieldIcon type="gear" />
                      <span>Language</span>
                      <input value={registerLanguage} placeholder="English, Portuguese, Spanish..." onChange={(event) => setRegisterLanguage(event.target.value)} />
                    </label>
                  </div>
                )}
              </div>
            </section>

            <section className={`auth-setup-section${expanded === "optional" ? " is-expanded" : ""}`}>
              <span className="auth-setup-section-icon">
                <FeatherIcon />
              </span>
              <div className="auth-setup-section-main">
                <button className="auth-setup-section-head" type="button" onClick={() => setExpanded((current) => (current === "optional" ? null : "optional"))}>
                  <span>
                    <strong>Optional Information <i>i</i></strong>
                    <small>Provide optional information.</small>
                  </span>
                  <em className="auth-setup-badge">Incomplete</em>
                  <b className="auth-setup-chevron" aria-hidden="true">
                    <ChevronIcon up={expanded === "optional"} />
                  </b>
                </button>

                {expanded === "optional" && (
                  <div className="auth-setup-fields">
                    <label>
                      <FieldIcon type="feather" />
                      <span>Bio</span>
                      <input value={registerBio} placeholder="Write something about yourself..." onChange={(event) => setRegisterBio(event.target.value)} />
                    </label>
                    <label>
                      <FieldIcon type="briefcase" />
                      <span>Company</span>
                      <input value={registerCompany} placeholder="Enter company name..." onChange={(event) => setRegisterCompany(event.target.value)} />
                    </label>
                    <label>
                      <FieldIcon type="pin" />
                      <span>Website</span>
                      <input value={registerWebsite} placeholder="Enter website URL..." autoComplete="url" onChange={(event) => setRegisterWebsite(event.target.value)} />
                    </label>
                  </div>
                )}
              </div>
            </section>

            {message && (
              <p className={`auth-modal-message${messageType ? ` ${messageType}` : ""}`} role="status">
                {message}
              </p>
            )}
          </div>

          <footer className="auth-setup-footer">
            <button className="auth-setup-button auth-setup-button-secondary" type="button" onClick={onClose}>
              Skip
            </button>
            <button className="auth-setup-button auth-setup-button-primary" type="button" disabled={loading} onClick={handleProceed}>
              {loading ? "Please wait..." : "Proceed"}
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}
