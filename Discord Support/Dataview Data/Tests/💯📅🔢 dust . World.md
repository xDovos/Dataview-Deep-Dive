```dataviewjs
function noEmotes(filename) {
  const emoteRegex = /^([\p{Emoji_Presentation}]+ )?(.*)/u; 
  return filename.replace(emoteRegex, '$2');
}

const pages = dv.pages('"Tests"')
        .where(t=> t.file.path!= dv.current().file.path && t.file.name.split(".").length == 3)
        .where(t=> noEmotes(t.file.name).includes(noEmotes(dv.current().file.name)))
        ;

const data = pages.map(t=> [t.file.link])
dv.table(["Notes"], data)

```
