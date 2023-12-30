---
aliases: 
Type: Query
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Headers datasets", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-31
- [ ] Write the YAML metadata
- [ ] Write the query
- [ ] Queries
    - [x] Pros Cons Header Query DQL ✅ 2023-12-27
        - [x] Write the Query ✅ 2023-12-27
        - [x] Write the Query Metadata ✅ 2023-12-27
    - [x] Pros Cons Header Query DVJS ✅ 2023-12-27
        - [x] Write the Query ✅ 2023-12-27
        - [x] Write the Query Metadata ✅ 2023-12-27


# Headers Datasets

### Pros
- Vertical grip
- Very comfortable
### Cons
- Battery required
### Notes
- Software: Logi Options+
- Sensor: 4000dpi
- Battery: 1x AA
- Receiver: Unifying USB Receiver

## Pros Cons Header Query DQL

```js
TABLE without id Pros.text as Pros, Cons.text as Cons, Notes.text as Notes
where file.path = this.file.path
flatten [filter(flat(file.lists), (item) => meta(item.section).subpath = "Pros")] as Pros
flatten [filter(flat(file.lists), (item) => meta(item.section).subpath = "Cons")] as Cons
flatten [filter(flat(file.lists), (item) => meta(item.section).subpath = "Notes")] as Notes
```

>[!info]+ Rendered
>```dataview
>TABLE without id Pros.text as Pros, Cons.text as Cons, Notes.text as Notes
>where file.path = this.file.path
>flatten [filter(flat(file.lists), (item) => meta(item.section).subpath = "Pros")] as Pros
>flatten [filter(flat(file.lists), (item) => meta(item.section).subpath = "Cons")] as Cons
>flatten [filter(flat(file.lists), (item) => meta(item.section).subpath = "Notes")] as Notes
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[WHERE]], [[FLATTEN]]
    - functions:: [[filter]], [[flat]], [[meta]]
    - tags:: #file/lists, #file/lists/section 
    - image:: 

## Pros Cons Header Query DVJS

```js
const page = dv.current()
const pros = page.file.lists.where(t => t.section.subpath == "Pros")
const cons = page.file.lists.where(t => t.section.subpath == "Cons")
const notes = page.file.lists.where(t => t.section.subpath == "Notes")
const data = dv.array(page).map(l => [pros.text, cons.text, notes.text ])
dv.table(["Pros", "Cons", "Notes"], data)
```

>[!info]+ Rendered
>```dataviewjs
>const page = dv.current()
>const pros = page.file.lists.where(t => t.section.subpath == "Pros")
>const cons = page.file.lists.where(t => t.section.subpath == "Cons")
>const notes = page.file.lists.where(t => t.section.subpath == "Notes")
>const data = dv.array(page).map(l => [pros.text, cons.text, notes.text ])
>dv.table(["Pros", "Cons", "Notes"], data)
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: [[dv.current]], [[DataArray.where]], [[DataArray.map]], [[dv.array]], [[dv.table]]
    - JSfunctions:: 
    - tags:: #file/lists , #file/lists/section 
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

