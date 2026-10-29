import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast";
import { LanguageProvider } from "@/components/language-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { DepthMotion } from "@/components/depth-motion";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Nova — Web Development Studio", template: "%s · Nova" },
  description: "Nova is a web development studio building thoughtful websites, products, and systems for ambitious teams.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.protocol==='http:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'&&!location.hostname.startsWith('192.168.')&&!location.hostname.startsWith('10.')){location.replace('https://'+location.host+location.pathname+location.search+location.hash);}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nova-theme-preference");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=(t==="dark"||(!t&&d)||(t==="system"&&d))?"dark":"light";document.documentElement.setAttribute("data-theme",r);if(r==="dark"){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <ToastProvider>{children}</ToastProvider>
              <DepthMotion />
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
