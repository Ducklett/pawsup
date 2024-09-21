# pawsup

This is the implementation of pawsup.

See https://github.com/Ducklett/pawsup for more general information about the language.

## Install

```sh
npm install pawsup
```

## Usage

```ts
import { pawsupInline, pawsup } from "./pawsup";

const singleLine = pawsupInline("This is a _formatted_ line. *Wow!*");
// output: This is a <em>formatted line</em>. <strong>Wow!</strong>

const doc = pawsup(`
> Hello pawsup

This is the document parser.
`);

// output:
// <h1>Hello pawsup</h1>
// <p>This is the document parser.</p>
```
