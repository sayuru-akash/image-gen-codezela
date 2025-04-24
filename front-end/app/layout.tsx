import React, { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "ImageGen Pro | AI Image Generation",
  description:
    "Transform text into images or enhance existing images with our AI image generation service.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
