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
    "kAIro AI by Codezela Technologies is the enterprise-ready creative suite for AI image generation, editing, and delivery.",
  keywords: [
    "kAIro AI",
    "Codezela Technologies",
    "AI image generator",
    "creative automation",
    "AI branding platform",
    "marketing design automation",
  ],
  authors: [{ name: "Codezela Technologies", url: "https://codezela.com" }],
  icons: {
    icon: "/images/logo.ico",
  },
  openGraph: {
    title: "kAIro AI | Creative Automation by Codezela Technologies",
    description:
      "Design, iterate, and deploy AI-powered imagery faster with kAIro AI, the creative suite built by Codezela Technologies.",
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
    title: "kAIro AI | Creative Automation by Codezela Technologies",
    description:
      "AI-first imagery, intelligent editing, and enterprise governance from Codezela Technologies.",
    images: ["/images/hero-img.jpg"],
  },
  other: {
    "Content-Security-Policy": "upgrade-insecure-requests",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
