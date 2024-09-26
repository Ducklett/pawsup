# Pawsup

A tiny markdown inspired markup language built around the following principles:

- Intuitive, human readable syntax that's minimally whitepsace dependend. [1]
- Implementation simplicity. The compiler is just 172 lines of typescript. **(1.3kb gzipped)**
- Forkable. Need custom embeds or a new primitive? Vendor the library and add your code! It's all in a single file.
- Content driven. Sepcifying style or layout is out of scope.

## Demo

https://pawsup.shale.tools/

## Examples

### Inline Parser

Good for when you want to enable simple markup for plain text fields.

```paw
This is a single line of pawsup. It can do *bold*, ~strikethrough~, `code`, _italics_ or *_a combination of these_*
```

```html
This is a single line of pawsup. It can do <strong>bold</strong>,
<s>strikethrough</s>, <code>code</code>, <em>italics</em> or
<strong><em>a combination of these</em></strong>
```

### Document Parser

Good for blog posts, docs, etc.

```paw
> Pawsup demo

Hello world!
This is pawsup.

- elegant
- minimal
-- delightful to look at
-- delightful to work with
-- delightful to hack on
- cute

| This is a quote

>> Table

## Species    Common name     Type
#  Cat        House Cat       Mammal
#  Dog        Dog             Mammal
#  Lizard     Monitor Lizard  Reptile
#  Fox        Red Fox         Mammal
#  Frog       Tree Frog       Amphibian

````

Output:

```html
<h1>Pawsup demo</h1>
<p>
  Hello world!<br />
  This is pawsup.
</p>
<ul>
  <li>elegant</li>
  <li>minimal</li>
  <ul>
    <li>delightful to look at</li>
    <li>delightful to work with</li>
    <li>delightful to hack on</li>
  </ul>
  <li>cute</li>
</ul>

<h2>Table</h2>
<table>
  <thead>
    <tr> <th>Species</th> <th>Common name</th> <th>Type</th> </tr>
  </thead>
  <tbody>
    <tr> <td>Cat</td> <td>House Cat</td> <td>Mammal</td> </tr>
    <tr> <td>Dog</td> <td>Dog</td> <td>Mammal</td> </tr>
    <tr> <td>Lizard</td> <td>Monitor Lizard</td> <td>Reptile</td> </tr>
    <tr> <td>Fox</td> <td>Red Fox</td> <td>Mammal</td> </tr>
    <tr> <td>Frog</td> <td>Tree Frog</td> <td>Amphibian</td> </tr>
  </tbody>
</table>
```

---

## Notes

**[ 1 ]** Pawsup uses semantic whitespace in a few places where it makes logical sense:

- A single line break also inserts a line break in the rendered document
- A double line break starts a new paragraph
- Inline formatting like `*bold*` is only applied when not surrounded by whitespace. So `3 * 4 * 5` renders as-is while `3 *4* 5` renders the 4 in bold.
- Table rows expect two or more spaces between row entries, this is to allow for single spaces without any escape sequenses.
