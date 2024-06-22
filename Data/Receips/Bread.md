---
aliases: 
Type: Recipe
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Bread", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2024-06-21
- [x] Write the YAML metadata ✅ 2024-06-21
- [ ] Write the Note


# Bread



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

