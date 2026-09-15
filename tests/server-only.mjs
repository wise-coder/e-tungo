// Node tests run server modules outside Next's bundler. Apply its server-only
// condition narrowly, without changing React's runtime conditions.
import { registerHooks } from "node:module";
registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier, specifier === "server-only"
      ? { ...context, conditions: [...context.conditions, "react-server"] }
      : context);
  },
});
