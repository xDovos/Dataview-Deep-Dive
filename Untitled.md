
hello world 
🪙🪙🪙 stuff here
🪙
🪙🪙🪙🪙

```dataviewjs
// load the conent of the current note
let note = await dv.io.load(dv.current().file.path);

// regex the coin emote out of all text including this codeblock, thus -1 is needed
const pattern = /🪙/g;
const matches = note.match(pattern).length -1 ;

// writing the rendered output.
dv.header(2, "Coin Emoji Counter");
dv.paragraph("<progress max = 50 value = "+ matches +"></progress>")
dv.paragraph(matches + " coin"+ (matches >= 2 ? "s" : "") + " found" )

```
🪙🪙🪙

🪙🪙🪙
