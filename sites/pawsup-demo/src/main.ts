import { EditorView, basicSetup, } from "codemirror"
import { pawsup } from 'pawsup'
import hljs from 'highlight.js'

const defaultContent = `

> Heading 1
>> Heading 2
>>> Heading 3
>>>> Heading 4
>>>>> Heading 5
>>>>>> Heading 6

Hello world!
This is pawsup.


- elegant
- minimal
-- delightful to look at
-- delightful to work with
-- delightful to hack on
- cute

Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, ut.

| _Goals transform a random walk into a chase._
| -Mihaly Csikszentmihalyi

Visit https://example.com for more information.


>> Table

## Species    Common name     Type
#  Cat        House Cat       Mammal
#  Dog        Dog             Mammal
#  Lizard     Monitor Lizard  Reptile
#  Fox        Red Fox         Mammal
#  Frog       Tree Frog       Amphibian

@https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Maine_Coon_cat_by_Tomitheos.JPG/330px-Maine_Coon_cat_by_Tomitheos.jpg

Maine coon from Wikipedia: https://en.wikipedia.org/wiki/Maine_Coon

\`\`\`js
const name = "John"
console.log(\`Hello \${name}\`)
\`\`\`
`.trim()

const previewView = document.querySelector('#preview') as HTMLElement
const updateListener = EditorView.updateListener.of(update => {
    if (update.docChanged) {
        const docText = update.state.doc.toString();
        console.log("Document text updated:", docText);
        updatePreview(docText)
    }
});

let debounceTimeout: ReturnType<typeof setTimeout>
function updatePreview(pawsupSrc: string) {
    const content = pawsup(pawsupSrc)
    previewView.innerHTML = content

    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
        previewView.querySelectorAll('pre code[lang]').forEach(block => {
            block.classList.add(`language-${block.getAttribute('lang')}`)
            hljs.highlightElement(block as HTMLElement)
        })
    }, 500)
}

updatePreview(defaultContent)

let editor = new EditorView({
    extensions: [//
        basicSetup,
        EditorView.lineWrapping,
        // javascript(),
        updateListener
    ],
    doc: defaultContent,
    parent: document.querySelector('#editor') as HTMLElement
})
