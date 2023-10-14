---
aliases: []
Type: DataCommand
MOC: "[[Dataview Overview]]"
---

status::  `$= const setPage = "FLATTEN"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] create the note ✅ 2023-08-12
- [x] Write the YAML metadata ✅ 2023-10-13
- [x] Write the query ✅ 2023-08-12
- [x] Link to the Doc Page ✅ 2023-08-13

# FLATTEN

- docs:: [command Flatten](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#flatten)
- docs:: [Expressions](https://blacksmithgu.github.io/obsidian-dataview/reference/expressions/)
- docs:: [Datatypes](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/)

in short, FLATTEN is black magic. it is really powerful but really confusing if you don't know the rules to it.

in general Flatten works by using
FLATTEN \<expression> AS \<new field name>

flatten does multiple things. 
1. it creates a new metadata field with the results of the expression as value.
2. if you flatten an array then it creates a new row per value inside the array. each row is a full duplicate of the original row except for the value the flattened field has.
    1. if you don't want it to create new rows but your expression returns an array then encase the whole expression into [ ]. this won't create the additional rows because the expression then returns an array with one value that holds the other array.
3. if you don't name the results with AS then it will overwrite the used field name or won't be accessible later in the query so i would advice to always name the result.



## FLATTEN Overview

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
>FROM -"Knowledge/001 Dataview"
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
    - image:: 


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




