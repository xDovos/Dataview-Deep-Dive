---
Alias: [BC, BigCo]
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: ["",""]
---
docs::
status1:: reading, listening
status2:: reading
status2:: listening

```dataview
table status1, typeof(status1), status2, typeof(status2)
where file.name = this.file.name

```




```dataview
Table employer
From "Discord Support/Dataview Data"
where any(this.file.aliases, (t)=> employer = t)
```
































