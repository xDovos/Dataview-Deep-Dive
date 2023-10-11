---
aliases: 
Type: Person
DOB: 2023-10-10
Adress: 
Country: Netherlands
Email: 
Website: 
MOC: 
Twitter: "@dbarenholz"
---

status::  `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "@Daniel @NL", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-11
- [ ] Fill out the Properties
- [ ] Write interesting stuff about that person.


# @Daniel @NL


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```



