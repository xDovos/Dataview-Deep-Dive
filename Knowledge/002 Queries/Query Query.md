---
aliases: []
Type: 
MOC:
---

status::  `$= const setPage = "Query Query"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [ ] Write the YAML metadata
- [ ] Write the query
    - [x] Querying Queries ✅ 2023-10-06


# Query Query

## Querying Queries

the filters don't work in the callout. if you want to use the query remove the "js " before the "dataviewjs" so that the codeblock is rendering.

 ```js dataviewjs
let input = {
  "query": `TABLE flat(filter(rows.L, (t) => t.text = "Query meta").children.text) as "metadata", embed(filter(flat(filter(rows.L, (t) => t.text = "Query meta").children), (t2) => t2.image).image)[0] as "Image"
    WHERE file.lists and contains(file.lists.text,"Query meta")
    FLATTEN file.lists as L
    WHERE !L.task
    GROUP BY L.section as Sections
    SORT meta(Sections).subpath`,
  "filterColumnCount": 3,
  "markdownTable": false,
  "columnsWithoutFilters": ["Image"],
  "filterCalloutColor": "green",
  "its_cards": {
    "enabled": false,
    "columns": 3
  }
}
await dv.view("Discord Support/Dataview Data/Views/Filter Query/filtering_dv", input)
```

>[!info]- Rendered
>```dataviewjs
>let input = {
>  "query": `TABLE flat(filter(rows.L, (t) => t.text = "Query meta").children.text) as "metadata", embed(filter(flat(filter(rows.L, (t) => t.text = "Query meta").children), (t2) => t2.image).image)[0] as "Image"
>WHERE file.lists and contains(file.lists.text,"Query meta")
>FLATTEN file.lists as L
>WHERE !L.task
>GROUP BY L.section as Sections
>SORT meta(Sections).subpath`,
>"filterColumnCount": 3,
>  "markdownTable": false,
> "columnsWithoutFilters": ["Image"],
>"filterCalloutColor": "green",
>  "its_cards": {
>    "enabled": false,
>    "columns": 3
> }
>}
>await dv.view("Discord Support/Dataview Data/Views/Filter Query/filtering_dv", input)
>```


- Query meta
    - QueryType:: [[DVJS]], [[filtering_dv.js]]
    - DVfunctions:: [[dv.view]]
    - JSfunctions:: 
    - tags:: #json
    - image:: 



## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




