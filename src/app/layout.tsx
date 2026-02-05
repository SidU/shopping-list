import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Share_Tech_Mono, Orbitron, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { SoundProvider } from "@/lib/contexts/SoundContext";

// Default fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Retro theme fonts
const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-retro-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-retro",
  subsets: ["latin"],
});

// Pixel arcade theme fonts
const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-pixel-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Shopping List",
  description: "Organize your shopping by store sections. Share lists with family.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shopping List",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${shareTechMono.variable} ${pressStart2P.variable} ${vt323.variable} antialiased`}
      >
        <ThemeProvider>
          <SoundProvider>
            <AuthProvider>{children}</AuthProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
