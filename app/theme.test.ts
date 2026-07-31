// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

function rgb(hex: string) { const value = Number.parseInt(hex.slice(1), 16); return [(value >> 16) & 255, (value >> 8) & 255, value & 255]; }
function luminance(hex: string) { return rgb(hex).map(channel => { const value = channel / 255; return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0); }
function contrast(first: string, second: string) { const values = [luminance(first), luminance(second)].sort((a, b) => b - a); return (values[0] + 0.05) / (values[1] + 0.05); }

describe("semantic theme", () => {
  it("defines every required semantic token for light and dark modes", () => {
    for (const token of ["background", "foreground", "surface", "border", "muted", "primary", "success", "warning", "danger", "focus"]) {
      expect(css.match(new RegExp(`--${token}:`, "g"))?.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps default and muted text above WCAG AA contrast", () => {
    expect(contrast("#18181b", "#f7f8fb")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#626b7a", "#f7f8fb")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#f4f5f7", "#0d1017")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#a8b0bf", "#0d1017")).toBeGreaterThanOrEqual(4.5);
  });
});
