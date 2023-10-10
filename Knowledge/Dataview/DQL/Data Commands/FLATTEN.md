---
aliases: []
Type: DataCommand
MOC: "[[Dataview Overview]]"
---

status::  `$= const setPage = "FLATTEN"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [ ] Write the YAML metadata
- [x] Write the query ✅ 2023-08-12
- [x] Link to the Doc Page ✅ 2023-08-13

# FLATTEN

- docs:: [command Flatten](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#flatten)
- docs:: [Expressions](https://blacksmithgu.github.io/obsidian-dataview/reference/expressions/)
- docs:: [Datatypes](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/)

in short, FLATTEN is black magic. it is really powerful but really confusing if you don't know the unwritten rules to it.
it is a function that shouldn't exist the way it does because it is doing 3-5 things at once on all your queried data and the Datatype it is used on changes what it spits out and it determines if you can use only one or multiple ones.

in general Flatten works by using
FLATTEN \<expression> as \<alias>

you don't have to name the results of flatten but it is advised to do so if you want to use the results of it somewhere else.
you have to use the newFieldName you choose if you want to see the results. BUT the rows are still affected even if you don't show the newFieldName as a header, so be careful how, when and where in the query you use the command.
you can use multiple fields, math, functions, array and string manipulation and html code in it, but the more complex you make it, the more likely it is that it doesn't do what you expect it to do and it is a pain to debug DQL because no real debug tool exists for it.
keep it as simple as possible until you understand how it reacts.

if you want to create a flatten without it affecting the rows even if it would then do it like this
FLATTEN [ Expression that would create rows. ] as Name
the reason why this doesn't affect the rows is because you now created an array with one value and it only flattens the outer array. this is an "easy" way of having more flattens without creating unwanted results.




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
    - image:: 


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




