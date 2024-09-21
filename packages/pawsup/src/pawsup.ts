/*
## This software is available under 2 licenses -- choose whichever you prefer.

ALTERNATIVE A - MIT License
Copyright (c) 2017 Ivy Dingeman
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

ALTERNATIVE B - Public Domain (www.unlicense.org)
This is free and unencumbered software released into the public domain.
Anyone is free to copy, modify, publish, use, compile, sell, or distribute this
software, either in source code form or as a compiled binary, for any purpose,
commercial or non-commercial, and by any means.
In jurisdictions that recognize copyright laws, the author or authors of this
software dedicate any and all copyright interest in the software to the public
domain. We make this dedication for the benefit of the public at large and to
the detriment of our heirs and successors. We intend this dedication to be an
overt act of relinquishment in perpetuity of all present and future rights to
this software under copyright law.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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
            while (!/^```/.test(lines[i])) {
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

export function paw(strings: TemplateStringsArray, ...values: any[]) {
    return strings.reduce((result, str, i) => result + str + (values[i] || ''), '');
}

export { pawsup, pawsupInline }
