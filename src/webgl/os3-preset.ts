import type { BgEffectPreset, DeviceType } from "./types.js";

const SHARED_OS3 = {
  pointRadiusMulti: 1,
  noiseScale: 1.5,
  alphaOffset: 0.1,
  shadowColorMulti: 0.3,
  shadowColorOffset: 0.3,
  shadowNoiseScale: 5.0,
  shadowOffset: 0.01,
} satisfies Partial<BgEffectPreset>;

export const OS3_PRESETS: Record<DeviceType, { light: BgEffectPreset; dark: BgEffectPreset }> = {
  PHONE: {
    light: {
      points: [0.8, 0.2, 1.0, 0.8, 0.9, 1.0, 0.2, 0.9, 1.0, 0.2, 0.2, 1.0],
      colors1: [
        1.0, 0.9, 0.94, 1.0, 1.0, 0.84, 0.89, 1.0, 0.97, 0.73, 0.82, 1.0, 0.64, 0.65, 0.98, 1.0,
      ],
      colors2: [
        0.58, 0.74, 1.0, 1.0, 1.0, 0.9, 0.93, 1.0, 0.74, 0.76, 1.0, 1.0, 0.97, 0.77, 0.84, 1.0,
      ],
      colors3: [
        0.98, 0.86, 0.9, 1.0, 0.6, 0.73, 0.98, 1.0, 0.92, 0.93, 1.0, 1.0, 0.56, 0.69, 1.0, 1.0,
      ],
      colorInterpPeriod: 5.0,
      lightOffset: 0.1,
      saturateOffset: 0.2,
      pointOffset: 0.2,
      ...SHARED_OS3,
    },
    dark: {
      points: [0.8, 0.2, 1.0, 0.8, 0.9, 1.0, 0.2, 0.9, 1.0, 0.2, 0.2, 1.0],
      colors1: [
        0.2, 0.06, 0.88, 0.4, 0.3, 0.14, 0.55, 0.5, 0.0, 0.64, 0.96, 0.5, 0.11, 0.16, 0.83, 0.4,
      ],
      colors2: [
        0.07, 0.15, 0.79, 0.5, 0.62, 0.21, 0.67, 0.5, 0.06, 0.25, 0.84, 0.5, 0.0, 0.2, 0.78, 0.5,
      ],
      colors3: [
        0.58, 0.3, 0.74, 0.4, 0.27, 0.18, 0.6, 0.5, 0.66, 0.26, 0.62, 0.5, 0.12, 0.16, 0.7, 0.6,
      ],
      colorInterpPeriod: 8.0,
      lightOffset: 0.0,
      saturateOffset: 0.17,
      pointOffset: 0.4,
      ...SHARED_OS3,
    },
  },
  PAD: {
    light: {
      points: [0.8, 0.2, 1.0, 0.8, 0.9, 1.0, 0.2, 0.9, 1.0, 0.2, 0.2, 1.0],
      colors1: [
        0.99, 0.77, 0.86, 1.0, 0.74, 0.76, 1.0, 1.0, 0.72, 0.74, 1.0, 1.0, 0.98, 0.76, 0.8, 1.0,
      ],
      colors2: [
        0.66, 0.75, 1.0, 1.0, 1.0, 0.86, 0.91, 1.0, 0.74, 0.76, 1.0, 1.0, 0.97, 0.77, 0.84, 1.0,
      ],
      colors3: [
        0.97, 0.79, 0.85, 1.0, 0.65, 0.68, 0.98, 1.0, 0.66, 0.77, 1.0, 1.0, 0.72, 0.73, 0.98, 1.0,
      ],
      colorInterpPeriod: 7.0,
      lightOffset: 0.1,
      saturateOffset: 0.2,
      pointOffset: 0.2,
      ...SHARED_OS3,
    },
    dark: {
      points: [0.8, 0.2, 1.0, 0.8, 0.9, 1.0, 0.2, 0.9, 1.0, 0.2, 0.2, 1.0],
      colors1: [
        0.66, 0.26, 0.62, 0.4, 0.06, 0.25, 0.84, 0.5, 0.0, 0.64, 0.96, 0.5, 0.14, 0.18, 0.55, 0.5,
      ],
      colors2: [
        0.07, 0.15, 0.79, 0.5, 0.11, 0.16, 0.83, 0.5, 0.06, 0.25, 0.84, 0.5, 0.66, 0.26, 0.62, 0.5,
      ],
      colors3: [
        0.58, 0.3, 0.74, 0.5, 0.11, 0.16, 0.83, 0.5, 0.66, 0.26, 0.62, 0.5, 0.27, 0.18, 0.6, 0.6,
      ],
      colorInterpPeriod: 7.0,
      lightOffset: 0.0,
      saturateOffset: 0.0,
      pointOffset: 0.2,
      ...SHARED_OS3,
    },
  },
};
