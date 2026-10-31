import "@mantine/core/styles.css";
import "./global.css";
import { MantineProvider, createTheme, virtualColor } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "./router.tsx";

const theme = createTheme({
  // 墨色。ダークモードでは明るい灰色にして、ボタンなどが背景に埋もれないようにする
  colors: { ink: virtualColor({ name: "ink", light: "dark", dark: "gray" }) },
  primaryColor: "ink",
  primaryShade: { light: 7, dark: 2 },
  autoContrast: true,
  fontFamily:
    'system-ui, -apple-system, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif',
});

const queryClient = new QueryClient({
  defaultOptions: {
    // 出題データは静的ファイルで変わらないので、取得し直さない
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      // 端末がオフラインと判断されていても、まず読み込みを試す。
      // テスト用ページは全データを読み込み済みなので、そのまま続けられる
      networkMode: "offlineFirst",
    },
  },
});

const root = document.getElementById("root");
if (!root) throw new Error("#root がありません");

createRoot(root).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
