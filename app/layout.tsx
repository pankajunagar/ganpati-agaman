import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata: Metadata = {
  title: "શ્રી ગણપતિ બાપ્પા પોસ્ટર જનરેટર | Friends Group આયોજિત",

  description:
    "Friends Group દ્વારા આયોજિત શ્રી ગણપતિ બાપ્પાના ભવ્ય આગમન માટે તમારો ફોટો ઉમેરો અને સુંદર ગણપતિ પોસ્ટર બનાવો. પોસ્ટર ડાઉનલોડ કરો અને WhatsApp પર શેર કરો."
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="gu">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Vadodara:wght@500;700&family=Poppins:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}
      <Analytics />
      <SpeedInsights />
      </body>
    </html>
  );
}
