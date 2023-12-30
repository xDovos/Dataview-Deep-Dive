---
aliases: 
Type: Person
DOB: 1996-10-27
Adress: East Sussex
Country: UK
Email: 
Website:
  - https://www.youtube.com/@edu.science
  - https://www.youtube.com/@DannyHatcher
  - https://dannyhatcher.com
  - https://dannyhatcher.substack.com
  - https://www.patreon.com/dannyhatcher
MOC: 
Twitter: https://twitter.com/DannyHatcher
eyecolor: brown
---

status::  `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "@Danny Hatcher", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-11
- [ ] Fill out the Properties
- [ ] Write interesting stuff about that person.


# @Danny Hatcher

```dataviewjs
console.log(this)
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

