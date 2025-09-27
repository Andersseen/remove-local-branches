import * as vscode from "vscode";

export class ActionsDataProvider
  implements vscode.TreeDataProvider<ActionItem>
{
  getTreeItem(element: ActionItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ActionItem): Thenable<ActionItem[]> {
    if (!element) {
      const openCleanerAction = new ActionItem(
        "Open Branch Cleaner",
        vscode.TreeItemCollapsibleState.None,
        {
          command: "remove-local-branches.showCleanerPage",
          title: "Open Branch Cleaner",
        }
      );
      return Promise.resolve([openCleanerAction]);
    }
    return Promise.resolve([]);
  }
}

class ActionItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.tooltip = `Click to ${this.label.toLowerCase()}`;
    this.iconPath = new vscode.ThemeIcon("rocket");
  }
}
