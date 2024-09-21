import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { pawsupInline, pawsup } from "./pawsup";
import fs from 'node:fs/promises'

describe("Inline formatting", () => {

    function validate(input: string, expectedOutput: string) {
        expect(pawsupInline(input)).toBe(expectedOutput)
    }

    test("No formatting", () => {
        const input = 'Hello world'
        const expected = 'Hello world'

        validate(input, expected)
    });

    test("Single bold", () => {
        const input = 'Hello *world*'
        const expected = `Hello <strong>world</strong>`
        validate(input, expected)
    });

    test("Multiple bold sections", () => {
        const input = 'This *word* and *another*';
        const expected = 'This <strong>word</strong> and <strong>another</strong>';
        validate(input, expected);
    });

    test("Bold at the start", () => {
        const input = '*Bold* at the start';
        const expected = '<strong>Bold</strong> at the start';
        validate(input, expected);
    });

    test("Bold at the end", () => {
        const input = 'At the end *bold*';
        const expected = 'At the end <strong>bold</strong>';
        validate(input, expected);
    });

    test("Empty bold markers", () => {
        const input = 'Hello ** world';
        const expected = 'Hello ** world'; // No replacement should happen
        validate(input, expected);
    });

    test("Bold markers with spaces inside", () => {
        const input = 'Hello *   * world';
        const expected = 'Hello *   * world'; // Should not be bolded
        validate(input, expected);
    });


    test("Bold content can contain * if surrounded by spaces", () => {
        const input = 'Math *3 * 4*';
        const expected = `Math <strong>3 * 4</strong>`;
        validate(input, expected)
    });

    test("Bold content can contain * when not surrounded by any spaces", () => {
        const input = 'Math *3*4*';
        const expected = `Math <strong>3*4</strong>`;
        validate(input, expected)
    });

    test("Bold content can contain * when directly followed by a letter", () => {
        const input = '*this is all *bold*';
        const expected = `<strong>this is all *bold</strong>`;
        validate(input, expected)
    });

    test("Single italic", () => {
        const input = 'Hello _world_'
        const expected = `Hello <em>world</em>`
        validate(input, expected)
    });

    test("Multiple italic sections", () => {
        const input = 'This _word_ and _another_';
        const expected = 'This <em>word</em> and <em>another</em>';
        validate(input, expected);
    });

    test("Italic at the start", () => {
        const input = '_Italic_ at the start';
        const expected = '<em>Italic</em> at the start';
        validate(input, expected);
    });

    test("Italic at the end", () => {
        const input = 'At the end _italic_';
        const expected = 'At the end <em>italic</em>';
        validate(input, expected);
    });

    test("Empty italic markers", () => {
        const input = 'Hello __ world';
        const expected = 'Hello __ world'; // No replacement should happen
        validate(input, expected);
    });

    test("Italic markers with spaces inside", () => {
        const input = 'Hello _   _ world';
        const expected = 'Hello _   _ world'; // Should not be italicized
        validate(input, expected);
    });

    test("Italic content can contain _ if surrounded by spaces", () => {
        const input = 'Math _3 _ 4_';
        const expected = `Math <em>3 _ 4</em>`;
        validate(input, expected)
    });

    test("Italic content can contain _ when not surrounded by any spaces", () => {
        const input = 'Math _3_4_';
        const expected = `Math <em>3_4</em>`;
        validate(input, expected)
    });

    test("Italic content can contain _ when directly followed by a letter", () => {
        const input = '_this is all _italic_';
        const expected = `<em>this is all _italic</em>`;
        validate(input, expected)
    });


    test("Single strike", () => {
        const input = 'Hello ~world~'
        const expected = `Hello <strike>world</strike>`
        validate(input, expected)
    });

    test("Multiple strike sections", () => {
        const input = 'This ~word~ and ~another~';
        const expected = 'This <strike>word</strike> and <strike>another</strike>';
        validate(input, expected);
    });

    test("Strike at the start", () => {
        const input = '~Strike~ at the start';
        const expected = '<strike>Strike</strike> at the start';
        validate(input, expected);
    });

    test("Strike at the end", () => {
        const input = 'At the end ~strike~';
        const expected = 'At the end <strike>strike</strike>';
        validate(input, expected);
    });

    test("Empty strike markers", () => {
        const input = 'Hello ~~ world';
        const expected = 'Hello ~~ world'; // No replacement should happen
        validate(input, expected);
    });

    test("Strike markers with spaces inside", () => {
        const input = 'Hello ~   ~ world';
        const expected = 'Hello ~   ~ world'; // Should not be striked
        validate(input, expected);
    });

    test("Strike content can contain ~ if surrounded by spaces", () => {
        const input = 'Math ~3 ~ 4~';
        const expected = `Math <strike>3 ~ 4</strike>`;
        validate(input, expected)
    });

    test("Strike content can contain ~ when not surrounded by any spaces", () => {
        const input = 'Math ~3~4~';
        const expected = `Math <strike>3~4</strike>`;
        validate(input, expected)
    });

    test("Strike content can contain ~ when directly followed by a letter", () => {
        const input = '~this is all ~strike~';
        const expected = `<strike>this is all ~strike</strike>`;
        validate(input, expected)
    });


    test("Single inline code", () => {
        const input = 'Use `console.log()` for debugging';
        const expected = 'Use <code>console.log()</code> for debugging';
        validate(input, expected);
    });

    test("Multiple inline code sections", () => {
        const input = 'Use `var` for variables and `const` for constants';
        const expected = 'Use <code>var</code> for variables and <code>const</code> for constants';
        validate(input, expected);
    });

    test("Inline code at the start", () => {
        const input = '`startCode()` is a function';
        const expected = '<code>startCode()</code> is a function';
        validate(input, expected);
    });

    test("Inline code at the end", () => {
        const input = 'The end function is `endCode()`';
        const expected = 'The end function is <code>endCode()</code>';
        validate(input, expected);
    });

    test("Empty inline code markers", () => {
        const input = 'Empty code here ``';
        const expected = 'Empty code here <code></code>';
        validate(input, expected);
    });

    test("Inline code markers with spaces inside", () => {
        const input = 'Space code: `   `';
        const expected = 'Space code: <code>   </code>'; // Should not be treated as code
        validate(input, expected);
    });

    test("Inline code with multiple spaces", () => {
        const input = 'Spaced code: `var x = 5;   y = 10;`';
        const expected = 'Spaced code: <code>var x = 5;   y = 10;</code>';
        validate(input, expected);
    });

    test("Inline code with other syntax inside", () => {
        const input = 'Code with syntax: `if (x > 0) { return true; }`';
        const expected = 'Code with syntax: <code>if (x > 0) { return true; }</code>';
        validate(input, expected);
    });

    test("Text in inline code is not formatted", () => {
        const input = 'Code with formatting: `*bold* _italic_ ~strike~`';
        const expected = 'Code with formatting: <code>*bold* _italic_ ~strike~</code>';
        validate(input, expected);
    });

    test("Escaped backtick in inline code", () => {
        const input = 'Code with escaped backtick: `This is not the end \\` of the code`';
        const expected = 'Code with escaped backtick: <code>This is not the end ` of the code</code>';
        validate(input, expected);
    });

    test("Multiple escaped backticks in inline code", () => {
        const input = 'Complex code: `function() { return "\\`escaped\\`"; }`';
        const expected = 'Complex code: <code>function() { return "`escaped`"; }</code>';
        validate(input, expected);
    });

    test("Escaped backtick at the start of inline code", () => {
        const input = 'Starting with escaped backtick: `\\`code`';
        const expected = 'Starting with escaped backtick: <code>`code</code>';
        validate(input, expected);
    });

    test("Escaped backtick at the end of inline code", () => {
        const input = 'Ending with escaped backtick: `code\\``';
        const expected = 'Ending with escaped backtick: <code>code`</code>';
        validate(input, expected);
    });

    test("Single http link", () => {
        const input = 'Visit http://example.com for more info';
        const expected = 'Visit <a href="http://example.com">http://example.com</a> for more info';
        validate(input, expected);
    });

    test("Single https link", () => {
        const input = 'Visit https://example.com for more info';
        const expected = 'Visit <a href="https://example.com">https://example.com</a> for more info';
        validate(input, expected);
    });

    test("Multiple links", () => {
        const input = 'Visit http://example.com and https://another-example.com';
        const expected = 'Visit <a href="http://example.com">http://example.com</a> and <a href="https://another-example.com">https://another-example.com</a>';
        validate(input, expected);
    });

    test("Link at the start of the string", () => {
        const input = 'https://start-example.com is a good site';
        const expected = '<a href="https://start-example.com">https://start-example.com</a> is a good site';
        validate(input, expected);
    });

    test("Link at the end of the string", () => {
        const input = 'Check out this site: http://end-example.com';
        const expected = 'Check out this site: <a href="http://end-example.com">http://end-example.com</a>';
        validate(input, expected);
    });

    test("Link with path and query parameters", () => {
        const input = 'Complex URL: https://example.com/path?param1=value1&param2=value2';
        const expected = 'Complex URL: <a href="https://example.com/path?param1=value1&param2=value2">https://example.com/path?param1=value1&param2=value2</a>';
        validate(input, expected);
    });

    test("Link within other formatting", () => {
        const input = 'This is *bold with a https://example.com link*';
        const expected = 'This is <strong>bold with a <a href="https://example.com">https://example.com</a> link</strong>';
        validate(input, expected);
    });

    test("Invalid protocol should not be linked", () => {
        const input = 'This ftp://example.com should not be a link';
        const expected = 'This ftp://example.com should not be a link';
        validate(input, expected);
    });

    test("URL without protocol should not be linked", () => {
        const input = 'This www.example.com should not be a link';
        const expected = 'This www.example.com should not be a link';
        validate(input, expected);
    });
});

