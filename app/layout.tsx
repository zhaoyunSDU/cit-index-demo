import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cit-index-demo.zhaoyun0614.chatgpt.site"),
  title: "中国创新转化指数",
  description: "面向电脑浏览器的中国创新转化指数（CIT Index）实时监测与分析平台演示版。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "中国创新转化指数",
    description: "观察创新成果从产生到价值实现的全过程 · 演示版",
    url: "/",
    siteName: "中国创新转化指数",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "中国创新转化指数演示平台" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "中国创新转化指数",
    description: "观察创新成果从产生到价值实现的全过程 · 演示版",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#072a63",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
