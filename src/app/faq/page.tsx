import Link from "next/link";
import { PublicPage, CTA } from "@/components/public-page";
import { ArrowUpRight } from "lucide-react";

interface FAQItem {
  category: string;
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  // 1. General & Scoping
  {
    category: "General & Scoping",
    q: "What types of projects does Nova take on?",
    a: "We specialize in brand-led marketing websites, custom full-stack web applications, operational internal tools, client portals, and CRM dashboards. Our sweet spot is ambitious teams that value high visual craft paired with serious software engineering.",
  },
  {
    category: "General & Scoping",
    q: "How does a typical project kick off?",
    a: "It starts with an initial inquiry via our contact page. Within 24 business hours, we schedule a 30-minute scoping discussion to map your requirements, constraints, and success criteria. From there, we provide a detailed written proposal with fixed milestone deliverables.",
  },
  {
    category: "General & Scoping",
    q: "How long does a typical build take?",
    a: "A marketing website or brand experience typically takes 2–4 weeks. A custom web application, client portal, or internal CRM dashboard generally spans 4–8 weeks depending on the complexity of integrations and role permissions.",
  },

  // 2. Pricing & Contracts
  {
    category: "Pricing & Contracts",
    q: "How is pricing structured?",
    a: "We work primarily on fixed-scope milestone contracts. Before any code is authored, you receive an itemized proposal detailing deliverables, schedule, and cost. There are no hidden fees or surprise billings. Ongoing care and maintenance are available via dedicated monthly retainers.",
  },
  {
    category: "Pricing & Contracts",
    q: "Who is the contracting legal entity?",
    a: "Nova is operated on behalf of All Sky Fares LLC. All contracts, invoices, non-disclosure agreements (NDAs), and payments are processed under All Sky Fares LLC (contact email: nova@allskyfares.com).",
  },
  {
    category: "Pricing & Contracts",
    q: "What payment methods and currencies do you accept?",
    a: "We accept payments via corporate bank transfers (ACH/Wire in USD, EUR, GBP), UPI and NEFT in INR, as well as major international credit cards.",
  },

  // 3. Technical & Ownership
  {
    category: "Technical & Code Ownership",
    q: "Do we own the code and intellectual property?",
    a: "Yes, 100%. Upon completion of milestone payments, the entire Git repository, Figma design assets, databases, and deployment keys are transferred directly to your organization. We never enforce proprietary vendor lock-in.",
  },
  {
    category: "Technical & Code Ownership",
    q: "What technology stack do you build with?",
    a: "We author clean, type-safe software using Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM, and MySQL/PostgreSQL databases. Every system is built for 100% Core Web Vitals and edge caching.",
  },
  {
    category: "Technical & Code Ownership",
    q: "Can you collaborate with our in-house engineering team?",
    a: "Absolutely. We routinely integrate with internal engineering teams, adopting your existing Git workflows, CI/CD pipelines, and design tokens without stepping on toes.",
  },

  // 4. Support & Maintenance
  {
    category: "Support & SLA",
    q: "Do you offer post-launch support and maintenance?",
    a: "Yes. Every project includes a 30-day post-launch warranty period covering any bug fixes. After that, we offer monthly maintenance retainers covering security dependency updates, performance tuning, and direct founder SLA response.",
  },
  {
    category: "Support & SLA",
    q: "Where is Nova located?",
    a: "Nova is based in India with global collaboration across North America, Europe, and the Middle East. Most work is conducted asynchronously with transparent written sprint updates and scheduled video milestones.",
  },
];

export default function FAQ() {
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <PublicPage
      eyebrow="Frequently Asked Questions"
      title={<>Questions & answers<br />about working together.</>}
      subtitle="Everything you need to know about our studio process, contract terms, technology standards, and deliverables."
    >
      <div style={{ display: "grid", gap: 48, maxWidth: 900, margin: "0 auto" }}>
        {categories.map((cat) => (
          <div key={cat}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--blue)",
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: "1px solid var(--line)",
              }}
            >
              {cat}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {faqs
                .filter((f) => f.category === cat)
                .map((f) => (
                  <details
                    key={f.q}
                    className="card card-hover-glow"
                    style={{
                      padding: "20px 24px",
                      borderRadius: 14,
                      cursor: "pointer",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <summary
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        letterSpacing: "-.02em",
                        color: "var(--ink)",
                        listStyle: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{f.q}</span>
                      <span style={{ color: "var(--blue)", fontSize: 18, fontWeight: 700, marginLeft: 12 }}>
                        +
                      </span>
                    </summary>
                    <p
                      style={{
                        color: "var(--muted)",
                        lineHeight: 1.8,
                        fontSize: 14,
                        margin: "14px 0 0",
                        borderTop: "1px solid var(--line)",
                        paddingTop: 14,
                      }}
                    >
                      {f.a}
                    </p>
                  </details>
                ))}
            </div>
          </div>
        ))}

        {/* Direct Help Banner */}
        <div
          className="card"
          style={{
            padding: "32px 36px",
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
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>
              Have a specific question not covered here?
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
              Send an email directly to <strong>nova@allskyfares.com</strong> or submit an inquiry.
            </p>
          </div>
          <Link className="button" href="/contact" style={{ padding: "12px 20px", fontSize: 13 }}>
            Contact the team <ArrowUpRight size={14} />
          </Link>
        </div>

        <CTA
          title="Ready to talk about your project?"
          subtitle="Let's make the next step clear and simple."
        />
      </div>
    </PublicPage>
  );
}
