---
aliases: 
Type: Query
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Combining queries", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-12-06
- [x] Write the YAML metadata ✅ 2023-12-06
- [ ] Write the query
- [ ] Queries
    - [x] Combining list queries inside a table ✅ 2023-12-24
        - [x] Write the Query ✅ 2023-12-24
        - [x] Write the Query Metadata ✅ 2023-12-24


# Combining queries


## Combining list queries inside a table

```js dataviewjs
const pages = dv.pages('!#MOC/5 and !#template and #file')

const inlinks = pages.where(t=> dv.func.contains(t.file.etags, "#file/inlinks")).file.link
const outlinks = pages.where(t=> dv.func.contains(t.file.etags, "#file/inlinks")).file.link
const lists = pages.where(t=> dv.func.contains(t.file.etags, "#file/lists")).file.link
const tasks = pages.where(t=> dv.func.contains(t.file.etags, "#file/tasks")).file.link

const maxL = Math.max(inlinks.length, outlinks.length, lists.length, tasks.length)
const indexA = Array.from({ length: maxL }, (_, index) => index)

const data = indexA.map((i)=> [inlinks[i] || " ", outlinks[i] || " ", lists[i] || " ", tasks[i] || " "])
dv.table(["inlinks", "outlinks", "lists", "tasks"], data)
```


>[!info]- Rendered
>```dataviewjs
>const pages = dv.pages('!#MOC/5 and !#template and #file')
>
>const inlinks = pages.where(t=> dv.func.contains(t.file.etags, "#file/inlinks")).file.link
>const outlinks = pages.where(t=> dv.func.contains(t.file.etags, "#file/inlinks")).file.link
>const lists = pages.where(t=> dv.func.contains(t.file.etags, "#file/lists")).file.link
>const tasks = pages.where(t=> dv.func.contains(t.file.etags, "#file/tasks")).file.link
>
>const maxL = Math.max(inlinks.length, outlinks.length, lists.length, tasks.length)
>const indexA = Array.from({ length: maxL }, (_, index) => index)
>
>const data = indexA.map((i)=> [inlinks[i] || " ", outlinks[i] || " ", lists[i] || " ", tasks[i] || " "])
>dv.table(["inlinks", "outlinks", "lists", "tasks"], data)
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: [[dv.table]], [[DataArray.map]], [[DataArray.where]], [[DataArray.length]], [[dv.pages]]
    - JSfunctions:: [[Math.max]], [[Array.from]]
    - tags:: #file/inlinks, #file/outlinks, #file/lists, #file/tasks, #file/link
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