describe("Block formatting", () => {
    function validate(input: string, expectedOutput: string) {
        expect(pawsup(input)).toBe(expectedOutput)
    }

    test("Basic", () => {
        const input = "Hello world"
        const expectedOutput = "<p>Hello world</p>"
        validate(input, expectedOutput)
    })

    test("Simple heading", () => {
        const input = src`
    > Hello world

    Welcome to pawsup.`
        const expectedOutput = src`
    <h1>Hello world</h1>
    <p>Welcome to pawsup.</p>`
        validate(input, expectedOutput)
    })

    test("All headings together", () => {
        const input = src`
                > Heading 1
                >> Heading 2
                >>> Heading 3
                >>>> Heading 4
                >>>>> Heading 5
                >>>>>> Heading 6
                `
        const expectedOutput = src`
                <h1>Heading 1</h1>
                <h2>Heading 2</h2>
                <h3>Heading 3</h3>
                <h4>Heading 4</h4>
                <h5>Heading 5</h5>
                <h6>Heading 6</h6>
                `
        validate(input, expectedOutput)
    })

    test("All headings spaced", () => {
        const input = src`
        > Heading 1

        >> Heading 2


        >>> Heading 3



        >>>> Heading 4




        >>>>> Heading 5





        >>>>>> Heading 6
        `
        const expectedOutput = src`
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
        `
        validate(input, expectedOutput)
    })

    // TODO: more tests with inline formatting within blocks
    test("Two paragraphs", () => {
        const input = src`
                paragraph 1

                paragraph 2
                `
        const expectedOutput = src`
                <p>paragraph 1</p>
                <p>paragraph 2</p>
                `
        validate(input, expectedOutput)
    })

    test("Newline inserts break", () => {
        const input = src`
                a paragraph
                split across lines

                `
        const expectedOutput = src`
                <p>a paragraph<br>
                split across lines</p>
                `
        validate(input, expectedOutput)
    })

    test("Backslash continues line", () => {
        const input = src`
                a paragraph \\
                split across lines
                `
        const expectedOutput = src`
                <p>a paragraph split across lines</p>
                `
        validate(input, expectedOutput)
    })

    test("compact article", () => {
        const input = src`
                > My article
                _By Tom Smith_
                >> Section 1
                a paragraph
                paragraph continued

                paragraph 2 continued
                >> Section 2
                more text
                continued on next line
                `
        const expectedOutput = src`
                <h1>My article</h1>
                <p><em>By Tom Smith</em></p>
                <h2>Section 1</h2>
                <p>a paragraph<br>
                paragraph continued</p>
                <p>paragraph 2 continued</p>
                <h2>Section 2</h2>
                <p>more text<br>
                continued on next line</p>
                `
        validate(input, expectedOutput)
    })

    test("Basic list", () => {
        const input = "- Item 1\n- Item 2\n- Item 3";
        const expected = "<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li>\n</ul>";
        validate(input, expected);
    });

    test("Nested list", () => {
        const input = src`
                - Item 1
                -- Nested 1
                -- Nested 2
                - Item 2
                `
        const expected = src`
                <ul>
                <li>Item 1</li>
                <ul>
                <li>Nested 1</li>
                <li>Nested 2</li>
                </ul>
                <li>Item 2</li>
                </ul>
                `

        validate(input, expected);
    });

    test("Multiple lists", () => {
        const input = src`
            - List 1 Item 1
            - List 1 Item 2

            Some text

            - List 2 Item 1
            - List 2 Item 2

            - List 3 Item 1
            - List 3 Item 2
        `;
        const expected = src`
            <ul>
            <li>List 1 Item 1</li>
            <li>List 1 Item 2</li>
            </ul>
            <p>Some text</p>
            <ul>
            <li>List 2 Item 1</li>
            <li>List 2 Item 2</li>
            </ul>
            <ul>
            <li>List 3 Item 1</li>
            <li>List 3 Item 2</li>
            </ul>
        `;

        validate(input, expected);
    });

    test("Basic blockquote", () => {
        const input = src`
        | this is a blockquote
        | continued on new line

        | this is
        | also a blockquote
        `
        const expectedOutput = src`
        <blockquote>this is a blockquote
        continued on new line</blockquote>
        <blockquote>this is
        also a blockquote</blockquote>
        `
        validate(input, expectedOutput)
    })

    test("Multiple blockquotes without double newline", () => {
        const input = src`
        | one quote

        | another separate quote
        `
        const expectedOutput = src`
        <blockquote>one quote</blockquote>
        <blockquote>another separate quote</blockquote>
        `
        validate(input, expectedOutput)
    })

    test("Horizontal rule", () => {
        const input = src`
        paragraph 1
        ===
        paragraph 2
        `
        const expectedOutput = src`
        <p>paragraph 1</p>
        <hr>
        <p>paragraph 2</p>
        `
        validate(input, expectedOutput)
    })

    test("Horizontal rule with more =", () => {
        const input = src`
        paragraph 1
        ====================
        paragraph 2
        `
        const expectedOutput = src`
        <p>paragraph 1</p>
        <hr>
        <p>paragraph 2</p>
        `
        validate(input, expectedOutput)
    })

    test("Not enough = mean not a horizontal rule", () => {
        const input = src`
        paragraph 1
        ==
        also paragraph 1
        `
        const expectedOutput = src`
        <p>paragraph 1<br>
        ==<br>
        also paragraph 1</p>
        `
        validate(input, expectedOutput)
    })

    test("Image embed", () => {
        const input = src`
        this is an image:
        @https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/1920px-Felis_catus-cat_on_snow.jpg
        `
        const expectedOutput = src`
        <p>this is an image:</p>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/1920px-Felis_catus-cat_on_snow.jpg">
        `
        validate(input, expectedOutput)
    })

    test("Comment is not emitted", () => {
        const input = src`
        this is a comment:
        // I will not be seen by readers
        `
        const expectedOutput = src`
        <p>this is a comment:</p>
        `
        validate(input, expectedOutput)
    })
    test("Comments break up paragraphs", () => {
        const input = src`
        this is a comment:
        // I will not be seen by readers
        a new paragraph under it
        `
        const expectedOutput = src`
        <p>this is a comment:</p>
        <p>a new paragraph under it</p>
        `
        validate(input, expectedOutput)
    })

    test("Basic table", () => {
        const input = src`
        ## Col 1    Col 2    Col 3
        #  This     Is       A
        #  Table    So       Cool  
        `
        const expectedOutput = src`
        <table>
        <thead><tr><th>Col 1</th><th>Col 2</th><th>Col 3</th></tr></thead>
        <tbody>
        <tr><td>This</td><td>Is</td><td>A</td></tr>
        <tr><td>Table</td><td>So</td><td>Cool</td></tr>
        </tbody>
        </table>
        `
        validate(input, expectedOutput)
    })

    test("Basic code block", () => {
        const input = src`
        \`\`\`
        const name = "John"

        console.log(\`Hello \${name}!\`)
        \`\`\`
        `
        const expectedOutput = src`
        <pre><code>const name = "John"
        
        console.log(\`Hello \${name}!\`)</code></pre>
        `
        validate(input, expectedOutput)
    })

    test("Code block with language annotation", () => {
        const input = src`
        \`\`\`js
        const name = "John"

        console.log(\`Hello \${name}!\`)
        \`\`\`
        `
        const expectedOutput = src`
        <pre><code lang="js">const name = "John"
        
        console.log(\`Hello \${name}!\`)</code></pre>
        `
        validate(input, expectedOutput)
    })
})

