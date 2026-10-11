import { PublicPage, FeatureGrid, CTA } from "@/components/public-page";
import { GitHubActivity } from "@/components/github-activity";

export default function Portfolio() {
  return (
    <PublicPage
      eyebrow="Selected work · A few ways we help"
      title="Made with intent."
      subtitle="Every project begins with a different challenge. We bring care to the details and keep the outcome grounded in what matters to the people using it."
    >
      <div style={{ padding: 24, borderRadius: 18, background: "var(--paper)", border: "1px solid var(--line)", marginBottom: 28 }}>
        <div className="eyebrow">A note on our work</div>
        <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
          Our portfolio grows as we complete and receive permission to share client work. We never invent case studies or publish confidential project details. Explore our open-source and active engineering work directly from GitHub below.
        </p>
      </div>
      <FeatureGrid
        items={[
          {
            title: "Commerce, made clearer",
            text: "A considered path from product discovery to confident checkout, designed to reduce friction at every step.",
          },
          {
            title: "A better view of operations",
            text: "A focused internal dashboard concept that brings scattered information into one useful workspace.",
          },
          {
            title: "A digital home for a new idea",
            text: "A flexible launch experience to help an emerging brand explain its offer and invite the right conversations.",
          },
        ]}
      />
      <GitHubActivity defaultUser="anshu1008" />
      <CTA />
    </PublicPage>
  );
}

