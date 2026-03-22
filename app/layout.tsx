import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Moe Allami — CS Student · Cybersecurity & AI",
  description:
    "Musa (Moe) Allami — BS Computer Science student at UMBC, Baltimore MD. Builder of Linux VM labs, OSINT workflows, and local AI/LLM systems. Seeking cybersecurity and AI internships 2025.",
  keywords: [
    "cybersecurity", "AI", "portfolio", "UMBC", "computer science",
    "Baltimore", "internship", "Linux", "VMware", "Maltego", "Python",
  ],
  authors: [{ name: "Musa Allami" }],
  openGraph: {
    title: "Moe Allami — Cybersecurity Engineer & AI Builder",
    description:
      "Building technology at the intersection of security and intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${jetbrainsMono.variable}`}
      style={{ background: "#020408" }}
    >
      <body className="noise">{children}</body>
    </html>
  );
}
