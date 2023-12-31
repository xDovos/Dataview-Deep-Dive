---
aliases: 
Type: Query
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Amount of inlinks and outlinks", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-11-17
- [x] Write the YAML metadata ✅ 2023-11-17
- [ ] Write the query
- [ ] Queries
    - [x] Simple amount of inlinks per note to this note ✅ 2023-12-24
        - [x] Write the Query ✅ 2023-12-24
        - [x] Write the Query Metadata ✅ 2023-12-24
    - [x] Complex amount of inlinks and outlinks per note to this note ✅ 2023-12-24
        - [x] Write the Query ✅ 2023-12-24
        - [x] Write the Query Metadata ✅ 2023-12-24
    - [x] LIST Complex amount of inlinks and outlinks per note to this note ✅ 2023-12-24
        - [x] Write the Query ✅ 2023-12-24
        - [x] Write the Query Metadata ✅ 2023-12-24


# Amount of inlinks and outlinks

in all queries change all link("FLATTEN") to this.file.link to get it dynamically working. i have done this this way because i don't link to this note.
 
## Simple amount of inlinks per note to this note

```js
TABLE length(rows.out) as Amount
WHERE contains(file.outlinks, this.file.link) and file.path != this.file.path
FLATTEN file.outlinks as out
WHERE out = this.file.link
GROUP BY file.link as File
SORT length(rows.out) desc
```

>[!info]- Rendered
>```dataview
>TABLE length(rows.out) as Amount
>WHERE contains(file.outlinks, link("FLATTEN")) and file.path != this.file.path
>FLATTEN file.outlinks as out
>WHERE out = link("FLATTEN")
>GROUP BY file.link as File
>SORT length(rows.out) desc
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[WHERE]], [[FLATTEN]], [[GROUP BY]], [[Knowledge/001 Dataview/DQL/Data Commands/SORT|SORT]]
    - functions:: [[length]], [[contains]]
    - tags:: #file/outlinks, #file/inlinks
    - image:: 


## Complex amount of inlinks and outlinks per note to this note

```js dataview
TABLE length(flat(rows.links.out)) as inlinks, length(flat(rows.links.in)) as outlinks
WHERE (contains(file.outlinks, this.file.link) or contains(file.inlinks, this.file.link)) and file.path != this.file.path
FLATTEN {out: filter(file.outlinks, (t)=> t = this.file.link), in: filter(file.inlinks, (t)=> t = this.file.link)} as links
WHERE contains(links.out, this.file.link) or contains(links.in, this.file.link)
GROUP BY file.link as File
SORT length(flat(rows.links.out)) desc, length(flat(rows.links.in)) desc
```

>[!info]- Rendered
>```dataview
>TABLE length(flat(rows.links.out)) as Inlinks,  length(flat(rows.links.in)) as outlinks
>WHERE (contains(file.outlinks, link("FLATTEN")) or contains(file.inlinks, link("FLATTEN"))) and file.path != this.file.path
>FLATTEN {out: filter(file.outlinks, (t)=> t = link("FLATTEN")), in: filter(file.inlinks, (t)=> t = link("FLATTEN"))} as links
>GROUP BY file.link as File
>SORT length(flat(rows.links.out)) desc, length(flat(rows.links.in)) desc
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[WHERE]], [[FLATTEN]], [[GROUP BY]], [[Knowledge/001 Dataview/DQL/Data Commands/SORT|SORT]]
    - functions:: [[length]], [[contains]], [[filter]], [[flat]]
    - tags:: #file/outlinks , #file/inlinks 
    - image:: 


## LIST Complex amount of inlinks and outlinks per note to this note

```js dataview
LIST {in: length(flat(rows.links.out)), out: length(flat(rows.links.in))}
WHERE (contains(file.outlinks, this.file.link) or contains(file.inlinks, this.file.link)) and file.path != this.file.path
FLATTEN {out: filter(file.outlinks, (t)=> t = this.file.link), in: filter(file.inlinks, (t)=> t = this.file.link)} as links
WHERE contains(links.out, this.file.link) or contains(links.in, this.file.link)
GROUP BY file.link as File
SORT length(flat(rows.links.out)) desc, length(flat(rows.links.in)) desc
```

>[!info]- Rendered
>```dataview
>LIST {in: length(flat(rows.links.out)), out: length(flat(rows.links.in))}
>WHERE (contains(file.outlinks, link("FLATTEN")) or contains(file.inlinks, link("FLATTEN"))) and file.path != this.file.path
>FLATTEN {out: filter(file.outlinks, (t)=> t = link("FLATTEN")), in: filter(file.inlinks, (t)=> t = link("FLATTEN"))} as links
>GROUP BY file.link as File
>SORT length(flat(rows.links.out)) desc, length(flat(rows.links.in)) desc
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[Knowledge/001 Dataview/DQL/Data Commands/LIST|LIST]], [[WHERE]], [[FLATTEN]], [[GROUP BY]], [[Knowledge/001 Dataview/DQL/Data Commands/SORT|SORT]]
    - functions:: [[length]], [[contains]], [[filter]], [[flat]]
    - tags:: #file/outlinks , #file/inlinks 
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

