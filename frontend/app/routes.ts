import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // 1. Everything else (Dashboard, Home, etc.): uses main-layout with Navbar & Footer
    layout("routes/layouts/main-layout.tsx", [
        // Public routes
        index("routes/main/home.tsx"),
        route("demo", "routes/main/demo.tsx"),
        route("browse", "routes/main/browse.tsx"),
        route("browse/:id", "routes/quiz-detail.tsx"),

        // Auth routes
        layout("routes/layouts/no-auth-layout.tsx", [
            route("login", "routes/main/auth/login.tsx"),
            route("register", "routes/main/auth/register.tsx"),
        ]),

        // Protected routes (require authentication)
        layout("routes/layouts/protected-layout.tsx", [
            route("profile", "routes/main/profile.tsx"),
        ]),
    ]),
    
    // 2. The Game itself: uses game-layout (no Navbar/Footer, full screen)
    layout("routes/layouts/game-layout.tsx", [
        route("game/:id?", "routes/game/lobby.tsx", { id: "player-lobby" }),
        route("game/host/:id?", "routes/game/lobby.tsx", { id: "host-lobby" }),
    ])
] satisfies RouteConfig;
