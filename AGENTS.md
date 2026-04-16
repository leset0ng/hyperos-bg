<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ built-in commands (`vp dev`, `vp build`, `vp test`, etc.) always run the Vite+ built-in tool, not any `package.json` script of the same name. To run a custom script that shares a name with a built-in command, use `vp run <script>`. For example, if you have a custom `dev` script that runs multiple services concurrently, run it with `vp run dev`, not `vp dev` (which always starts Vite's dev server).
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## CI Integration

For GitHub Actions, consider using [`voidzero-dev/setup-vp`](https://github.com/voidzero-dev/setup-vp) to replace separate `actions/setup-node`, package-manager setup, cache, and install steps with a single action.

```yaml
- uses: voidzero-dev/setup-vp@v1
  with:
    cache: true
- run: vp check
- run: vp test
```

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

# Project-Specific Guidance

## Repository purpose

This package ships a single React component, `BgEffectBackground`, that renders a HyperOS-style animated background using `canvas` and WebGL.

The current source of truth lives in `src/`, not in `dist/`.

## Important files

- `src/BgEffectBackground.tsx` — public component, props, lifecycle, WebGL bootstrapping
- `src/index.ts` — public exports
- `src/webgl/os2-preset.ts` — OS2 preset data
- `src/webgl/os3-preset.ts` — OS3 preset data
- `src/webgl/os2-shader.ts` — OS2 fragment shader source
- `src/webgl/os3-shader.ts` — OS3 fragment shader source
- `src/webgl/presets.ts` / `src/webgl/shaders.ts` — selector modules
- `src/webgl/utils.ts` / `src/webgl/types.ts` — shared helpers and typing
- `demo/main.tsx` / `demo/styles.css` — interactive preview playground
- `tests/index.test.tsx` — render-level coverage for the exported component
- `dist/` — generated package output; do not hand-edit

## Working rules for agents

- Preserve the package's single-component API unless the user explicitly asks for broader changes.
- Do not hand-edit `dist/`. Regenerate it with `vp pack` when build artifacts are needed.
- Keep browser-only APIs (`window`, `ResizeObserver`, WebGL context creation) inside effects or guarded code paths so server rendering remains safe.
- Prefer the existing dependency footprint. Avoid adding runtime dependencies unless clearly necessary.
- When changing shader uniforms, preset fields, or interpolation behavior, make sure OS2 and OS3 modes remain coherent.
- When adding or changing preset fields, keep coverage for both device types (`PHONE`, `PAD`) and both color schemes (`light`, `dark`).
- Keep the public prop names stable unless the user asked for a breaking API change.
- `content` intentionally overrides `children`; preserve that behavior unless requirements change.
- `bgStyle` and `dynamicBackground` are required in the public API right now; reflect that in docs and tests if touched.

## Required follow-up when changing public behavior

If you touch the public component API, rendering behavior, presets, or shader selection, also update the related surfaces:

- `README.md` — usage examples and prop documentation
- `demo/main.tsx` — preview controls and example snippet
- `tests/index.test.tsx` — coverage for the changed behavior
- `src/index.ts` — exports, if the public surface changes

Run `vp pack` as well when exported types or package output may have changed.

## Validation expectations

Minimum validation for code changes:

```bash
vp check
vp test
```

Also run this when changing exports, types, or publishable output:

```bash
vp pack
```

## Documentation expectations

- Keep README focused on the actual shipped component instead of starter-template language.
- Document defaults, required props, and meaningful behavior differences such as OS2 vs OS3 and static vs dynamic background.
- Mention Vite+ commands when describing local development in this repository.
