---
aliases: 
Type: Query
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "list + inline metadata datasets", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-30
- [ ] Write the YAML metadata
- [ ] Write the query


# list + inline metadata datasets

## Illness tracking database


- [date:: 2023-03-28], [illness:: fever], [note:: no note]
- [date:: 2023-05-28], [illness:: cold], [note:: [[artest 2023-05-28]] ]
- [date:: 2023-05-29], [illness:: cold], [note:: [[artest 2023-05-28]]  ]
- [date:: 2023-06-23], [illness:: headache], [note:: no note ]
- [date:: 2023-08-28], [illness:: fever], [note:: no note]
## Illness tracking DQL

```js
Table without id L.date as Date, L.illness as Illness, L.note as Note
WHERE file.path = this.file.path
flatten file.lists as L
WHERE L.illness
```

>[!info]- Rendered
>```dataview
>Table without id L.date as Date, L.illness as Illness, L.note as Note
>WHERE file.path = this.file.path
>flatten file.lists as L
>WHERE L.illness
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[WHERE]], [[FLATTEN]]
    - functions:: 
    - tags:: #file/lists
    - image:: 

## Illness tracking DVJS

```js
const page = dv.page("Basic file.lists database")
const data = page.file.lists.where(l=> l.illness).map(l => [l.date, l.illness, l.note])
dv.table(["Date", "Illness", "Note"], data)
```

>[!info]- Rendered
>```dataviewjs
>const page = dv.page("Basic file.lists database")
>const data = page.file.lists.where(l=> l.illness).map(l => [l.date, l.illness, l.note])
>dv.table(["Date", "Illness", "Note"], data)
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: [[dv.page]], [[DataArray.where]], [[DataArray.map]], [[dv.table]]
    - JSfunctions:: 
    - tags:: #file/lists 
    - image:: 

## activity logging

- [activity:: "stuff"], [start:: 2023-09-07T10:39], [end:: 2023-09-07T11:39]
- [activity:: "class"], [start:: 2023-09-07T11:39], [end:: 2023-09-07T12:19]
- [activity:: "Homework"], [start:: 2023-09-07T12:31], [end:: 2023-09-07T13:09]
- [activity:: "class"], [start:: 2023-09-07T14:39], [end:: 2023-09-07T16:39]
- [activity:: "free time"], [start:: 2023-09-07T14:39], [end:: 2023-09-07T16:39]
 
 ```dataview
TABLE rows.L.activity as "Activity", rows.L.start as "Start", rows.L.end as "End", map(rows.L, (L)=> dur(L.end - L.start)) as Duration
WHERE activity
FLATTEN file.lists as L
WHERE L.activity
group by file.link as File

```


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




