---
aliases: []
Type: DataCommand
MOC: "[[Dataview Overview]]"
---
status::  `$= const setPage = "WHERE"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] create the note ✅ 2023-08-12
- [ ] Write the YAML metadata
- [x] Write the query ✅ 2023-08-12
- [x] Link to the Doc Page ✅ 2023-10-13

# WHERE

- docs:: [commands Where](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#where)
- docs:: [Datatypes](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/)
- docs:: [Expressions](https://blacksmithgu.github.io/obsidian-dataview/reference/expressions/)
- docs:: [DQL functions](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/)

Where works like an IF condition on the files selected by the FROM. 
you can use logic (AND, OR, =, !=, >=, <=, !field (field != nullish)) ,functions, metadata, array and string manipulation inside it.  
you can use as many as you want. if you use multiple behind each other then it is like using an AND between them. 
it is sometimes better to use two where instead of AND if you want to make sure a field is present (important for nested metadata conditions).

Where can be used anywhere in the query after the FROM if present.
It is your main way of filtering your data inside DQL.
one of the most important functions for the WHERE is [[contains]]

>[!note]+ 
>The datatype has to match or it will return false. That means you can't compare:
>array and String
>number and string 
>date and string/number
>link and string
>that means often that you have to convert one of the values into the other datatype before the WHERE works as expected

>[!hint]- 
>In some cases you want to use the filter() function inside the header to filter an Array without affecting the remaining data. more to that here [[filter]]

## WHERE Overview

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
>FROM -"Knowledge/Dataview"
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
    - image:: [[WHERE DQL Overview.png]]



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

