---
Type: Dataview
QueryType: DVJS
tags:
  - DV/DVJS
  - DV/Query
self: "[[DV DVJS LIST non md#DV DVJS LIST non md]]"
readingpage: 5
---


## DV DVJS LIST non md

```dataviewjs
const folder = 'Canvas'
const nonMdFiles = app.vault.getFiles().filter(file => file.extension !== 'md' && file.path.includes(folder))
let files = dv.array(nonMdFiles.map(file => file.path)).sort((file) => file.path, "asc")
//console.log(files)
dv.list(files.map(t=> dv.fileLink(t)))

```


[[Batteries, Resistors and ohms law.pdf#page=5]]
`$="[[Batteries, Resistors and ohms law.pdf#page=" + dv.current().readingpage + "]]"`
## log

- Test
    - hi

