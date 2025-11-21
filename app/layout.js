import { Plus_Jakarta_Sans } from "next/font/google";
import { Poppins } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://kairo.codezela.com"),
  title: {
    default: "kAIro AI | Codezela Technologies",
    template: "%s | kAIro AI by Codezela Technologies",
  },
  description:
    "kAIro AI from Codezela Technologies is Sri Lanka’s AI image design studio for marketers, agencies, and product teams to generate, localise, and refine campaign visuals.",
  keywords: [
    "kAIro AI",
    "Codezela Technologies",
    "AI image generator Sri Lanka",
    "AI design software Colombo",
    "AI marketing visuals",
    "Sri Lanka AI content studio",
    "AI branding platform",
  ],
  authors: [{ name: "Codezela Technologies", url: "https://codezela.com" }],
  icons: {
    icon: "/images/logo.ico",
  },
  openGraph: {
    title: "kAIro AI | AI Image Studio by Codezela Technologies",
    description:
      "Design, iterate, and deploy AI-powered imagery faster with kAIro AI, the Sri Lankan-built studio for campaign visuals, product renders, and localisation.",
    url: "https://kairo.codezela.com",
    siteName: "kAIro AI",
    images: [
      {
        url: "/images/hero-img.jpg",
        width: 1200,
        height: 630,
        alt: "kAIro AI creative workspace by Codezela Technologies",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kAIro AI | AI Image Studio by Codezela Technologies",
    description:
      "AI-first imagery, intelligent editing, and enterprise governance from Codezela Technologies in Sri Lanka.",
    images: ["/images/hero-img.jpg"],
  },
  other: {
    "Content-Security-Policy": "upgrade-insecure-requests",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://kairo.lk" />
        <link rel="preconnect" href="https://kairo.codezela.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link
          rel="preconnect"
          href="https://www.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="image"
          href="/images/hero-img.jpg"
          fetchpriority="high"
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CQPCTZKDB2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CQPCTZKDB2');
          `}
        </Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
