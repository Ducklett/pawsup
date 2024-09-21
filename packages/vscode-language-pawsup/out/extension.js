"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = require("vscode");
function activate(context) {
    const disposable = vscode.commands.registerCommand("pawsup.openPreview", () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const panel = vscode.window.createWebviewPanel("pawsupPreview", "Pawsup Preview", vscode.ViewColumn.Beside, { enableScripts: true });
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
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent(text) {
    // Implement your conversion logic here
    const convertedHTML = convertPawsupToHTML(text);
    return `<!DOCTYPE html>
    <html lang="en">
    <body>${convertedHTML}</body>
    </html>`;
}
function convertPawsupToHTML(text) {
    return text;
}
//# sourceMappingURL=extension.js.map