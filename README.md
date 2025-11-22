# kAIro &mdash; AI Image Creation Platform

kAIro is a modern AI creativity suite built with Next.js. It pairs a polished marketing site with a secure dashboard that lets creators and product teams generate, edit, and manage AI imagery in minutes. The experience is mobile-first, authentication-aware, and ready to plug into Codezela’s broader AI services.

---

## ✨ Highlights

- **AI Toolset Dashboard** &mdash; Text-to-image, dual image editor, mask-based editing, and update workflows, all behind protected routes.
- **Immersive Marketing Site** &mdash; Hero-driven home page, feature sections, success stories, partners, gallery, blog, and FAQ content.
- **Authentication & Sessions** &mdash; NextAuth.js credential flow with session-aware navigation and middleware-guarded dashboard routes.
- **Optimised Visual Delivery** &mdash; `next/image`, progressive loading, and suspenseful search param handling for fast rendering and SEO.
- **Device-Ready UI** &mdash; Carefully tuned layouts for desktop, tablet, and mobile, including responsive log-in/sign-up experiences.
- **Extensible API Layer** &mdash; Next.js App Router API routes proxy requests to upstream AI microservices or external providers.

---

## 🏗 Architecture Overview

| Layer         | Summary                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------ |
| **Framework** | Next.js App Router (React 19) with hybrid server/client components and middleware.               |
| **Auth**      | NextAuth (JWT strategy, credential provider by default; Google/LinkedIn stubs ready).            |
| **Data**      | MongoDB client helper in `lib/db.js`; collections for users and generated assets.                |
| **Styling**   | Tailwind-inspired utility classes, custom gradients, MUI components inside the dashboard.        |
| **Assets**    | `/public/images` optimised with `next/image` and deliberate quality hints.                       |
| **APIs**      | `app/api/*` routes wrap Codezela AI endpoints (text, mask, reference generation, etc.).          |
| **Security**  | Route middleware restricts `/dashboard/**`, Suspense-protected search params, guarded redirects. |

---

## 📁 Project Structure

```
app/
  (marketing routes: page.js, blog, faq, login, signup, privacy-policy, test-base64)
  dashboard/
    page.js                # Dashboard home hub
    text-to-image/
    dual-image-editor/
    edit-with-mask/
    image-update/
components/
  auth/                    # Client-authenticated forms for login/signup
  home/HomeContent.js      # Client shell for landing page
  navigationbar.js, Footer.js, Hero.js, Gallery.js, ...
  dashboard/TitleBar.js    # Reusable dashboard chrome
  ProtectedRoute.js        # Session gatekeeper
  data/
  articles.js, faqs.json
lib/
  auth.js, db.js
utils/
  apiUtils.js              # Proxy-aware fetch helper
middleware.js              # Auth matcher for /dashboard/**
```

---

## ⚙️ Getting Started

### 1. Prerequisites

- Node.js 18.18+ (recommended 20 LTS)
- npm 9+ (or pnpm/yarn/bun)
- MongoDB cluster & connection string
- AI service endpoints reachable from your environment (see `utils/apiUtils.js`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/kairo

# NextAuth
NEXTAUTH_SECRET=generate-a-long-random-secret
NEXTAUTH_URL=http://localhost:3000

# Optional OAuth providers
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# LINKEDIN_CLIENT_ID=
# LINKEDIN_CLIENT_SECRET=
```

If you proxy to external AI services, ensure your local network permits requests to the host defined in `utils/apiUtils.js`.

### 4. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the marketing site. Authenticated users are redirected to the dashboard.

### 5. Production Build

```bash
npm run build
npm start
```

### 6. Linting

```bash
npm run lint
```

---

## 🧭 Feature Map

| Route                          | Purpose                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| `/`                            | Marketing homepage (hero, features, partner carousel, gallery, CTA). |
| `/login` & `/signup`           | Mobile-first auth screens with session awareness.                    |
| `/dashboard`                   | Auth-gated hub aggregating AI tools and stats.                       |
| `/dashboard/text-to-image`     | Prompt-based image generation with history & fullscreen preview.     |
| `/dashboard/dual-image-editor` | Upload, compare, and enhance paired images.                          |
| `/dashboard/edit-with-mask`    | Brush-driven masking workflow for selective edits.                   |
| `/dashboard/image-update`      | Update existing creatives with prompt adjustments.                   |
| `/blog` & `/blog/[id]`         | Dynamic blog grid with hover reveals and detail pages.               |
| `/faq`                         | Accordion-based FAQ powered by `FaqCard`.                            |
| `/privacy-policy`              | Static legal copy with rich imagery.                                 |
| `/test-base64`                 | Utility page for validating base64 image responses.                  |

---

## 🔐 Authentication & Authorization

- Credentials provider checks hashed passwords via `lib/auth.js`.
- Sessions stored as JWTs; `middleware.js` restricts `/dashboard/:path*`.
- `ProtectedRoute` wraps dashboard components, providing a loading state while verifying sessions.
- Google/LinkedIn providers are scaffolded and can be re-enabled by supplying credentials.

---

## 🖼 AI Pipeline Notes

- Front-end components call `apiUtils.apiCall` which proxies to the configured AI backend.
- Endpoints exist for mask editing, reference-based creation, and text-to-image flows.
- Local storage retains generated image history with quota management and progressive truncation.

---

## 🧪 Testing & Quality

- ESLint (Next config) keeps the codebase consistent.
- Suspense wrappers around `useSearchParams` avert SSG bailouts.
- Intensive pages lean on client components only where stateful hooks are required, preserving server rendering elsewhere.

---

## 🚀 Deployment

1. Set environment variables on your hosting provider (Vercel, Netlify, etc.).
2. Provide MongoDB credentials and NextAuth secrets.
3. Ensure outbound network access to the AI microservices.
4. Trigger `npm run build` during deployment; start with `npm start`.

For Vercel, add the `.env` values in the project dashboard and connect the repository. The App Router structure deploys seamlessly.

---

## 📄 License & Ownership

This project is proprietary to **Codezela Technologies**. All rights reserved. For partnership or commercial enquiries, reach out via [Codezela’s contact page](https://codezela.com/contact).

---

## 🤝 Contributing

Internal contributors:

1. Create a feature branch: `git checkout -b feat/short-description`.
2. Run lint and QA flows before opening a PR.
3. Include screenshots or video clips for UI changes (especially dashboard tools).

External contributions are currently by invitation only.

---

## 📬 Support

Need bespoke AI solutions or integration support? The Codezela team specialises in:

- Web & mobile product engineering
- AI-driven content platforms
- Enterprise software development

Start the conversation at [codezela.com/contact](https://codezela.com/contact).

Built with ♥ by the Codezela Team | © Codezela Technologies 2025
