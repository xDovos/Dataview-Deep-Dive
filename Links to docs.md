---
aliases: []
Type: 
MOC:
---

status::  `$= const setPage = "Links to docs"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [ ] Write the YAML metadata
- [ ] Write the query

```dataviewjs
console.log(dv.current())
```
# Links to docs

## Links to the Docs

```js dataview
Table rows.L.docs as Docs
Flatten file.lists as L
where L.docs
Group by L.section as Section
```

>[!info]- Rendered
>```dataview
>Table rows.Section,  flat(rows.rows.L.docs) as Docs
>where docs
>Flatten file.lists as L
>where L.docs
>FLATTEN [choice((meta(L.section).subpath = L.link.file.name ), L.link.file.link, L.section)] as L2
>Group by L2 as Section
>FLATTEN [map(rows, (r) => reverse(split(r.file.folder, "/"))[0])[0]] as Type
>group by Type as Type
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[FLATTEN]], [[WHERE]], [[GROUP BY]]
    - functions:: 
    - tags:: #file/lists, #file/lists/section
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

