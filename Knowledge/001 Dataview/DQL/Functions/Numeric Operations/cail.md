---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "cail", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-21
- [ ] Write the YAML metadata
- [ ] Write the query


# cail

## cail Overview

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




