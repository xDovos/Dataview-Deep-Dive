---
aliases: []
Type: 
MOC:
---

status::  `$= const setPage = "Query Query"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] Create the Note ✅ 2023-10-30
- [ ] Write the YAML metadata
- [ ] Write the query
    - [x] Querying Queries ✅ 2023-10-06
- [ ] Queries
    - [ ] Querying Queries
        - [ ] Write the Query
        - [ ] Write the Query Metadata


# Query Query

## Querying Queries

made by [scottTomaszewski](https://gist.github.com/scottTomaszewski/c95c4a0f2f9b5a1f4c3566d03df52040)

the filters don't work in the callout. if you want to use the query remove the "js " before the "dataviewjs" so that the codeblock is rendering.

 ```dataviewjs
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

```dataviewjs
const inlinks = dv.current().file.inlinks
const outlinks = dv.current().file.outlinks.mutate(t=> t.embed = false)
const indexA = Array.from({ length: Math.max(inlinks.length, outlinks.length) }, (_, index) => index)
const data = indexA.map((i)=> [inlinks[i] || " ", outlinks[i] || " "])
const style = "<span style='font-size:smaller;color:var(--text-muted)'>("
dv.table(["inlinks "+ style + inlinks.length +")", "outlinks "+ style + outlinks.length +")"], data)
this.container.querySelectorAll(".table-view-table tr:first-of-type th:first-of-type > span.small-text")[0].style.visibility = "hidden";
```

