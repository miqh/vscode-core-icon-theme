import { getDefaultIconThemeConfig } from "./package";
import { writeIconTheme } from "./theme";

export async function postbuild() {
  console.info(
    "generating default icon theme configuration for published package\n",
  );
  await writeIconTheme(getDefaultIconThemeConfig());
}
