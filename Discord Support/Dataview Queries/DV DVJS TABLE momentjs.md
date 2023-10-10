---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["", ""]
---
docs:: 


## DV DVJS TABLE moment js sun-sat Weekly note

```dataviewjs
const pages = dv.pages('"Journal/Daily/2023"').where(t => moment(t.file.name, "YYYY-MM-DD").format("gggg-[W]ww") === "2023-W01" ).sort(t=> t.file.day, "asc")
//dv.current().file.name
const header = ["Link", "Date"]
const data = pages.map(t => [t.file.link, t.file.day.toFormat("ccc, MMM dd")])

dv.table(header, data)


```













