import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from "@tanstack/react-router";
import type { z } from "zod";
import { AppLayout } from "./layouts/AppLayout.tsx";
import { dailyDifficultySchema, difficultySchema } from "./lib/difficulty.ts";
import { GamePage } from "./pages/Game/index.tsx";
import { NotFoundPage } from "./pages/NotFound/index.tsx";
import { TopPage } from "./pages/Top/index.tsx";

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
});

const topRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TopPage,
});

/** URL の難易度を検証する。そのモードで選べない難易度は「ページが見つかりません」にする */
function difficultyParams<T extends string>(schema: z.ZodType<T>) {
  return {
    parse: ({ difficulty }: { difficulty: string }) => {
      const result = schema.safeParse(difficulty);
      if (!result.success) throw notFound();
      return { difficulty: result.data };
    },
    stringify: ({ difficulty }: { difficulty: T }) => ({ difficulty }),
  };
}

const dailyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/daily/$difficulty",
  params: difficultyParams(dailyDifficultySchema),
  component: function DailyGame() {
    const { difficulty } = dailyRoute.useParams();
    return <GamePage key={difficulty} mode={{ type: "daily", difficulty }} />;
  },
});

const endlessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/endless/$difficulty",
  params: difficultyParams(difficultySchema),
  component: function EndlessGame() {
    const { difficulty } = endlessRoute.useParams();
    return <GamePage key={difficulty} mode={{ type: "endless", difficulty }} />;
  },
});

const routeTree = rootRoute.addChildren([topRoute, dailyRoute, endlessRoute]);

export const router = createRouter({ routeTree, history: createHashHistory() });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
