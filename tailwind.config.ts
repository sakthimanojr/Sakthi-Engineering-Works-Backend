import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#111315", coal: "#191C1F", steel: "#343A40", mist: "#E9ECEF", accent: { DEFAULT: "#FF851B", deep: "#B84E00" } } } },
  plugins: [],
};
export default config;
