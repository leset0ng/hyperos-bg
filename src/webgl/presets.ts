import { OS2_PRESETS } from "./os2-preset.js";
import { OS3_PRESETS } from "./os3-preset.js";
import type { BgEffectPreset, ColorScheme, DeviceType } from "./types.js";

export function getPreset(
  deviceType: DeviceType,
  colorScheme: ColorScheme,
  isOs3Effect: boolean,
): BgEffectPreset {
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const presets = isOs3Effect ? OS3_PRESETS : OS2_PRESETS;
  return presets[deviceType][scheme];
}
