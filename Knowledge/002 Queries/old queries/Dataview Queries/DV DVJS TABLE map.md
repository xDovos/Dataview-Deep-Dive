---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["", ""]
---
docs:: 

## DV DVJS TABLE flattening and mapping 2 arrays together 
```dataviewjs
function newRow(link, start, end) {
    let data = []
    if(dv.isArray(start)){
        for (let i in start) {
            data.push({"link": link, "start": start[i], "end": end[i]})
        }
    }else{
        data.push({"link": link, "start": start, "end": end})
    }
    return data

}

const pages = dv.pages('"Discord Support/Dataview Data/Test data"').where((t)=> t.start).sort(t=> t.file.name, "asc")

let temp = pages.map((t) => newRow(t.file.link, t.start, t.end)).array().flat()
temp = dv.array(temp).sort(t => t.start, "asc")
const data = temp.map(t=> [t.link, t.start, t.end])

dv.table(["link", "start", "end"],data)
```



```dataview
TABLE start, end
from "Discord Support/Dataview Data/Test data"
```

