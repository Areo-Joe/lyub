import {
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { Timer } from "@/components/Timer";
import { ActivityHistory } from "@/components/ActivityHistory";
import { Stats } from "@/components/Stats";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Timer as TimerIcon, History, BarChart3 } from "lucide-react";

// Root layout component
function RootLayout() {
  return (
    <ThemeProvider>
      <div className="flex flex-col items-center min-h-screen pb-20">
        {/* Header */}
        <header className="w-full py-3 px-4 border-b bg-background sticky top-0 z-10">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Lyubishchev</h1>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 w-full max-w-md px-4 py-6">
          <Outlet />
        </main>

        {/* Bottom navigation */}
        <BottomNav />
      </div>
    </ThemeProvider>
  );
}

// Bottom navigation with Link components
const navItems = [
  { to: "/", label: "Timer", icon: TimerIcon },
  { to: "/history", label: "History", icon: History },
  { to: "/stats", label: "Stats", icon: BarChart3 },
] as const;

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-muted-foreground hover:text-foreground [&.active]:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Not found component
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <h2 className="text-2xl font-bold">404</h2>
      <p className="text-muted-foreground">Page not found</p>
      <Link to="/" className="text-primary hover:underline">
        Go back home
      </Link>
    </div>
  );
}

// Route definitions
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Timer,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: ActivityHistory,
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stats",
  component: Stats,
});

// Build route tree
const routeTree = rootRoute.addChildren([indexRoute, historyRoute, statsRoute]);

// Create router with hash history for GitHub Pages
const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
});

// Register router types for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

