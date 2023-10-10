---
aliases: []
Type: 
MOC:
---

status::  `$= const setPage = "Dataview"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [ ] Write the Definition
- [ ] Write the YAML metadata
- [ ] 
- [ ] 
- [ ] 

# Dataview Overview

## DQL Data Command Overview

```js 
TABLE flat(filter(rows.L, (t) => t.text = "Query meta").children.text) as "Query Metadata", embed(filter(flat(filter(rows.L, (t) => t.text = "Query meta").children), (t2) => t2.image).image)[0] as "Query Image"
FROM "Knowledge/Dataview/DQL/Data Commands"
WHERE file.lists and contains(file.lists.text,"Query meta")
FLATTEN file.lists as L
WHERE !L.task
GROUP BY link(meta(L.section).path) as Sections
WHERE contains(rows.MOC.file.link, this.file.link)
```

>[!info]- Rendered
>```dataview
>TABLE flat(filter(rows.L, (t) => t.text = "Query meta").children.text) as "Query Metadata", embed(filter(flat(filter(rows.L, (t) => t.text = "Query meta").children), (t2) => t2.image).image)[0] as "Query Image"
>FROM "Knowledge/Dataview/DQL/Data Commands"
>WHERE file.lists and contains(file.lists.text,"Query meta")
>FLATTEN file.lists as L
>WHERE !L.task
>GROUP BY link(meta(L.section).path) as Note
>WHERE contains(rows.MOC.file.link, this.file.link)
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[WHERE]], [[FLATTEN]], [[GROUP BY]]
    - functions:: [[filter]], [[flat]], [[contains]], [[embed]], [[arrow function]]
    - tags:: 
    - image:: 


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




