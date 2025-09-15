import type { Config } from "tailwindcss";
import preset from "@acme/tailwind-preset";

export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/**/*.{ts,tsx}"],
  presets: [preset]
} satisfies Config;
