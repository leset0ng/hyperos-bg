export type DeviceType = "PHONE" | "PAD";
export type ColorScheme = "light" | "dark";

export type BgEffectPreset = {
  points: number[];
  colors1: number[];
  colors2: number[];
  colors3: number[];
  colorInterpPeriod: number;
  lightOffset: number;
  saturateOffset: number;
  pointOffset: number;
  pointRadiusMulti?: number;
  noiseScale?: number;
};

export type Bound = {
  x: number;
  y: number;
  width: number;
  height: number;
};
