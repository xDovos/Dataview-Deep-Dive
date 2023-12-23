---
aliases: 
Type: Query
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Combining list queries", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-12-06
- [x] Write the YAML metadata ✅ 2023-12-06
- [ ] Write the query


# Combining list queries


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

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




