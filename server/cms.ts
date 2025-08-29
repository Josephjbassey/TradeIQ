import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

type CMSData = Record<string, any> & {
  pages?: Record<string, any>;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.resolve(__dirname, "cms-data.json");

function ensureFile() {
  if (!fs.existsSync(dataFile)) {
  const initial: CMSData = {
      pricing: {
        headline: "Simple, transparent pricing",
        subheadline: "Start free. Upgrade when you're ready.",
        plans: [
          {
            id: "free",
            name: "Free",
            price: 0,
            period: "mo",
            features: [
              "Up to 50 trades/month",
              "Basic analytics",
              "Manual trade entry",
              "Community access",
            ],
            cta: "Get started",
            popular: false,
          },
          {
            id: "pro",
            name: "Pro",
            price: 19,
            period: "mo",
            features: [
              "Unlimited trades",
              "Advanced analytics",
              "AI insights",
              "Broker integrations",
              "Priority support",
            ],
            cta: "Start 14‑day trial",
            popular: true,
          },
          {
            id: "team",
            name: "Team",
            price: 49,
            period: "mo",
            features: [
              "Up to 5 users",
              "Shared dashboards",
              "Copy trading tools",
              "Admin controls",
              "SLA support",
            ],
            cta: "Contact sales",
            popular: false,
          },
        ],
        faqs: [
          { q: "Can I try Pro for free?", a: "Yes, we offer a 14‑day free trial. Cancel anytime." },
          { q: "Do you offer discounts?", a: "Annual plans include a 20% discount." },
        ],
      },
      landing: {
        hero: {
          title: "Master Your Trading Journey",
          subtitle: "AI-powered insights, social trading, and portfolio analytics in one platform.",
          primaryCta: { label: "Start Free Trial", href: "/auth/signup" },
          secondaryCta: { label: "View Demo", href: "/dashboard" },
        },
      },
      education: {
        recommendations: [
          { id: "risk", title: "Risk Management Basics", body: "Learn proper position sizing and risk-to-reward ratios." },
          { id: "technical", title: "Technical Analysis", body: "Master chart patterns and technical indicators." },
          { id: "psychology", title: "Psychology of Trading", body: "Develop mental strategies for consistent performance." },
        ],
      },
      pages: {
        security: { title: "Security", body: "Your data is encrypted in transit and at rest. We follow industry best practices." },
        help: { title: "Help Center", body: "Browse FAQs or reach out to support for assistance." },
        contact: { title: "Contact Us", body: "Email support@tradeiq.example or use the contact form." },
        community: { title: "Community", body: "Join discussions and learn from other traders." },
        docs: { title: "API Docs", body: "Explore our REST API and Webhooks.", sections: [] },
      },
    };
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), "utf-8");
  }
}

export function readCMS(): CMSData {
  ensureFile();
  const raw = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(raw);
}

export function writeCMS(data: CMSData) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
}

export function getSection<T = any>(key: string): T | null {
  const all = readCMS();
  return (all[key] as T) ?? null;
}

export function setSection(key: string, value: any) {
  const all = readCMS();
  all[key] = value;
  writeCMS(all);
  return all[key];
}

export function getPage<T = any>(slug: string): T | null {
  const all = readCMS();
  return (all.pages && all.pages[slug]) || null;
}

export function setPage(slug: string, value: any) {
  const all = readCMS();
  all.pages = all.pages || {};
  all.pages[slug] = value;
  writeCMS(all);
  return all.pages[slug];
}
