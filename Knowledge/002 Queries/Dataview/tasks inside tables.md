---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "tasks inside tables", "Status Tasks")`

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the Note


# tasks inside tables

## DQL version in [[Progress bar]]
![[Progress bar#DQL TABLE MOC with progress bar and checking of the tasks]]


## DVJS Table with Tasks

```dataviewjs
const path = '"Knowledge/001 Dataview/DQL/Data Commands"'
const pages = dv.pages(path)
const data = pages.map(p => [p.file.link, p.status, "`$= dv.taskList(dv.page('"+p.file.path+"').file.tasks.where(t=> !t.completed && t.section.subpath == 'Status Tasks'), false)`"])
dv.table(["File","status", "tasks"], data)


```

>[!info]- Rendered
>```dataviewjs
>
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: 
    - JSfunctions:: 
    - tags:: 
    - image:: 




## Appearances

```dataviewjs
const inlinks = dv.current().file.inlinks
const outlinks = dv.current().file.outlinks.mutate(t=> t.embed = false)
const indexA = Array.from({ length: Math.max(inlinks.length, outlinks.length) }, (_, index) => index)
const data = indexA.map((i)=> [inlinks[i] || " ", outlinks[i] || " "])
const style = "<span style='font-size:smaller;color:var(--text-muted)'>("
dv.table(["inlinks "+ style + inlinks.length +")", "outlinks "+ style + outlinks.length +")"], data)
this.container.querySelectorAll(".table-view-table tr:first-of-type th:first-of-type > span.small-text")[0].style.visibility = "hidden";
```

