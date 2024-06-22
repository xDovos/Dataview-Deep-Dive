---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["", ""]
---
docs:: 
[[petr]]
[[DV DVJS TABLE Links]]
[[Webnovel Library]]

`$=console.log(dv.current().file.outlinks)`

## DV DQL TABLE unresolved links


```js dataview
table rows.file.link as "Linked in"
flatten file.outlinks as out
where !out.file and !contains(meta(out).path, ".")
group by out as "Ghost Link"
Sort length(rows.file.link) desc
limit 50
```
















