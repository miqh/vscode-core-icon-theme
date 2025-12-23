import assert from "node:assert/strict";
import path from "node:path";

import packageJson from "../package.json";

const configSchemaProps = packageJson.contributes.configuration.properties;

export const configSection = "coreIconTheme";

export type IconThemeConfig = {
  [P in keyof typeof configSchemaProps as P extends `${string}.${infer K}`
    ? K
    : never]: (typeof configSchemaProps)[P] extends { default: infer D }
    ? D
    : unknown;
};

export function getDefaultIconThemeConfig() {
  return Object.fromEntries(
    Object.entries(configSchemaProps).map(([k, v]) => [
      k.replace(`${configSection}.`, ""),
      v.default,
    ]),
  ) as IconThemeConfig;
}

export function getIconThemePath() {
  const iconThemePath = packageJson.contributes.iconThemes[0];
  assert.ok(iconThemePath);
  return path.resolve(__dirname, "..", iconThemePath.path);
}
