import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata: Metadata = {
  title: "શ્રી ગણપતિ બાપ્પા પોસ્ટર જનરેટર | Friends Group આયોજિત",

  description:
    "Friends Group દ્વારા આયોજિત શ્રી ગણપતિ બાપ્પાના ભવ્ય આગમન માટે તમારો ફોટો ઉમેરો અને સુંદર ગણપતિ પોસ્ટર બનાવો. પોસ્ટર ડાઉનલોડ કરો અને WhatsApp પર શેર કરો.",

  keywords: [
    "Ganpati Poster Generator",
    "Ganpati Poster 2026",
    "શ્રી ગણપતિ પોસ્ટર",
    "ગણપતિ બાપ્પા પોસ્ટર",
    "Friends Group",
    "Friends Group આયોજિત",
    "Ganpati Photo Poster",
    "Ganesh Chaturthi 2026",
  ],

  openGraph: {
    title: "શ્રી ગણપતિ બાપ્પા પોસ્ટર જનરેટર 🙏",
    description:
      "Friends Group દ્વારા આયોજિત — તમારો ફોટો ઉમેરો અને ગણપતિ બાપ્પાનું સુંદર પોસ્ટર બનાવો.",

    url: "https://YOUR-DOMAIN.com",
    siteName: "શ્રી ગણપતિ બાપ્પા પોસ્ટર જનરેટર",

    images: [
      {
        url: "/ganpati-meta.png",
        width: 1200,
        height: 630,
        alt: "Friends Group દ્વારા આયોજિત શ્રી ગણપતિ બાપ્પા પોસ્ટર",
      },
    ],

    locale: "gu_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "શ્રી ગણપતિ બાપ્પા પોસ્ટર જનરેટર 🙏",
    description:
      "Friends Group દ્વારા આયોજિત — તમારો ફોટો ઉમેરો અને ગણપતિ બાપ્પાનું સુંદર પોસ્ટર બનાવો.",
    images: ["/ganpati-meta.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
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
      <body>{children}</body>
    </html>
  );
}
