import fs from "node:fs/promises";
import path from "node:path";

import {
  getDefaultIconThemeConfig,
  getIconThemePath,
  IconThemeConfig,
} from "./package";

/**
 * Approximates the schema for icon theme definitions as used by this extension.
 *
 * @see https://github.com/microsoft/vscode/blob/e605ba270d7f81bb29f3146926f8c12a78b74091/src/vs/workbench/services/themes/browser/fileIconThemeData.ts#L187
 */
type IconTheme = {
  file?: string;
  folder: string;
  folderExpanded: string;
  hidesExplorerArrows: boolean;
  iconDefinitions: {
    [key: string]: {
      iconPath: string;
    };
  };
  showLanguageModeIcons: boolean;
};

const EMPTY_ICON_FILENAME = "empty.svg";

export async function writeIconTheme(config: IconThemeConfig) {
  const iconSuffix = await writeIcons(config);

  const folderClosedIconId = "_folder";
  const folderOpenIconId = "_folderExpanded";

  const iconTheme: IconTheme = {
    folder: folderClosedIconId,
    folderExpanded: folderOpenIconId,
    hidesExplorerArrows: true,
    iconDefinitions: {
      [folderClosedIconId]: {
        iconPath: iconPathFromDist(
          `${config.iconType}-closed${iconSuffix}.svg`,
        ),
      },
      [folderOpenIconId]: {
        iconPath: iconPathFromDist(`${config.iconType}-open${iconSuffix}.svg`),
      },
    },
    showLanguageModeIcons: false,
  };

  if (config.emptyFileIcon) {
    iconTheme.file = "_file";
    iconTheme.iconDefinitions[iconTheme.file] = {
      iconPath: iconPathFromDist(EMPTY_ICON_FILENAME),
    };
  }

  await fs.writeFile(getIconThemePath(), JSON.stringify(iconTheme), "utf8");
}

async function writeIcons(config: IconThemeConfig) {
  const FILENAME_CACHE_DELIM = "+";

  const iconColor = config.iconColor.toLowerCase();
  const iconSuffix =
    iconColor !== getDefaultIconThemeConfig().iconColor
      ? iconColor.replace("#", FILENAME_CACHE_DELIM)
      : "";
  const iconFileRegex = new RegExp(`[${FILENAME_CACHE_DELIM}.]`, "g");

  const iconDirPath = pathFromRoot("icons");
  const files = await fs.readdir(iconDirPath);
  await Promise.all(
    files
      .filter((file) => file.endsWith(".svg") && file !== EMPTY_ICON_FILENAME)
      .map(async (file) => {
        const iconPath = path.join(iconDirPath, file);
        const svg = await fs.readFile(iconPath, "utf8");
        const updatedSvg = svg.replace(/#[0-9a-f]{3,8}/gi, iconColor);
        const updatedIconPath = path.join(
          iconDirPath,
          `${file.split(iconFileRegex)[0]}${iconSuffix}.svg`,
        );
        await fs.writeFile(updatedIconPath, updatedSvg, "utf8");
        if (iconPath !== updatedIconPath) {
          await fs.unlink(iconPath);
        }
      }),
  );

  return iconSuffix;
}

function iconPathFromDist(filename: string) {
  return path.relative(pathFromRoot("dist"), pathFromRoot("icons", filename));
}

function pathFromRoot(...pathSegments: string[]) {
  return path.resolve(__dirname, "..", ...pathSegments);
}
