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
  const convertedHTML = pawsup(text);
  return `<!DOCTYPE html>
    <html lang="en">
    <body>${convertedHTML}</body>
    </html>`;
}

// NOTE: copypaste from the main lib because vscode does not support es modules
function pawsupInline(input: string): string {
  let result = '';
  let i = 0;
  let tag;

  while (i < input.length) {
    let char = input[i];

    if ((tag = char === '*' ? 'strong' : char === '_' ? 'em' : char === '~' ? 'strike' : '') && (i === 0 || !/\s/.test(input[i + 1]))) {
      let end = -1
      for (let j = i + 1; j < input.length; j++) {
        if (input[j] === char && !/[\s\\]/.test(input[j - 1] ?? ' ') && /[\s_*~`]/.test(input[j + 1] ?? ' ')) {
          end = j; break;
        }
      }

      if (end !== -1) {
        let content = input.slice(i + 1, end)
        if (!content.trim()) result += char + char
        else {
          result += `<${tag}>${pawsupInline(content)}</${tag}>`;
        }
        i = end + 1;
        continue;
      }
    } else if (char === '`' && /\s/.test(input[i - 1] ?? ' ')) {
      let end = -1
      for (let j = i + 1; j < input.length; j++) {
        if (input[j] === '`' && !/[\\]/.test(input[j - 1] ?? ' ')) {
          end = j;
          break;
        }
      }
      if (end !== -1) {
        tag = 'code'
        let code = input.slice(i + 1, end).replace(/\\`/g, '`');
        result += `<${tag}>${code}</${tag}>`;
        i = end + 1;

        continue;
      }
    } else if (/^https?:\/\/[a-zA-Z0-9\-]/.test(input.slice(i))) {
      let j = i;
      while (j < input.length && !/\s/.test(input[j])) j++;
      let url = input.slice(i, j);
      result += `<a href="${url}">${url}</a>`;
      i = j;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

function pawsup(input: string): string {
  let lines: string[] = []

  let _lines = input.split('\n')
  for (let i = 0; i < _lines.length; i++) {
    let line = _lines[i]
    while (_lines[i] && /\\$/.test(_lines[i])) {
      line = line.slice(0, -1) + (_lines[++i] ?? '')
    }
    lines.push(line)
  }

  let output: string[] = []
  let listIndent = 0
  let pAcc = '';
  let commitP = () => {
    if (pAcc.trim()) output.push(`<p>${pawsupInline(pAcc.trim().replace(/\n/g, '<br>\n'))}</p>`)
    pAcc = ''
  }

  for (let i = 0; i < lines.length;) {
    let block = lines[i++]

    if (/^>/.test(block)) {
      commitP()
      let hashes = 0
      while (block[hashes] == '>') hashes++
      output.push(`<h${hashes}>${pawsupInline(block.slice(hashes).trim())}</h${hashes}>`)
    } else if (/^\|\s/.test(block)) {
      commitP()
      while (/^\|\s/.test(lines[i])) {
        block += '\n' + lines[i].slice(2)
        i++
      }
      output.push(`<blockquote>${pawsupInline(block.slice(1).trim())}</blockquote>`)
    } else if (/^\=\=\=\=*$/.test(block)) {
      commitP()
      output.push(`<hr>`)
    } else if (/^\/\/.*$/.test(block)) {
      commitP()
      // comment, push nothing
    } else if (/^@\S*$/.test(block)) {
      commitP()
      block = block.slice(1)
      if (/^https?:\/\/.*\.(jpg|png|gif|webp)(\?.*)?$/.test(block)) {
        output.push(`<img src="${block}">`)
      }
    } else if (/^```/.test(block)) {
      let maybeLang = block.match(/```(\w*)/)![1]
      let lang = maybeLang ? ` lang="${maybeLang}"` : ''
      commitP()
      block = ''
      while (!/^```/.test(lines[i] ?? '```')) {
        block += '\n' + lines[i]
        i++
      }
      i++
      output.push(`<pre><code${lang}>${block.trim()}</code></pre>`)
    } else if (/^##?\s/.test(block)) {
      commitP()
      let acc = "<table>\n"
      let entries = ''
      if (/^##/.test(block)) {
        acc += `<thead><tr>${block.slice(2).trim().split(/\s\s+/).map(cell => `<th>${pawsupInline(cell.trim())}</th>`).join('')}</tr></thead>\n`
      } else {
        entries += block.slice(2)
      }

      while (/^#\s/.test(lines[i])) {
        entries += '\n' + lines[i].slice(2)
        i++
      }
      acc += `<tbody>\n${entries.trim().split('\n').map(row =>
        `<tr>${row.split(/\s\s+/).map(cell => `<td>${pawsupInline(cell.trim())}</td>`).join('')}</tr>`
      ).join('\n')

        }\n</tbody>\n</table>`
      output.push(acc)
    } else if (/^-/.test(block)) {
      commitP()

      while (lines[i] && !(/^[\s]/.test(lines[i]))) {
        block += '\n' + lines[i]
        i++
      }
      let listLines = block.split('\n')
      let acc = ''
      let inLi = false
      for (let line of listLines) {
        if (/^-/.test(line)) {
          if (inLi) acc += '</li>\n'
          let dashes = 0 // count the dashes
          for (let j = 0; line[j] == '-'; j++) dashes++
          let indentDelta = dashes - listIndent
          while (indentDelta < 0) {
            indentDelta++
            acc += '</ul>\n'
          }
          while (indentDelta > 0) {
            indentDelta--
            acc += '<ul>\n'
          }
          acc += '<li>' + line.slice(dashes + 1).trim()
          inLi = true
          listIndent = dashes
        } else {
          acc += line
        }
      }
      if (inLi) acc += '</li>\n'
      while (listIndent > 0) {
        listIndent--
        acc += '</ul>'
      }
      output.push(acc)
    } else {
      if (!block.trim()) {
        // it was an empty line, commit the previous paragraph
        commitP()
      } else {
        // concat the the existing paragraph
        pAcc += block + '\n'
      }
    }
  }
  commitP()

  return output.join('\n')
}
