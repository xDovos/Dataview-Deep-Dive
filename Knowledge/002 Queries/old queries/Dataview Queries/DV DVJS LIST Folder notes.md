

---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self:

---


## DV  DVJS LIST Folder notes under the main folder


```js dataviewjs

const mainFolders = dv.pages().where(t=> t.Type == "folder" && t.file.folder.split("/").length == 1 )
const firstSubFolders = dv.pages().where(t=> t.Type == "folder" && t.file.folder.split("/").length == 2 )
console.log(mainFolders.file.folder)
console.log(firstSubFolders.file.folder)

const list = []

const test = dv.pages().where(t=> t.file.folder && t.Type == "folder")



console.log(test)
dv.span("hi")
dv.span(String(test.file.link))

```










