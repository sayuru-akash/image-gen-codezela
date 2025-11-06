import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { calculateReadTime, countWords } from "../lib/articleUtils.js";

dotenv.config({ path: ".env" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ Missing MONGODB_URI in environment variables.");
  process.exit(1);
}

const ARTICLES = [
  {
    slug: "creative-ops-blueprint",
    title: "Creative Operations Blueprint: Scaling Visuals with kAIro AI",
    excerpt:
      "Discover how in-house marketing teams use kAIro AI from Codezela Technologies to automate image requests, protect brand standards, and ship campaigns faster.",
    dateLabel: "March 4, 2025",
    readTime: "6 min read",
    author: "Codezela Content Team",
    heroImage: "/images/image-11.jpg",
    image1: "/images/image-11.jpg",
    image2: "/images/image-14.jpg",
    sections: [
      {
        heading: "Why creative operations need AI guardrails",
        paragraphs: [
          "Every modern campaign requires dozens of channel-specific visuals, making manual production expensive and slow. kAIro AI brings a governed approach to generative imagery: approved brand palettes, locked typography, and reusable prompt recipes that keep every asset on-message.",
          "By pairing kAIro AI with existing project-management workflows, marketing teams can brief Codezela Technologies once and reuse templates across markets without rebuilding from scratch.",
        ],
      },
      {
        heading: "Automating reviews without losing human oversight",
        paragraphs: [
          "Version control is built into kAIro AI. Stakeholders can comment on generated frames, request alternate crops, and compare before-and-after states directly inside the platform. Creative directors approve a variation once and the system propagates feedback to future prompts automatically.",
        ],
      },
      {
        heading: "Measuring impact across every channel",
        paragraphs: [
          "Because kAIro AI stores metadata alongside each generated asset, performance teams can track which prompts drive the highest click-through or conversion. Insights feed back into the prompt library, helping your next launch start at a higher baseline.",
        ],
      },
    ],
  },
  {
    slug: "personalised-campaigns",
    title: "Personalised Campaigns at Scale with kAIro AI",
    excerpt:
      "Use kAIro AI to create market-specific visuals, localised messaging, and seasonal refreshes without burning out your design squad.",
    dateLabel: "February 18, 2025",
    readTime: "5 min read",
    author: "Codezela Content Team",
    heroImage: "/images/image-2.jpg",
    image1: "/images/image-2.jpg",
    image2: "/images/image-18.jpg",
    sections: [
      {
        heading: "Local language, local emotion",
        paragraphs: [
          "kAIro AI can generate copy overlays and micro-art direction tuned for each geography. Provide translation guidelines once, and Codezela’s localisation heuristics adjust tone, colour, and cultural cues automatically.",
        ],
      },
      {
        heading: "Seasonal refresh in a single prompt",
        paragraphs: [
          "With prompt variables, brand managers can swap “spring capsule” for “holiday launch” and see kAIro AI reinterpret the same hero asset with new lighting, wardrobe, and supporting props—no new photoshoot required.",
        ],
      },
    ],
  },
  {
    slug: "ux-mockups-with-ai",
    title: "Designing Product Mockups with the kAIro AI Mask Editor",
    excerpt:
      "Learn how product designers use kAIro AI’s mask editor to test interface concepts, merchandising displays, and packaging prototypes in hours.",
    dateLabel: "January 29, 2025",
    readTime: "7 min read",
    author: "Codezela Content Team",
    heroImage: "/images/image-13.png",
    image1: "/images/image-13.png",
    image2: "/images/image-17.jpg",
    sections: [
      {
        heading: "Precision editing without restarting the render",
        paragraphs: [
          "The kAIro AI mask editor lets designers isolate product labels, backgrounds, and lighting with pixel-level accuracy. Adjust only the element you care about while the rest of the scene remains locked, speeding up approvals for industrial designers and merchandisers.",
        ],
      },
      {
        heading: "Prototype hero images straight from Figma",
        paragraphs: [
          "Export frames from your design tool, drop them into kAIro AI, and apply environmental storytelling around them. Codezela Technologies built an intelligent ingestion pipeline so you can preview packaging on shelves, devices in the wild, or UI concepts in their intended context.",
        ],
      },
    ],
  },
  {
    slug: "ai-governance-guide",
    title: "AI Governance Guide for Creative Leaders",
    excerpt:
      "Practical steps for CMOs and creative directors to deploy kAIro AI responsibly, authored by Codezela Technologies’ strategy team.",
    dateLabel: "January 10, 2025",
    readTime: "8 min read",
    author: "Codezela Content Team",
    heroImage: "/images/image-12.jpg",
    image1: "/images/image-12.jpg",
    image2: "/images/image-19.jpg",
    sections: [
      {
        heading: "Set the policies before you generate",
        paragraphs: [
          "Start with brand safety, data privacy, and accessibility guidelines. kAIro AI lets you codify these rules into prompt templates and asset controls so creators operate within a safe sandbox.",
        ],
      },
      {
        heading: "Train teams to think in prompts",
        paragraphs: [
          "Provide prompt playbooks, office hours, and example galleries. When everyone shares the same vocabulary, collaboration between marketers, designers, and analysts becomes frictionless.",
        ],
      },
      {
        heading: "Monitor outputs continuously",
        paragraphs: [
          "Use kAIro AI analytics to monitor prompt usage, asset downloads, and campaign performance. Codezela Technologies recommends quarterly reviews to refine governance and unlock new use cases.",
        ],
      },
    ],
  },
  {
    slug: "retail-visual-merchandising-ai",
    title: "Retail Visual Merchandising with kAIro AI: A 2025 Playbook",
    excerpt:
      "Boost store conversions with AI-driven planograms, campaign-ready hero imagery, and real-time localisation managed through kAIro AI.",
    dateLabel: "December 12, 2024",
    readTime: "9 min read",
    author: "Codezela Content Team",
    heroImage: "/images/image-20.jpg",
    image1: "/images/image-20.jpg",
    image2: "/images/image-21.jpg",
    sections: [
      {
        heading: "From mood boards to shelf layouts in a single workspace",
        paragraphs: [
          "kAIro AI consolidates planogram exploration, fixture design, and product storytelling into one governed environment. Visual merchandisers can assemble digital twins of flagship stores, test lighting concepts, and export production-ready assets without juggling multiple tools.",
        ],
      },
      {
        heading: "Localise promotions without reprinting entire campaigns",
        paragraphs: [
          "Retailers feed regional preferences and inventory updates into kAIro AI. The platform adjusts colour palettes, copy overlays, and pricing automatically, producing assets that sync with merchandising calendars and POS systems.",
        ],
      },
      {
        heading: "Measure merchandising impact with AI-generated telemetry",
        paragraphs: [
          "Every visual exported from kAIro AI carries metadata on prompt inputs, placement, and performance benchmarks. Store teams compare uplift across locations and inform the next iteration before the season shifts.",
        ],
      },
    ],
  },
  {
    slug: "b2b-product-launch-ai",
    title: "Launching B2B Products Faster with kAIro AI Campaign Kits",
    excerpt:
      "Turn technical specifications into conversion-first storytelling across webinars, paid media, and analyst briefings with kAIro AI.",
    dateLabel: "November 28, 2024",
    readTime: "7 min read",
    author: "Codezela Content Team",
    heroImage: "/images/image-22.jpg",
    image1: "/images/image-22.jpg",
    image2: "/images/image-23.jpg",
    sections: [
      {
        heading: "Translate feature matrices into high-impact visuals",
        paragraphs: [
          "Product marketers input differentiators, customer pain points, and compliance requirements. kAIro AI outputs persona-specific hero slides, demo thumbnails, and motion boards aligned to enterprise brand standards.",
        ],
      },
      {
        heading: "Fuel the entire funnel from a single prompt library",
        paragraphs: [
          "A reusable prompt taxonomy covers top-of-funnel ads, mid-funnel product explainers, and bottom-of-funnel ROI visuals. Teams ship cohesive creative to events, nurture streams, and sales enablement assets in days instead of months.",
        ],
      },
    ],
  },
  {
    slug: "fashion-ai-content-automation",
    title: "How Fashion Brands Automate Content Drops with kAIro AI",
    excerpt:
      "See how fashion marketers use kAIro AI to accelerate lookbooks, product drops, and creator partnerships without sacrificing brand identity.",
    dateLabel: "November 7, 2024",
    readTime: "6 min read",
    author: "Codezela Content Team",
    heroImage: "/images/image-24.jpg",
    image1: "/images/image-24.jpg",
    image2: "/images/image-25.jpg",
    sections: [
      {
        heading: "Speed up capsule drops with reusable set designs",
        paragraphs: [
          "Art directors capture signature lighting, prop styling, and camera angles as kAIro AI templates. Every new drop can inherit the look and feel while adjusting textures, models, or fabrics in minutes.",
        ],
      },
      {
        heading: "Partner with creators using AI-safe brand guardrails",
        paragraphs: [
          "Provide influencers with guided prompt packs instead of static briefs. kAIro AI validates outputs against skin-tone diversity, logo usage, and legal disclaimers before assets go live.",
        ],
      },
    ],
  },
  {
    slug: "ai-compliance-checklist",
    title: "The Compliance Checklist for Enterprise AI Imagery",
    excerpt:
      "Legal, risk, and marketing teams use this kAIro AI checklist to approve generative imagery without slowing the business.",
    dateLabel: "October 16, 2024",
    readTime: "8 min read",
    author: "Codezela Content Team",
    heroImage: "/images/image-9.jpg",
    image1: "/images/image-9.jpg",
    image2: "/images/image-10.png",
    sections: [
      {
        heading: "Catalog your guardrails before scaling generation",
        paragraphs: [
          "Align legal, brand, and accessibility teams on which prompts require review, what metadata must be stored, and how assets can be reused. kAIro AI captures these decisions in policy-driven prompt templates.",
        ],
      },
      {
        heading: "Automate compliance evidence for every asset",
        paragraphs: [
          "Each render stores approval checkpoints, contributor details, and AI-disclosure labels. Auditors can trace decisions across campaigns without digging through emails or spreadsheets.",
        ],
      },
      {
        heading: "Keep humans in the loop without introducing friction",
        paragraphs: [
          "Workflow routing inside kAIro AI ensures sensitive imagery hits legal or ethics reviewers before publication. Approval history persists so future campaigns inherit trusted baselines.",
        ],
      },
    ],
  },
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("articles");

    const operations = ARTICLES.map((article) => {
      const publishedAt = new Date(article.dateLabel);
      const timestamp = new Date().toISOString();
      const { minutes, label } = calculateReadTime(article);
      const wordCount = countWords(article);

      return {
        updateOne: {
          filter: { slug: article.slug },
          update: {
            $set: {
              ...article,
              readTime: label,
              readTimeMinutes: minutes,
              wordCount,
              publishedAt: Number.isNaN(publishedAt.getTime())
                ? timestamp
                : publishedAt.toISOString(),
              updatedAt: timestamp,
            },
            $setOnInsert: {
              createdAt: timestamp,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await collection.bulkWrite(operations, { ordered: false });
    console.log("✅ Seed complete.");
    console.table({
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
    });
  } catch (error) {
    console.error("❌ Failed to seed articles:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seed();
