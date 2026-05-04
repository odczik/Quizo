import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // 1. Everything else (Dashboard, Home, etc.): uses main-layout with Navbar & Footer
    layout("routes/layouts/main-layout.tsx", [
        index("routes/home.tsx"),
        route("demo", "routes/demo.tsx")
    ]),
    
    // 2. The Game itself: uses game-layout (no Navbar/Footer, full screen)
    layout("routes/layouts/game-layout.tsx", [
        route("game", "routes/game.tsx")
    ])
] satisfies RouteConfig;
