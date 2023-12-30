---
aliases: 
Type: Query
MOC:
---

status::  `$= const setPage = "Tasks Completion date"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] Create the Note ✅ 2023-10-30
- [ ] Write the YAML metadata
- [ ] Write the query
- [ ] Queries
    - [x] Grouping Tasks by completion date ✅ 2023-12-27
        - [x] Write the Query ✅ 2023-12-27
        - [x] Write the Query Metadata ✅ 2023-12-27
    - [x] Task Completion per month ✅ 2023-12-27
        - [x] Write the Query ✅ 2023-12-27
        - [x] Write the Query Metadata ✅ 2023-12-27


# Tasks Completion date


## Grouping Tasks by completion date

```js dataviewjs 
let startDate = dv.date("2023-08-01");
let endDate = dv.date("today");

let list = dv.pages()
    .file.tasks.where(t => t.completed && t.completion >= startDate && t.completion <= endDate);
    
let listg = list.groupBy(p => p.completion).map(t => dv.fileLink(t.key.toFormat("yyyy-MM-dd")) + " - "+ t.rows.length);

dv.paragraph(listg)
//console.log(listg);
```

>[!info]- Rendered
>```dataviewjs 
>let startDate = dv.date("2023-08-01");
>let endDate = dv.date("today");
>let list = dv.pages()
>    .file.tasks.where(t => t.completed && t.completion >= startDate && t.completion <= endDate);
>    
>let listg = list.groupBy(p => p.completion).map(t => dv.fileLink(t.key.toFormat("yyyy-MM-dd")) + " - "+ t.rows.length);
>
>dv.paragraph(listg)
>//console.log(listg);
>```

- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: [[dv.pages]], [[dv.date]], [[DataArray.where]], [[DataArray.groupBy]], [[dv.paragraph]]. [[date.toFormat]], [[dv.fileLink]]
    - JSfunctions:: 
    - tags:: #file/tasks 
    - image:: 

## Task Completion per month

```js
const pages = dv.pages().file.tasks.where(p => p.completed).groupBy(p=> p.completion?.month);
const header = pages.map(p => String(p.key || "null"))
let data = []
data.push(pages.map(p => p.rows.length).array())
dv.table(header, data)
```

>[!info]+ Rendered
>```dataviewjs
>const pages = dv.pages().file.tasks.where(p => p.completed).groupBy(p=> p.completion?.month);
>const header = pages.map(p => String(p.key || "null"))
>let data = []
>data.push(pages.map(p => p.rows.length).array())
>dv.table(header, data)
>```

- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: [[dv.pages]], [[DataArray.where]], [[DataArray.groupBy]], [[DataArray.map]], [[DataArray.array]], [[dv.table]]
    - JSfunctions:: [[Array.push]], [[JS String]], [[JS OR]]
    - tags:: #file/tasks 
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

