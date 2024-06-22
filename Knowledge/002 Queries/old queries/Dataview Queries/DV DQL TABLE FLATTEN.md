---
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: ["",""]
---
docs::


## DV DQL TABLE FLATTEN Combining of 2 arrays while flattening them

```dataview
Table L.start,  L.end , L
FROM "Discord Support/Dataview Data/Test data"
where start

flatten map([0,1,2,3,4] , (t)=> {start: start[t], end: end[t]}) as L
where L.start

```

### Explanation

- It doesn't work
- it removes rows with non array values for some reason because of the map function
- i don't get the end to just map to the start in the order they are. end[i] doesn't work for some reason
- solution: [[DV DVJS TABLE map#DV DVJS TABLE flattening and mapping 2 arrays together]] 


## DV DQL TABLE FLATTEN Daily notes log 

```dataview
table rows.L.text
from "Journal"
flatten file.lists as L
where contains(meta(L.section).subpath, "things")
group by file.link
limit 5
```































