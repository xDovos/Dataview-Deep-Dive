---
aliases: 
Type: Query
MOC:
---

status::  `$= const setPage = "Tasks Completion date"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [ ] Write the YAML metadata
- [ ] Write the query


# Tasks Completion date


## unnamed

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
    - DVfunctions:: [[dv.pages]], [[dv.date]], [[DataArray.where]], [[DataArray.groupBy]], [[dv.paragraph]]. [[date.toFormat]], 
    - JSfunctions:: 
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


