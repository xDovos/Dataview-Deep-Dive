---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["", ""]
---
docs:: 

## DV DVJS md embeds


`$= dv.el("p","![[" + dv.page("test data 1").file.link.path + "]]")`

```dataviewjs
dv.pages('"Discord Support/Dataview Data/Daily notes"').forEach(i => {dv.el("p","![[" + i.file.link.path + "]]")})
```















