import * as vscode from "vscode";

class TestTagManager {
  private isDebugSessionActive: boolean;
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.isDebugSessionActive = false;
    this.config = vscode.workspace.getConfiguration();
  }

  private writeSettings(testTag: string | undefined): void {
    if (testTag === undefined) {
      this.config.update(
        "go.testTags",
        undefined,
        vscode.ConfigurationTarget.Workspace
      );
    } else {
      this.config.update(
        "go.testTags",
        testTag,
        vscode.ConfigurationTarget.Workspace
      );
    }
  }

  private detectBuildTag(content: string): string {
    const line = content.split("\n", 3)[0];
    if (line.includes("//go:build")) {
      if (line.includes("integration")) {
        return "integration";
      }
      if (line.includes("unit")) {
        return "unit";
      }
    }
    return "unit";
  }

  public updateTestTags(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor?.document.fileName.endsWith("_test.go")) {
      return;
    }

    const testTag = this.detectBuildTag(editor.document.getText());

    this.writeSettings(testTag);
    this.isDebugSessionActive = true;
    vscode.window.setStatusBarMessage(`Test tags updated to: ${testTag}`, 3000);
  }

  public isActive(): boolean {
    return this.isDebugSessionActive;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const tagManager = new TestTagManager();

  const changeDisposable = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor?.document.fileName.endsWith("_test.go")) {
        tagManager.updateTestTags();
      }
    }
  );
  context.subscriptions.push(changeDisposable);
}

export function deactivate(): void {}
