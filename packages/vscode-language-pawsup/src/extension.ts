import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "pawsup.openPreview",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const panel = vscode.window.createWebviewPanel(
          "pawsupPreview",
          "Pawsup Preview",
          vscode.ViewColumn.Beside,
          { enableScripts: true }
        );

        // Update the preview content
        const updateWebview = () => {
          panel.webview.html = getWebviewContent(editor.document.getText());
        };

        updateWebview();

        // Update content when the document changes
        vscode.workspace.onDidChangeTextDocument((event) => {
          if (event.document === editor.document) {
            updateWebview();
          }
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(text: string): string {
  // Implement your conversion logic here
  const convertedHTML = convertPawsupToHTML(text);
  return `<!DOCTYPE html>
    <html lang="en">
    <body>${convertedHTML}</body>
    </html>`;
}

function convertPawsupToHTML(text: string): string {
  return text;
}
