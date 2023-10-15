---
aliases: []
Type: DataCommand
MOC: "[[Dataview Overview]]"
---

status::  `$= const setPage = "GROUP BY"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] create the note ✅ 2023-08-12
- [ ] Write the YAML metadata
- [x] Write the query ✅ 2023-08-12
- [x] Link to the Doc Page ✅ 2023-08-13

# GROUP BY

- docs:: [command Group by](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#group-by)

Group by is used when you want to group the rows together by the values of a metadata field.
most of the time it is used in combination of [[FLATTEN]] because flatten creates rows and group by reduces them again into a manageable amount.
you can use Expressions in the grouping string or just name a field.
after you have used group by you need to use "rows." before each metadata field inside the headers and after the group by line.

to read more about the background data of group by then read through the [[DataArray.groupBy]] note. it goes into more detail of what is actually happening.

## DQL Overview

```js 
TABLE flat(filter(rows.L, (t) => t.text = "Query meta").children.text), embed(filter(flat(filter(rows.L, (t) => t.text = "Query meta").children), (t2) => t2.image).image)[0]
WHERE file.lists and contains(file.lists.text,"Query meta")
FLATTEN file.lists as L
WHERE !L.task
GROUP BY L.section as Sections
WHERE contains(rows.L.children.dataCommands, this.file.link)
```

>[!info]- Rendered
>```dataview
>TABLE flat(filter(rows.L, (t) => t.text = "Query meta").children.text), embed(filter(flat(filter(rows.L, (t) => t.text = "Query meta").children), (t2) => t2.image).image)[0]
>WHERE file.lists and contains(file.lists.text,"Query meta")
>FLATTEN file.lists as L
>WHERE !L.task
>GROUP BY L.section as Sections
>WHERE contains(rows.L.children.dataCommands, this.file.link)
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[WHERE]], [[FLATTEN]], [[GROUP BY]]
    - functions:: [[filter]], [[flat]], [[contains]], [[embed]], [[arrow function]]
    - tags:: 
    - image:: [[GROUP BY DQL Overview.png]]



## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```





