import vscode from "vscode";

import {
  configSection,
  getDefaultIconThemeConfig,
  IconThemeConfig,
} from "./package";
import { writeIconTheme } from "./theme";

export async function updateIconTheme() {
  const config = getIconThemeConfig();
  if (config) {
    await writeIconTheme(config);
  }
}

function getIconThemeConfig() {
  const config: {
    [K in keyof IconThemeConfig]: IconThemeConfig[K] | undefined;
  } = getDefaultIconThemeConfig();
  for (const key of Object.keys(config) as (keyof typeof config)[]) {
    config[key] = vscode.workspace.getConfiguration(configSection).get(key);
    if (config[key] === undefined) {
      return undefined;
    }
  }
  return config as IconThemeConfig;
}
