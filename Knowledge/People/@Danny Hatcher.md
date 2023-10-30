---
aliases: 
Type: Person
DOB: 1996-10-27
Adress: East Sussex
Country: UK
Email: 
Website:
  - https://www.youtube.com/@edu.science
  - https://www.youtube.com/@DannyHatcher
  - https://dannyhatcher.com
  - https://dannyhatcher.substack.com
  - https://www.patreon.com/dannyhatcher
MOC: 
Twitter: https://twitter.com/DannyHatcher
eyecolor: brown
---

status::  `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "@Danny Hatcher", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-11
- [ ] Fill out the Properties
- [ ] Write interesting stuff about that person.


# @Danny Hatcher

```dataviewjs
console.log(this)
```

## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```



