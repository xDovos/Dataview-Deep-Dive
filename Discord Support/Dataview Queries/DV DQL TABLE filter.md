---
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: "[[DV DQL TABLE filter#DV DQL TABLE filter inside header]]"
---


## DV DQL TABLE filter inside header

- [ ] test
- [x] test23 ✅ 2023-01-08
      
```dataview
table filter(file.tasks, (t) => t.status = "x").text
where file.path = this.file.path

```


## DV DQL TABLE filter nested metadata

```dataview
Table filter(meta, (t)=> t.Q = "col1").A as "stuff", filter(meta, (t)=> t.Q = "col2").A
From "Discord Support/Dataview Data"
where meta
where contains(meta.Q, "col1") or contains(meta.Q, "col2")
```
