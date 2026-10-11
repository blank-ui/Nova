import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AnimatedNovaMascot } from "@/components/brand";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main style={{ minHeight: "calc(100vh - 76px - 260px)", display: "grid", placeItems: "center", padding: "60px 0" }}>
        <div className="shell" style={{ textAlign: "center", maxWidth: 540 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <AnimatedNovaMascot size={190} />
          </div>
          <div className="eyebrow" style={{ color: "var(--amber, #FFB547)" }}>
            Error 404 · Lost in Space
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)", letterSpacing: "-.06em", margin: "14px 0 10px", fontWeight: 700 }}>
            Page not found.
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8, margin: "0 0 28px" }}>
            Nova flew around at light speed, but couldn&apos;t track down this destination. Let&apos;s get you back on course.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="button">
              <ArrowLeft size={15} /> Return Home
            </Link>
            <Link href="/contact" className="button button-outline">
              Contact Studio <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