describe("Meta", () => {
    test("Lib size", async () => {
        await Bun.build({
            entrypoints: ['./pawsup.ts'],
            outdir: './out',
            minify: true, // default false
        })
        const out = Bun.gzipSync(await Bun.file('./out/pawsup.js').bytes())
        const zippedSize = out.length;
        (globalThis as any).zippedSize = zippedSize

        // TODO: put this back down once we have all the features in and sizecoded the lib
        expect(zippedSize).toBeLessThanOrEqual(4000)
        fs.rm('./out', { force: true, recursive: true })
    })

})

afterAll(async () => {
    console.log('')
    console.log('\x1b[1m\x1b[36mLib size (minified+gzip)\x1b[0m', `\x1b[33m${(globalThis as any).zippedSize}b`);
})

function src(strings: TemplateStringsArray, ...values: any[]): string {
    const result = String.raw({ raw: strings }, ...values);

    const lines = result.split(/\r?\n/);

    // Find the minimum indent, ignoring empty lines
    const minIndent = lines
        .filter(line => line.trim())
        .reduce((min, line) => {
            const match = line.match(/^[ \t]*/);
            const indent = match ? match[0].length : 0;
            return Math.min(min, indent);
        }, Infinity);

    // Remove the minimum indent from all lines
    const cleanedLines = lines.map(line => line.replace(new RegExp(`^[ \t]{0,${minIndent}}`), ''));

    const trimmed = cleanedLines.join('\n').trim();

    const cleaned = trimmed.replace(/[ \t]+(\r?\n|$)/gm, '$1');

    return cleaned;
}
