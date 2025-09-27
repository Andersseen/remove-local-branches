import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getMergedBranches, deleteBranches } from "./git";
import { ActionsDataProvider } from "./ActionsDataProvider";

export function activate(context: vscode.ExtensionContext) {
  const actionsDataProvider = new ActionsDataProvider();
  vscode.window.registerTreeDataProvider(
    "branchCleanerActionsView",
    actionsDataProvider
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "remove-local-branches.showCleanerPage",
      () => {
        const panel = vscode.window.createWebviewPanel(
          "branchCleaner",
          "Branch Cleaner",
          vscode.ViewColumn.One,
          { enableScripts: true }
        );

        panel.webview.html = getWebviewContent(context, panel.webview);

        panel.webview.onDidReceiveMessage(
          async (message) => {
            switch (message.command) {
              case "getBranches": {
                const branches = [
                  "feature/new-shiny-button",
                  "bugfix/login-page-crash",
                  "chore/update-dependencies",
                  "release/v1.2.0-preparation",
                  "hotfix/urgent-production-issue",
                ];
                panel.webview.postMessage({
                  command: "updateBranches",
                  branches: branches,
                });
                return;
              }
              case "deleteBranches": {
                const branchesToDelete = message.branches as string[];
                if (!branchesToDelete || branchesToDelete.length === 0) return;

                const confirm = await vscode.window.showWarningMessage(
                  `Are you sure you want to delete ${branchesToDelete.length} branches?`,
                  { modal: true },
                  "Delete"
                );

                if (confirm === "Delete") {
                  await deleteBranches(branchesToDelete);
                  const updatedBranches = await getMergedBranches();
                  panel.webview.postMessage({
                    command: "updateBranches",
                    branches: updatedBranches,
                  });
                  vscode.window.showInformationMessage(
                    "Deletion simulation complete."
                  );
                }
                return;
              }
            }
          },
          undefined,
          context.subscriptions
        );
      }
    )
  );
}

function getWebviewContent(
  context: vscode.ExtensionContext,
  webview: vscode.Webview
): string {
  const htmlPath = path.join(
    context.extensionPath,
    "src",
    "webview",
    "main.html"
  );
  let htmlContent = fs.readFileSync(htmlPath, "utf8");
  return htmlContent;
}

export function deactivate() {}
