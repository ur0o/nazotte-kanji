import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from "@tanstack/react-router";
import { AppLayout } from "./layouts/AppLayout.tsx";
import { difficultySchema } from "./lib/difficulty.ts";
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

const dailyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/daily",
  component: () => <GamePage mode={{ type: "daily" }} />,
});

const endlessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/endless",
  component: () => <GamePage mode={{ type: "endless" }} />,
});

const levelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/level/$difficulty",
  params: {
    parse: ({ difficulty }) => {
      const result = difficultySchema.safeParse(difficulty);
      if (!result.success) throw notFound();
      return { difficulty: result.data };
    },
    stringify: ({ difficulty }) => ({ difficulty }),
  },
  component: function LevelGame() {
    const { difficulty } = levelRoute.useParams();
    return <GamePage key={difficulty} mode={{ type: "level", difficulty }} />;
  },
});

const routeTree = rootRoute.addChildren([
  topRoute,
  dailyRoute,
  endlessRoute,
  levelRoute,
]);

export const router = createRouter({ routeTree, history: createHashHistory() });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
