---
aliases: []
Type: 
MOC:
---

status::  `$= const setPage = "Links to docs"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [ ] Write the YAML metadata
- [ ] Write the query


# Links to docs

## Links to the Docs

```js dataview
Table rows.L.docs as Docs
FROM -"Knowledge/Dataview/How dataview works"
Flatten file.lists as L
where L.docs
Group by L.section as Section
```

```dataviewjs
console.log(dv.current().file.outlinks)
```

>[!info]- Rendered
>```dataview
>Table rows.L.docs as Docs
>FROM -"Knowledge/Dataview/How dataview works" 
>Flatten file.lists as L
>where L.docs
>Group by L.section as Section
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[FLATTEN]], [[WHERE]], [[GROUP BY]]
    - functions:: 
    - tags:: #file/lists, #file/lists/section
    - image:: 



## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




