import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // 1. Everything else (Dashboard, Home, etc.): uses main-layout with Navbar & Footer
    layout("routes/layouts/main-layout.tsx", [
        index("routes/main/home.tsx"),
        route("demo", "routes/main/demo.tsx"),
        route("browse", "routes/main/browse.tsx"),
        // Auth routes
        route("login", "routes/main/auth/login.tsx"),
        route("register", "routes/main/auth/register.tsx")
    ]),
    
    // 2. The Game itself: uses game-layout (no Navbar/Footer, full screen)
    layout("routes/layouts/game-layout.tsx", [
        route("game/:id?", "routes/game/lobby.tsx")
    ])
] satisfies RouteConfig;
