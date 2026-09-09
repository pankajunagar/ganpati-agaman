import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "શ્રી ગણપતિ પોસ્ટર જનરેટર",
  description: "તમારો ફોટો નાખો — ગણપતિ બાપ્પાનું પોસ્ટર આપોઆપ તૈયાર થશે",
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
