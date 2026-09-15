import type { Metadata } from "next";
import "./globals.css";
import MiniAppReady from "@/components/MiniAppReady";

export const metadata: Metadata = {
  title: "RugRadar",
  description: "Scan any Base coin for rugs before you buy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MiniAppReady />
        <main>
          <div className="top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="brand"><img className="logo" src="/icon.png" alt="RugRadar logo" /> RugRadar</div>
            <a className="verified" href="https://farcaster.xyz/rebelstudios" target="_blank" rel="noopener noreferrer">✓ by rebelstudios</a>
          </div>
          {children}
          <footer>
            <span>Built by <a href="https://rebelstudiossoftware.com" target="_blank" rel="noopener noreferrer">Rebel Studios Software</a></span>
            <span className="spacer" />
            <a href="https://farcaster.xyz/rebelstudios" target="_blank" rel="noopener noreferrer">Farcaster</a>
            <span>· Base · Zora</span>
          </footer>
        </main>
      </body>
    </html>
  );
}
