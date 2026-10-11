import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { NovaMark, AnimatedNovaMascot } from "@/components/brand";

const services = [
  {
    n: "01",
    title: "Digital experiences",
    text: "Brand-led websites that turn a first impression into a lasting one.",
  },
  {
    n: "02",
    title: "Products & platforms",
    text: "Purpose-built applications shaped around how your people really work.",
  },
  {
    n: "03",
    title: "Systems & growth",
    text: "Connected tools, clear data, and thoughtful improvements that compound.",
  },
];

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section */}
        <section
          className="grid-paper"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "98px 0 84px",
            minHeight: 630,
          }}
        >
          {/* Floating Ambient Orb */}
          <div
            className="orb orb-float"
            style={{
              width: 570,
              height: 570,
              background: "var(--orb-gradient)",
              top: 40,
              right: "-4%",
            }}
          />

          <div className="shell animate-fade-in-up" style={{ position: "relative", zIndex: 1 }}>
            <div className="eyebrow" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="radar-dot" style={{ width: 7, height: 7 }} />
              Independent digital studio · India & everywhere
            </div>

            <h1
              style={{
                fontSize: "clamp(58px, 8.6vw, 112px)",
                lineHeight: 0.98,
                letterSpacing: "-.085em",
                fontWeight: 600,
                maxWidth: 930,
                margin: "30px 0 25px",
              }}
            >
              Digital, <span style={{ color: "#8992a3", fontWeight: 400 }}>considered.</span>
              <br />
              Built for{" "}
              <span style={{ position: "relative", display: "inline-block", color: "var(--blue)" }}>
                what&apos;s next.
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -9,
                    height: 3,
                    background: "#aeb5ff",
                    borderRadius: 3,
                  }}
                />
              </span>
            </h1>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: 26,
                flexWrap: "wrap",
                marginTop: 36,
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "var(--muted)",
                  maxWidth: 420,
                  margin: 0,
                }}
              >
                We partner with ambitious teams to make their next digital move feel clear, considered, and a little bit different.
              </p>

              <div style={{ display: "flex", gap: 11, flexWrap: "wrap" }}>
                <Link className="button" href="/contact">
                  Start a project <ArrowUpRight size={16} />
                </Link>
                <Link className="button button-outline" href="/portfolio">
                  Explore our work <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 75, color: "var(--muted)" }}>
              <span className="mono" style={{ fontSize: 10 }}>
                SCROLL TO EXPLORE
              </span>
              <ArrowDown size={13} />
              <span style={{ height: 1, background: "var(--line)", width: 80, marginLeft: 9 }} />
            </div>
          </div>

          {/* Interactive Feature Glass Card */}
          <div className="shell" style={{ position: "relative", marginTop: -7 }}>
            <div
              className="glass"
              style={{
                borderRadius: 24,
                padding: 16,
                display: "grid",
                gridTemplateColumns: "1.1fr .9fr",
                gap: 14,
                transform: "rotate(-.4deg)",
              }}
            >
              <div
                style={{
                  minHeight: 270,
                  borderRadius: 17,
                  background: "linear-gradient(135deg,#101322,#1d2238)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="eyebrow" style={{ color: "#FFB547" }}>
                    Meet Nova · Studio Mascot
                  </div>
                  <div
                    style={{
                      background: "rgba(108,76,255,.25)",
                      border: "1px solid rgba(103,232,249,.4)",
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      color: "#67E8F9",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    ships @ light speed
                  </div>
                </div>

                <div style={{ position: "absolute", right: 16, bottom: 6, opacity: 0.95 }}>
                  <AnimatedNovaMascot size={210} />
                </div>

                <div style={{ maxWidth: 280, position: "relative", zIndex: 2 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.05em", lineHeight: 1.15 }}>
                    Soft to look at.<br />
                    <span style={{ color: "#FFB547" }}>Serious about code.</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#a6adbd", lineHeight: 1.6, margin: "10px 0 0" }}>
                    Bespoke web development, clean modern architecture, and thoughtful craft. Click Nova to say hi!
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <div
                  style={{
                    borderRadius: 17,
                    background: "var(--lav)",
                    padding: 22,
                    position: "relative",
                    overflow: "hidden",
                    minHeight: 125,
                    border: "1px solid var(--line)",
                  }}
                >
                  <div className="eyebrow" style={{ color: "var(--blue)" }}>
                    Web Development Studio
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.05em", marginTop: 14, color: "var(--ink)" }}>
                    Less noise.<br />
                    More meaning.
                  </div>
                  <div style={{ position: "absolute", right: 20, top: 28 }}>
                    <NovaMark size={46} starColor="#6C4CFF" dotColor="#FFB547" />
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 17,
                    background: "#101322",
                    color: "white",
                    padding: 22,
                    position: "relative",
                    minHeight: 130,
                    overflow: "hidden",
                  }}
                >
                  <div className="eyebrow" style={{ color: "#67E8F9" }}>
                    From first thought to launch
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.04em", marginTop: 14 }}>
                    Made to move<br />
                    your business forward.
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: 16,
                      bottom: -40,
                      width: 130,
                      height: 130,
                      borderRadius: "50%",
                      border: "1px solid #6C4CFF",
                      boxShadow: "0 0 0 15px #ffffff09,0 0 0 35px #ffffff08",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services / Capabilities Section */}
        <section className="shell" style={{ padding: "98px 0 30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 34,
            }}
          >
            <div>
              <div className="eyebrow">What we bring to the table</div>
              <h2
                style={{
                  fontSize: "clamp(36px,5vw,58px)",
                  letterSpacing: "-.07em",
                  lineHeight: 1.08,
                  fontWeight: 600,
                  margin: "15px 0 0",
                }}
              >
                Good work, with<br />
                a reason behind it.
              </h2>
            </div>
            <Link href="/services" className="nav-link" style={{ fontWeight: 600 }}>
              All capabilities <ArrowUpRight size={14} style={{ display: "inline" }} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 16,
            }}
          >
            {services.map((s) => (
              <Link
                key={s.n}
                href="/services"
                className="card card-hover-glow"
                style={{
                  padding: 26,
                  minHeight: 215,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div className="eyebrow">{s.n} / Capability</div>
                  <h3 style={{ fontSize: 21, letterSpacing: "-.05em", margin: "26px 0 9px", color: "var(--ink)" }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)", margin: 0 }}>
                    {s.text}
                  </p>
                </div>
                <MoveUpRight size={16} style={{ color: "var(--blue)", marginTop: 20 }} />
              </Link>
            ))}
          </div>
        </section>

        {/* Call to Action Banner */}
        <section
          style={{
            marginTop: 100,
            padding: "78px 0",
            background: "var(--banner-bg)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            className="shell"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 35,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="eyebrow">A good place to begin</div>
              <h2
                style={{
                  fontSize: "clamp(36px, 6vw, 67px)",
                  letterSpacing: "-.075em",
                  lineHeight: 1.02,
                  margin: "15px 0",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                Have a big idea?<br />
                <span style={{ color: "var(--muted)" }}>Let&apos;s make it real.</span>
              </h2>
            </div>
            <Link className="button" href="/contact">
              Tell us about it <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
