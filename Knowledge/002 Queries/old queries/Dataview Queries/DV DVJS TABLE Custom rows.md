---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["", ""]
---
docs:: 

## DV DVJS TABLE custom Rows

```dataviewjs
let data = [
    [dv.header(3,"Finish this today please"), [dv.fileLink(dv.date("today").toFormat("yyyy-MM-dd ccc")),"NA"]],
    ["NA", dv.date("today")]
] 
console.log(data)
dv.table(false, data)

```

















necessar