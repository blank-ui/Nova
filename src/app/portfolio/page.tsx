import { PublicPage, FeatureGrid, CTA } from "@/components/public-page";
import { GitHubActivity } from "@/components/github-activity";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { prisma } from "@/lib/prisma";
import { ShieldCheck } from "lucide-react";

export default async function Portfolio() {
  // Fetch configured studio settings and gallery items
  const [settings, galleryItems] = await Promise.all([
    prisma.studioSettings.findUnique({
      where: { id: "default" },
    }),
    prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const defaultUser = settings?.githubUser || "blank-ui";

  return (
    <PublicPage
      eyebrow="Selected work · A few ways we help"
      title="Made with intent."
      subtitle="Every project begins with a distinct business challenge. We bring care to the architecture, precision to the design, and keep outcomes grounded in what matters to the people using it."
    >
      <div style={{ display: "grid", gap: 36 }}>
        {/* Transparency Note Banner */}
        <div
          className="card card-hover-glow"
          style={{
            padding: "28px 32px",
            borderRadius: 18,
            background: "var(--lav)",
            border: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <div className="eyebrow" style={{ color: "var(--blue)", display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={14} /> Verified Studio Work
            </div>
            <h3 style={{ fontSize: 18, letterSpacing: "-.03em", margin: "8px 0 6px", color: "var(--ink)", fontWeight: 700 }}>
              Authentic projects and verified builds
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Our portfolio grows as we ship and receive explicit permission to share client work. We never invent fictitious case studies or violate client non-disclosure agreements. Explore our verified builds, design mockups, and open-source engineering below.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: 99,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                color: "var(--blue)",
              }}
            >
              {galleryItems.length} Gallery Mockups
            </span>
          </div>
        </div>

        {/* Selected Work Domains */}
        <FeatureGrid
          items={[
            {
              title: "Commerce & High Conversion",
              text: "A considered path from product discovery to confident checkout, reducing cognitive friction at every customer step.",
            },
            {
              title: "Operations & CRM Systems",
              text: "Focused internal dashboard concepts that synthesize fragmented data streams into one actionable workspace.",
            },
            {
              title: "Brand-Led Digital Homes",
              text: "High-craft launch experiences engineered to help emerging brands establish authority and win ideal clients.",
            },
          ]}
        />

        {/* Screenshot & Design Mockup Gallery */}
        <ScreenshotGallery initialItems={galleryItems} />

        {/* GitHub Curated Activity & Repos */}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 40 }}>
          <GitHubActivity defaultUser={defaultUser} />
        </div>

        <CTA
          title="Interested in building something similar?"
          subtitle="Let's discuss requirements and draft a proposal."
        />
      </div>
    </PublicPage>
  );
}
