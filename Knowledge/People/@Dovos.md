---
aliases: 
Type: Person
DOB: 1999-03-04
Adress: 
Country: Germany
Email: 
Website:
  - https://github.com/xDovos/Dataview-Deep-Dive
MOC: 
Twitter:
---

status::  `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "@Dovos", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-27
- [x] Fill out the Properties ✅ 2023-10-27
- [ ] Write interesting stuff about that person.


# @Dovos



## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```



