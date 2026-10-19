import { PublicPage, FeatureGrid, CTA } from "@/components/public-page";
import { GitHubActivity } from "@/components/github-activity";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { prisma } from "@/lib/prisma";
import { ShieldCheck } from "lucide-react";
import { T } from "@/components/language-provider";

export const dynamic = "force-dynamic";

export default async function Portfolio() {
  // Fetch configured studio settings and gallery items
  let settings: Awaited<ReturnType<typeof prisma.studioSettings.findUnique>> = null;
  let galleryItems: Awaited<ReturnType<typeof prisma.galleryItem.findMany>> = [];
  try {
    [settings, galleryItems] = await Promise.all([
      prisma.studioSettings.findUnique({
        where: { id: "default" },
      }),
      prisma.galleryItem.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);
  } catch (err) {
    console.warn("[Portfolio Page] Could not load portfolio settings/gallery:", err);
  }

  const defaultUser = settings?.githubUser || "blank-ui";

  return (
    <PublicPage
      eyebrow={<T k="portfolio_page.eyebrow" fallback="Selected work · A few ways we help" />}
      title={<T k="portfolio_page.title" fallback="Made with intent." />}
      subtitle={<T k="portfolio_page.subtitle" fallback="Every project begins with a distinct business challenge. We bring care to the architecture, precision to the design, and keep outcomes grounded in what matters to the people using it." />}
    >
      <div style={{ display: "grid", gap: 36 }}>
        {/* Transparency Note Banner */}
        <div
          className="card card-hover-glow"
          style={{
            padding: "clamp(20px, 4vw, 28px) clamp(16px, 4vw, 32px)",
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
              <ShieldCheck size={14} /> <T k="portfolio.verified_eyebrow" fallback="Verified Studio Work" />
            </div>
            <h3 style={{ fontSize: 18, letterSpacing: "-.03em", margin: "8px 0 6px", color: "var(--ink)", fontWeight: 700 }}>
              <T k="portfolio.verified_title" fallback="Authentic projects and verified builds" />
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              <T k="portfolio.verified_desc" fallback="Our portfolio grows as we ship and receive explicit permission to share client work. We never invent fictitious case studies or violate client non-disclosure agreements. Explore our verified builds, design mockups, and open-source engineering below." />
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
              {galleryItems.length} <T k="portfolio.gallery_mockups" fallback="Gallery Mockups" />
            </span>
          </div>
        </div>

        {/* Selected Work Domains */}
        <FeatureGrid
          items={[
            {
              title: <T k="portfolio.domain1_title" fallback="Commerce & High Conversion" />,
              text: <T k="portfolio.domain1_desc" fallback="A considered path from product discovery to confident checkout, reducing cognitive friction at every customer step." />,
            },
            {
              title: <T k="portfolio.domain2_title" fallback="Operations & CRM Systems" />,
              text: <T k="portfolio.domain2_desc" fallback="Focused internal dashboard concepts that synthesize fragmented data streams into one actionable workspace." />,
            },
            {
              title: <T k="portfolio.domain3_title" fallback="Brand-Led Digital Homes" />,
              text: <T k="portfolio.domain3_desc" fallback="High-craft launch experiences engineered to help emerging brands establish authority and win ideal clients." />,
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
          title={<T k="portfolio.cta_title" fallback="Interested in building something similar?" />}
          subtitle={<T k="portfolio.cta_subtitle" fallback="Let's discuss requirements and draft a proposal." />}
        />
      </div>
    </PublicPage>
  );
}
