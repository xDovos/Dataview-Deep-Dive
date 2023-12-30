---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Side bar query note", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-30
- [ ] Write the YAML metadata
- [ ] Write the query
- [ ] Queries


# Side bar query note

this note shows what note is currently focused on and some data about that note like the inlinks and the table about the current note.
this works by putting this note into the side bar and then click into the other note.
you have to wait until the query refreshes automatically (it might trigger faster by typing into the other note).

```dataviewjs
const ws = app.workspace.lastActiveFile
const title = dv.fileLink(ws.path)

dv.header(2, "Inlinks to " +  title)
dv.list(dv.pages("[[" + ws.basename + "]]").file.link);

dv.header(2, "About " +  title)
dv.table(["Name", "Creation Date", "Last modification"], dv.array(dv.page(ws.path)).map(p => [p.file.link, p.file.cday, p.file.mtime]))
```



## Appearances

```dataviewjs
const inlinks = dv.current().file.inlinks
const outlinks = dv.current().file.outlinks.mutate(t=> t.embed = false)
const indexA = Array.from({ length: Math.max(inlinks.length, outlinks.length) }, (_, index) => index)
const data = indexA.map((i)=> [inlinks[i] || " ", outlinks[i] || " "])
const style = "<span style='font-size:smaller;color:var(--text-muted)'>("
dv.table(["inlinks "+ style + inlinks.length +")", "outlinks "+ style + outlinks.length +")"], data)
this.container.querySelectorAll(".table-view-table tr:first-of-type th:first-of-type > span.small-text")[0].style.visibility = "hidden";
```

