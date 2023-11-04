---
aliases: 
Type: function
MOC:
---

status::  `$= const setPage = "flat"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] Create the Note ✅ 2023-10-11
- [x] Write the YAML metadata ✅ 2023-11-04
- [x] add the docs page ✅ 2023-11-03
- [ ] Write the query


# flat

- docs:: [Function flat](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#flatarray-depth)

## flat Overview

```js 
TABLE flat(filter(rows.L, (t) => t.text = "Query meta").children.text) as Metadata, embed(filter(flat(filter(rows.L, (t) => t.text = "Query meta").children), (t2) => t2.image).image)[0] as Image
WHERE file.lists and contains(file.lists.text,"Query meta")
FLATTEN file.lists as L
WHERE !L.task
GROUP BY L.section as Sections
WHERE contains(rows.L.children.functions, this.file.link)
```

>[!info]- Rendered
>```dataview
>TABLE flat(filter(rows.L, (t) => t.text = "Query meta").children.text) as Metadata, embed(filter(flat(filter(rows.L, (t) => t.text = "Query meta").children), (t2) => t2.image).image)[0] as Image
>WHERE file.lists and contains(file.lists.text,"Query meta")
>FLATTEN file.lists as L
>WHERE !L.task
>GROUP BY L.section as Sections
>WHERE contains(rows.L.children.functions, this.file.link)
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[WHERE]], [[FLATTEN]], [[GROUP BY]]
    - functions:: [[filter]], [[flat]], [[contains]], [[embed]], [[arrow function]]
    - tags:: 
    - image:: [[FROM DQL Overview.png]]


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




