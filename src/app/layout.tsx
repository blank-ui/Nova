import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Nova — Web Development Studio", template: "%s · Nova" },
  description: "Nova is a web development studio building thoughtful websites, products, and systems for ambitious teams.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nova-theme-preference");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=(t==="dark"||(!t&&d)||(t==="system"&&d))?"dark":"light";document.documentElement.setAttribute("data-theme",r);if(r==="dark"){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}


