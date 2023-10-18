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

