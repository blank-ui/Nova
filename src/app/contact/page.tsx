"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, AlertCircle, Clock, ShieldCheck, Mail, Sparkles } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { NovaMascotAvatar } from "@/components/brand";

const SERVICES = [
  "Website design & development",
  "Custom web application",
  "CRM or internal dashboard",
  "Redesign & performance",
  "Ongoing support",
  "Something else",
];

const BUDGETS = [
  "Under ₹1 lakh",
  "₹1–3 lakh",
  "₹3–8 lakh",
  "₹8 lakh+",
  "Still working it out",
];

export default function ContactPage() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [charCount, setCharCount] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not send your message.");
      }
      setState("success");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Please try again shortly.");
    }
  }

  return (
    <>
      <Navigation />
      <main>
        {/* Header Hero */}
        <section
          className="grid-paper"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "80px 0 54px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            className="orb"
            style={{
              width: 500,
              height: 500,
              background: "var(--orb-gradient)",
              top: -80,
              right: "-5%",
            }}
          />
          <div className="shell" style={{ position: "relative", zIndex: 1 }}>
            <div
              className="eyebrow"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14 }}
            >
              <Sparkles size={13} style={{ color: "var(--blue)" }} />
              Start a conversation
            </div>
            <h1
              style={{
                fontSize: "clamp(42px, 6.5vw, 76px)",
                lineHeight: 1.04,
                letterSpacing: "-0.075em",
                margin: "12px 0 20px",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              Tell us what<br />
              <span style={{ color: "var(--blue)" }}>you&apos;re imagining.</span>
            </h1>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 16,
                lineHeight: 1.8,
                maxWidth: 580,
                margin: 0,
              }}
            >
              A few details are enough to get started. We will review your goals with care,
              advise on architecture, and provide a concrete path forward.
            </p>
          </div>
        </section>

        {/* Main Content Layout */}
        <section
          className="shell contact-grid"
          style={{
            padding: "54px 0 90px",
          }}
        >
          {/* Form Card */}
          <div
            className="card contact-form-card"
            style={{
              padding: "clamp(24px, 4.5vw, 44px)",
              background: "var(--card-bg)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              boxShadow: "var(--glass-shadow)",
            }}
          >
            {state === "success" ? (
              <div
                style={{
                  padding: "60px 24px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10B981",
                  }}
                >
                  <CheckCircle2 size={38} />
                </div>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    margin: "8px 0 0",
                    color: "var(--ink)",
                  }}
                >
                  Thanks for reaching out!
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.7,
                    maxWidth: 440,
                    margin: 0,
                    fontSize: 14,
                  }}
                >
                  Your inquiry is directly with our engineering team at <strong>nova@allskyfares.com</strong>.
                  We review every project request thoroughly and reply within two business days.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setState("idle");
                    setSelectedService("");
                    setSelectedBudget("");
                    setCharCount(0);
                  }}
                  className="button button-outline"
                  style={{ marginTop: 18 }}
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "grid", gap: 24 }}>
                {/* Name & Email Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 18,
                  }}
                >
                  <div>
                    <label
                      htmlFor="contact-name"
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--ink)",
                        marginBottom: 8,
                      }}
                    >
                      Your name <span style={{ color: "var(--blue)" }}>*</span>
                    </label>
                    <input
                      id="contact-name"
                      className="field"
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      placeholder="Alex Morgan"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--ink)",
                        marginBottom: 8,
                      }}
                    >
                      Work email <span style={{ color: "var(--blue)" }}>*</span>
                    </label>
                    <input
                      id="contact-email"
                      className="field"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      placeholder="alex@company.com"
                    />
                  </div>
                </div>

                {/* Phone Number Row */}
                <div>
                  <label
                    htmlFor="contact-phone"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--ink)",
                      marginBottom: 8,
                    }}
                  >
                    Phone number <span style={{ color: "var(--blue)" }}>*</span>
                  </label>
                  <input
                    id="contact-phone"
                    className="field"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    minLength={7}
                    maxLength={30}
                    placeholder="+91 98765 43210"
                  />
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0" }}>
                    Include country code for international numbers.
                  </p>
                </div>

                {/* Company Row */}
                <div>
                  <label
                    htmlFor="contact-company"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--ink)",
                      marginBottom: 8,
                    }}
                  >
                    Company or Organization{" "}
                    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", marginLeft: 4 }}>
                      optional
                    </span>
                  </label>
                  <input
                    id="contact-company"
                    className="field"
                    name="company"
                    autoComplete="organization"
                    maxLength={120}
                    placeholder="Acme Studio / Self-funded"
                  />
                </div>

                {/* Service Selection Pills */}
                <div>
                  <label
                    htmlFor="contact-service-select"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--ink)",
                      marginBottom: 10,
                    }}
                  >
                    What do you need? <span style={{ color: "var(--blue)" }}>*</span>
                  </label>
                  {/* Quick Select Buttons */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {SERVICES.map((srv) => {
                      const isSelected = selectedService === srv;
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => setSelectedService(srv)}
                          style={{
                            padding: "7px 13px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 99,
                            cursor: "pointer",
                            transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                            transform: isSelected ? "scale(1.03)" : "scale(1)",
                            boxShadow: isSelected ? "0 3px 10px rgba(108, 76, 255, 0.28)" : "none",
                            border: isSelected ? "1px solid var(--blue)" : "1px solid var(--line)",
                            background: isSelected ? "var(--blue)" : "var(--paper)",
                            color: isSelected ? "#ffffff" : "var(--ink)",
                          }}
                        >
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                  {/* Accessible Select Fallback / Form input */}
                  <select
                    id="contact-service-select"
                    className="field"
                    name="service"
                    required
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    <option value="" disabled>
                      Or choose from list…
                    </option>
                    {SERVICES.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Selection Pills */}
                <div>
                  <label
                    htmlFor="contact-budget-select"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--ink)",
                      marginBottom: 10,
                    }}
                  >
                    Approximate budget{" "}
                    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", marginLeft: 4 }}>
                      optional
                    </span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {BUDGETS.map((bgt) => {
                      const isSelected = selectedBudget === bgt;
                      return (
                        <button
                          key={bgt}
                          type="button"
                          onClick={() => setSelectedBudget(isSelected ? "" : bgt)}
                          style={{
                            padding: "7px 13px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 99,
                            cursor: "pointer",
                            transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                            transform: isSelected ? "scale(1.03)" : "scale(1)",
                            boxShadow: isSelected ? "0 3px 10px rgba(108, 76, 255, 0.28)" : "none",
                            border: isSelected ? "1px solid var(--blue)" : "1px solid var(--line)",
                            background: isSelected ? "var(--blue)" : "var(--paper)",
                            color: isSelected ? "#ffffff" : "var(--ink)",
                          }}
                        >
                          {bgt}
                        </button>
                      );
                    })}
                  </div>
                  <select
                    id="contact-budget-select"
                    className="field"
                    name="budget"
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                  >
                    <option value="">Choose a range</option>
                    {BUDGETS.map((bgt) => (
                      <option key={bgt} value={bgt}>
                        {bgt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Details Message */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <label
                      htmlFor="contact-message"
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      A little about the project <span style={{ color: "var(--blue)" }}>*</span>
                    </label>
                    <span
                      style={{
                        fontSize: 11,
                        color: charCount < 20 ? "var(--muted)" : "var(--blue)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {charCount} / 5000 chars {charCount < 20 ? "(min 20)" : "✓"}
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    className="field"
                    name="message"
                    required
                    minLength={20}
                    maxLength={5000}
                    rows={5}
                    onChange={(e) => setCharCount(e.target.value.length)}
                    placeholder="What are your goals, key challenges, timeline, or must-haves for this project?"
                    style={{ resize: "vertical", minHeight: 130 }}
                  />
                </div>

                {/* Honeypot field for spam prevention */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}>
                  <label htmlFor="contact-website">
                    Website
                    <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                {/* Error Banner */}
                {state === "error" && (
                  <div
                    role="alert"
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#EF4444",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button & Legal Note */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="button"
                    style={{
                      justifySelf: "start",
                      alignSelf: "flex-start",
                      padding: "14px 28px",
                      fontSize: 14,
                      opacity: state === "sending" ? 0.7 : 1,
                      cursor: state === "sending" ? "wait" : "pointer",
                    }}
                  >
                    <span>{state === "sending" ? "Sending note…" : "Send your note"}</span>
                    <ArrowUpRight size={16} />
                  </button>

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    By submitting, you agree to our{" "}
                    <Link href="/privacy" style={{ color: "var(--blue)", textDecoration: "underline" }}>
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" style={{ color: "var(--blue)", textDecoration: "underline" }}>
                      Terms of Service
                    </Link>
                    . Information is processed on behalf of All Sky Fares LLC solely to evaluate and respond to your inquiry.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Aside Information */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 6 }}>
            {/* Context Card */}
            <div
              className="card card-hover-glow"
              style={{
                padding: 26,
                background: "var(--card-bg)",
                border: "1px solid var(--line)",
                borderRadius: 20,
              }}
            >
              <div
                className="eyebrow"
                style={{ color: "var(--blue)", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}
              >
                <Sparkles size={12} />
                A good next step
              </div>
              <h2
                style={{
                  fontSize: 22,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.25,
                  fontWeight: 700,
                  margin: "0 0 10px",
                  color: "var(--ink)",
                }}
              >
                Thoughtful answers, no hard sell.
              </h2>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: "var(--muted)",
                  margin: 0,
                }}
              >
                We review every project proposal directly. We will discuss feasibility, highlight risks early,
                and propose realistic architectural timelines.
              </p>
            </div>

            {/* Direct Email Card */}
            <div
              className="card card-hover-glow"
              style={{
                padding: 26,
                background: "var(--card-bg)",
                border: "1px solid var(--line)",
                borderRadius: 20,
              }}
            >
              <div
                className="eyebrow"
                style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}
              >
                <Mail size={12} style={{ color: "var(--blue)" }} />
                Direct Channel
              </div>
              <a
                href="mailto:nova@allskyfares.com"
                style={{
                  display: "inline-block",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--blue)",
                  letterSpacing: "-0.02em",
                  textDecoration: "none",
                }}
              >
                nova@allskyfares.com
              </a>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "var(--muted)",
                  marginTop: 8,
                }}
              >
                <Clock size={13} />
                <span>Typically replies within two business days.</span>
              </div>
            </div>

            {/* Discord Direct Channel Card */}
            <div
              className="card card-hover-glow"
              style={{
                padding: 26,
                background: "var(--card-bg)",
                border: "1px solid var(--line)",
                borderRadius: 20,
              }}
            >
              <div
                className="eyebrow"
                style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, color: "#5865F2" }}
              >
                <DiscordIcon size={14} />
                Discord Direct Message
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="https://discord.com/users/superr_nova_"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#5865F2",
                    letterSpacing: "-0.02em",
                    textDecoration: "none",
                  }}
                >
                  @superr_nova_ <ArrowUpRight size={14} />
                </a>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: "rgba(88, 101, 242, 0.12)",
                    color: "#5865F2",
                    border: "1px solid rgba(88, 101, 242, 0.25)",
                  }}
                >
                  Direct DM
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  margin: "8px 0 16px",
                  lineHeight: 1.6,
                }}
              >
                Prefer communicating directly on Discord? Send a 1-on-1 direct message to <strong style={{ color: "var(--ink)" }}>@superr_nova_</strong> for private project scoping and technical inquiries.
              </p>
              <div>
                <a
                  href="https://discord.com/users/superr_nova_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button"
                  style={{
                    padding: "9px 16px",
                    fontSize: 12,
                    background: "#5865F2",
                    borderColor: "#5865F2",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <DiscordIcon size={14} /> Send a DM (@superr_nova_) <ArrowUpRight size={13} />
                </a>
              </div>
            </div>

            {/* Privacy & Operator Info Card */}
            <div
              style={{
                padding: "20px 24px",
                borderRadius: 18,
                background: "var(--lav)",
                border: "1px solid var(--line)",
                display: "flex",
                gap: 14,
                alignItems: "center",
              }}
            >
              <NovaMascotAvatar size={38} />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ShieldCheck size={14} style={{ color: "var(--blue)" }} />
                  Zero-spam pledge
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    lineHeight: 1.5,
                    margin: "3px 0 0",
                  }}
                >
                  Operated on behalf of All Sky Fares LLC. Your contact information is never sold or shared with third parties.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.91,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}
