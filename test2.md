```dataviewjs
const ws = app.workspace.lastActiveFile
const title = dv.fileLink(ws.path)

dv.header(2, "Inlinks to " +  title)
dv.list(dv.pages("[[" + ws.basename + "]]").file.link);

dv.header(2, "About " +  title)
dv.table(["Name", "Creation Date", "Last modification"], dv.array(dv.page(ws.path)).map(p => [p.file.link, p.file.cday, p.file.mtime]))
```
