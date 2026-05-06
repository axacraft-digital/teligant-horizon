import type { NextConfig } from "next";

const config: NextConfig = {
  // Allow Next to compile our workspace package directly from source.
  // This avoids needing a build step in packages/kit during Chapter 1.
  transpilePackages: ["@teligant/horizon-kit"],
};

export default config;
