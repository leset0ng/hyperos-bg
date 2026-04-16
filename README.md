# hyperos-bg

A minimal React component package starter for publishing a single small component to npm.

## Features

- React + TypeScript component entry
- Typed public API export
- Test setup with `vite-plus/test`
- Ready for npm publishing
- Easy to evolve from one component into a small library later

## Project structure

```txt
src/
  Component.tsx   # Main component template
  index.ts        # Public package exports
demo/
  main.tsx        # Local preview entry
  styles.css      # Preview page styles
tests/
  index.test.tsx  # Basic render tests
```

## Development

```bash
vp install
vp dev
```

Open the local Vite preview page to see your component while developing.

Other useful commands:

```bash
vp check
vp test
vp pack
```

## Usage

```tsx
import { Component } from "hyperos-bg";

export function App() {
  return <Component>Hello</Component>;
}
```

## What you should replace

Before publishing, update these parts:

- `package.json`
  - `name`
  - `description`
  - `author`
  - `repository`
  - `homepage`
  - `bugs`
- `src/Component.tsx`
  - rename `Component` to your real component name
  - replace props and markup
- `README.md`
  - document your actual API and examples

## Publish checklist

1. Set the final package metadata in `package.json`
2. Rename `Component` to your real component name
3. Run:

```bash
vp check
vp test
vp pack
```

4. Publish to npm:

```bash
npm publish
```

If you want to stay fully inside your current toolchain, you can also use your preferred release flow after the build output is generated.
