---
aliases: 
Type: Person
DOB: 1999-03-04
Adress: 
Country: Germany
Email: 
Website:
  - https://github.com/xDovos/Dataview-Deep-Dive
MOC: 
Twitter:
---

status::  `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "@Dovos", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-27
- [x] Fill out the Properties ✅ 2023-10-27
- [ ] Write interesting stuff about that person.


# @Dovos



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

