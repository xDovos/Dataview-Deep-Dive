---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Metadata", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-21
- [ ] Write the YAML metadata
- [ ] Write the query


# Metadata Types

- docs:: [Metadata Types](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/)

## Strings 


## Numbers


## Boolean


## Objects


### Arrays


### Links



### Dates


### Durations


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

