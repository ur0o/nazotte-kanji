import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from "@tanstack/react-router";
import { AppLayout } from "./layouts/AppLayout.tsx";
import { difficultySchema, type Difficulty } from "./lib/difficulty.ts";
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

const difficultyParams = {
  parse: ({ difficulty }: { difficulty: string }) => {
    const result = difficultySchema.safeParse(difficulty);
    if (!result.success) throw notFound();
    return { difficulty: result.data };
  },
  stringify: ({ difficulty }: { difficulty: Difficulty }) => ({ difficulty }),
};

const dailyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/daily/$difficulty",
  params: difficultyParams,
  component: function DailyGame() {
    const { difficulty } = dailyRoute.useParams();
    return <GamePage key={difficulty} mode={{ type: "daily", difficulty }} />;
  },
});

const endlessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/endless/$difficulty",
  params: difficultyParams,
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
