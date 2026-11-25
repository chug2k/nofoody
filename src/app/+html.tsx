import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#205944" />
        <meta
          name="description"
          content="Chọn món ở quán hư cấu, theo dõi chuyến giao tưởng tượng và nhận biên lai tiết kiệm. Thanh toán 0₫."
        />
        <title>NoFoody — Đặt món cho vui</title>
        <ScrollViewStyleReset />
        <style>
          {
            "html,body{background:#e7e9df} :focus-visible{outline:3px solid #ad563f!important;outline-offset:2px} @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}"
          }
        </style>
      </head>
      <body>{children}</body>
    </html>
  );
}
