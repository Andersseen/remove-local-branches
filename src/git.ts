import { exec } from "child_process";
import * as vscode from "vscode";

function executeCommand(command: string): Promise<string> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceFolder) {
    return Promise.reject("Please open a project folder first.");
  }

  return new Promise((resolve, reject) => {
    exec(command, { cwd: workspaceFolder }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`, stderr);
        reject(stderr || "An unknown error occurred.");
        return;
      }
      resolve(stdout);
    });
  });
}

export async function getMergedBranches(): Promise<string[]> {
  try {
    await executeCommand("git fetch --prune");

    const remoteHead = await executeCommand(
      "git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'"
    );
    const mainBranch = remoteHead.trim();

    if (!mainBranch) {
      throw new Error("Could not determine the main branch (main/master).");
    }

    const command = `git branch --merged origin/${mainBranch}`;
    const output = await executeCommand(command);

    return output
      .split("\n")
      .map((branch) => branch.trim())
      .filter(
        (branch) =>
          branch &&
          !branch.startsWith("*") &&
          branch !== mainBranch &&
          branch !== "master" &&
          branch !== "main"
      );
  } catch (error) {
    vscode.window.showErrorMessage(`Error getting branches: ${error}`);
    return [];
  }
}

export async function deleteBranches(branches: string[]): Promise<void> {
  if (branches.length === 0) {
    return;
  }

  try {
    const command = `git branch -d ${branches.join(" ")}`;
    await executeCommand(command);
    vscode.window.showInformationMessage(
      `Successfully deleted branches: ${branches.join(", ")}`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to delete some branches. Error: ${error}`
    );
  }
}
