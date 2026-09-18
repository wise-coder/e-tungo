import nextVitals from "eslint-config-next/core-web-vitals";
const config = [
  ...nextVitals,
  { ignores: [".next/**", ".next-debug/**", ".next-security/**", "node_modules/**", "test-results/**", "next-env.d.ts"] },
  // This React 18 application does not enable React Compiler. Keep the standard
  // Hooks checks while allowing its existing hydration and ref patterns.
  { rules: { "react-hooks/set-state-in-effect": "off", "react-hooks/refs": "off" } },
];
export default config;
