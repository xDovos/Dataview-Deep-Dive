---
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: "[[DV DQL TASK Query#DV DQL TASK Grouping by section]]"
---
Docs::

- [!] test

## DV DQL TASK Grouping by section

```dataview
TASK 
FROM "Discord Support/Dataview Data/Project"

```



## DV DQL TASK custom status 

```dataview
Task
where file.path = this.file.path
where status = "!"
where checked
```

