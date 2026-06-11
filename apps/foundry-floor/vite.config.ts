import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Dev-server-only mock of the Azure Static Web Apps auth endpoint so the
// local walkthrough can reach the workspace. apply: "serve" means this never
// exists in production builds; the deployed SWA serves the real /.auth/me.
function mockStaticWebAppAuth(): Plugin {
  return {
    name: "mock-swa-auth",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/.auth/me", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            clientPrincipal: {
              identityProvider: "aad",
              userDetails: "local-operator@asteria-dynamics.example",
              userId: "local-operator",
              userRoles: ["authenticated"]
            }
          })
        );
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), mockStaticWebAppAuth()],
  server: {
    port: 5173
  }
});
