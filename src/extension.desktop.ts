import vscode from "vscode";

import { configSection } from "./package";
import { updateIconTheme } from "./settings";

export async function activate(context: vscode.ExtensionContext) {
  await updateIconTheme();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (event.affectsConfiguration(configSection)) {
        await updateIconTheme();
      }
    }),
  );
}

export function deactivate() {}
