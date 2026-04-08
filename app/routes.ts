import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("labs/smoke", "routes/labs.smoke.tsx"),
  route("labs/smoke-v2", "routes/labs.smoke-v2.tsx"),
  route("labs/smoke-v3", "routes/labs.smoke-v3.tsx"),
] satisfies RouteConfig;
