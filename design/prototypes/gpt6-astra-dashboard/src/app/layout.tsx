import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Inter-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Inter-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter", display: "swap", fallback: ["Arial", "sans-serif"],
});
const jetbrains = localFont({
  src: [
    { path: "./fonts/JetBrainsMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/JetBrainsMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains", display: "swap", fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "Studio Presence · Your daily desk",
  description: "A considered workspace for Ashish Interiors. Manage enquiries, understand city demand, and shape your studio's online presence.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body className={`${inter.variable} ${jetbrains.variable} antialiased`}>{children}</body></html>;
}
