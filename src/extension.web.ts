import vscode from "vscode";

export function activate() {
  vscode.window.showInformationMessage(
    "Icon theme configuration is unavailable in the web version.",
  );
}

export function deactivate() {}
