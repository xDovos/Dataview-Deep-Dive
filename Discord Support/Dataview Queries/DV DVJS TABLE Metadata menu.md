---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: "[[DV DVJS TABLE Metadata menu#DV DVJS TABLE Metadata menu inside the note]]"
---
Docs::


## DV DVJS TABLE Metadata menu inside the note

```dataviewjs
const {fieldModifier: f} = this.app.plugins.plugins["metadata-menu"].api;

dv.table(["Namn", "Type"],
 dv.pages('"Discord Support"').where(t=> t.type).map(b => [
    b.file.link,
    f(dv, b, "Type")])
)
```

### Explanation

- 

