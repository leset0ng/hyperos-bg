import { defineConfig } from "vite-plus";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: isGitHubActions ? "/hyperos-bg/" : "/",
  staged: {
    "*": "vp check --fix",
  },
  build: {
    outDir: "site",
  },
  pack: {
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
