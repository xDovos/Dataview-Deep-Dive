---
location: "[[Discord Support/Dataview Testing/City.md|City]]"
names:
 - "name 1"
 - "name 2"
Type: Dataview_Test
---
`=this.names`

`$=dv.el("p",dv.current().names.map(name => name))`

`$= dv.span(dv.current().names)`


> [!note]+
 >| header     | header2      |
 >| ---------- | ------------ |
 >| names DQL  | `=this.names` |
 >| names DVJS | `$=dv.span(dv.current().names)`             |
 


```dataview
table rows.file.link as inlinks
FROM "Discord Support/Dataview Data/Test data"
flatten file.outlinks as out
where contains(out.eyes, "yellow")
group by out
```
