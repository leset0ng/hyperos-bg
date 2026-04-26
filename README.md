# hyperos-bg

[![npm version](https://img.shields.io/npm/v/hyperos-bg)](https://www.npmjs.com/package/hyperos-bg)
[![npm downloads](https://img.shields.io/npm/dm/hyperos-bg)](https://www.npmjs.com/package/hyperos-bg)
[![license](https://img.shields.io/npm/l/hyperos-bg)](https://github.com/leset0ng/hyperos-bg/blob/main/package.json)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-181717?logo=github)](https://leset0ng.github.io/hyperos-bg/)
[![GitHub stars](https://img.shields.io/github/stars/leset0ng/hyperos-bg?style=social)](https://github.com/leset0ng/hyperos-bg/stargazers)
[![last commit](https://img.shields.io/github/last-commit/leset0ng/hyperos-bg)](https://github.com/leset0ng/hyperos-bg/commits/main)

[Live Demo](https://leset0ng.github.io/hyperos-bg/) · [GitHub Repository](https://github.com/leset0ng/hyperos-bg) · [npm Package](https://www.npmjs.com/package/hyperos-bg)

A React background component that recreates the soft animated HyperOS-style backdrop with WebGL.

The package currently exposes a single component: `BgEffectBackground`.

## Attribution

This implementation was recreated by studying and reimplementing the logic from the original `BgEffectBackground.kt` in the miuix project:

- https://github.com/compose-miuix-ui/miuix/blob/main/example/shared/src/commonMain/kotlin/component/effect/BgEffectBackground.kt

Many thanks to the original author(s) and the `compose-miuix-ui/miuix` project for the source inspiration.

## Features

- HyperOS-inspired gradient background rendered with `canvas` + WebGL
- Two shader paths: `OS2` and `OS3`
- Built-in presets for `PHONE` and `PAD`
- Built-in light and dark color schemes
- Optional animated color-stage transitions
- Configurable alpha and host/background styling
- Content slot via `children` or the `content` prop
- SSR-friendly markup output with browser-only WebGL setup in `useEffect`

## Installation

```bash
npm install hyperos-bg
```

```bash
pnpm add hyperos-bg
```

Peer dependencies:

- `react >= 18`
- `react-dom >= 18`

## Component API

```tsx
import { BgEffectBackground } from "hyperos-bg";
```

### `BgEffectBackgroundProps`

`BgEffectBackground` extends `ComponentPropsWithoutRef<"div">` except for the native `content` prop.

| Prop                | Type                             | Required | Default     | Description                                                                    |
| ------------------- | -------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------ |
| `dynamicBackground` | `boolean`                        | no       | `true`      | Enables animated stage-to-stage color interpolation.                           |
| `bgStyle`           | `CSSProperties`                  | no       | `undefined` | Inline styles applied to the internal `<canvas>`.                              |
| `isFullSize`        | `boolean`                        | no       | `false`     | Uses the full host height instead of the default cropped draw region.          |
| `effectBackground`  | `boolean`                        | no       | `true`      | Disables the shader contribution when `false` while preserving layout/content. |
| `isOs3Effect`       | `boolean`                        | no       | `false`     | Switches between the newer OS3 shader/preset set and the older OS2 one.        |
| `deviceType`        | `"PHONE" \| "PAD"`               | no       | `"PAD"`     | Selects the geometric preset family.                                           |
| `colorScheme`       | `"light" \| "dark"`              | no       | `"light"`   | Selects the preset color scheme.                                               |
| `alpha`             | `() => number`                   | no       | `() => 1`   | Returns the current effect alpha. Values are clamped to `0..1`.                |
| `content`           | `ReactNode \| (() => ReactNode)` | no       | `undefined` | Content rendered above the canvas. Takes priority over `children`.             |
| `children`          | `ReactNode`                      | no       | `undefined` | Fallback content when `content` is not provided.                               |

## TypeScript usage

The package ships TypeScript declarations and exports `BgEffectBackgroundProps`.

```tsx
import { BgEffectBackground, type BgEffectBackgroundProps } from "hyperos-bg";

const backgroundProps: BgEffectBackgroundProps = {
  dynamicBackground: true,
  effectBackground: true,
  deviceType: "PAD",
  colorScheme: "dark",
  bgStyle: { opacity: 1 },
};

export function TypedHero() {
  return (
    <BgEffectBackground
      {...backgroundProps}
      alpha={() => 0.92}
      style={{ minHeight: 480, borderRadius: 28 }}
    >
      <div style={{ minHeight: 480 }} />
    </BgEffectBackground>
  );
}
```

## Usage

```tsx
import { BgEffectBackground } from "hyperos-bg";

export function Hero() {
  return (
    <BgEffectBackground
      dynamicBackground
      effectBackground
      isOs3Effect
      deviceType="PAD"
      colorScheme="dark"
      alpha={() => 0.96}
      style={{ minHeight: 520, borderRadius: 32 }}
      bgStyle={{ opacity: 1 }}
    >
      <div
        style={{
          minHeight: 520,
          display: "grid",
          placeItems: "end start",
          padding: 32,
          color: "white",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 56 }}>HyperOS Background</h2>
      </div>
    </BgEffectBackground>
  );
}
```

### Using `content`

```tsx
<BgEffectBackground
  dynamicBackground={false}
  effectBackground
  colorScheme="light"
  bgStyle={{ opacity: 1 }}
  content={() => <div>Overlay content</div>}
/>
```

## Rendering model

- The component renders a wrapping `<div>`, an absolutely positioned `<canvas>`, and a foreground content layer.
- WebGL setup happens only on the client inside `useEffect`.
- If WebGL is unavailable, the component still renders its layout and foreground content; only the shader effect is skipped.

## Local development

This repository uses Vite+.

```bash
vp install
vp dev
```

Open the preview page to interact with the live playground from `demo/main.tsx`.

Useful commands:

```bash
vp check
vp test
vp pack
vp build
```

- `vp build` builds the demo site for GitHub Pages into `site/`
- `vp pack` builds the publishable package into `dist/`

## Project structure

```txt
src/
  BgEffectBackground.tsx   # Public React component
  index.ts                 # Package exports
  webgl/
    os2-preset.ts          # OS2 preset values
    os2-shader.ts          # OS2 fragment shader
    os3-preset.ts          # OS3 preset values
    os3-shader.ts          # OS3 fragment shader
    presets.ts             # Preset selector
    shaders.ts             # Shader selector + vertex shader
    types.ts               # Shared types
    utils.ts               # WebGL and interpolation helpers
demo/
  main.tsx                 # Interactive preview playground
  styles.css               # Preview page styles
tests/
  index.test.tsx           # Server-render tests for wrapper/content
```

## Implementation notes

- Presets are selected by `deviceType`, `colorScheme`, and `isOs3Effect`.
- Animated transitions are driven by a spring-smoothed stage index.
- The default non-full-size mode draws into a cropped region (`78%` of host height).
- The package exports only `BgEffectBackground` and `BgEffectBackgroundProps`.

## Validation checklist

Before publishing or cutting a release, run:

```bash
vp check
vp test
vp pack
```
