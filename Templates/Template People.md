---
aliases: 
Type: Person
DOB: 
Adress: 
Country: 
Email: 
Website: 
MOC: 
Twitter:
---

status::  `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "<%tp.file.title%>", "Status Tasks")`

###### Status Tasks
- [ ] Create the Note
- [ ] Fill out the Properties
- [ ] Write interesting stuff about that person.


# <%tp.file.title%>



## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```



