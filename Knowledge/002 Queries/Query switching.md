---
aliases: []
Type: 
MOC:
---

status::  `$= const setPage = "Query switching"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] Create the Note ✅ 2023-10-30
- [ ] Write the YAML metadata
- [ ] Write the query
    - [x] Query Switching Based on Task Status ✅ 2023-10-01
- [ ] Queries
    - [x] Switching Filter Based on Task with if statement ✅ 2023-12-27
        - [x] Write the Query ✅ 2023-12-27
        - [x] Write the Query Metadata ✅ 2023-12-27
    - [x] Switching Filter Based on Task with inline if statement ✅ 2023-12-27
        - [x] Write the Query ✅ 2023-12-27
        - [x] Write the Query Metadata ✅ 2023-12-27
    - [ ] showing alternative outputs if null
        - [x] Write the Query ✅ 2023-12-27
        - [ ] Write the Query Metadata


# Query switching

## Switching Filter Based on Task with if statement

- [ ] completed

```js 
const exp = dv.current().file.tasks.where(t=> t.text.includes("completed")).completed[0]
//console.log(exp)

if(exp){
    dv.span("the task is completed")
}else{
    dv.span("the task is not completed")
}
```

>[!info]- Rendered
>```dataviewjs
>const exp = dv.current().file.tasks.where(t=> t.text.includes("completed")).completed[0]
>//console.log(exp)
>
>if(exp){
>    dv.span("the task is completed")
>}else{
>    dv.span("the task is not completed")
>}
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: [[dv.span]], [[dv.current]], [[DataArray.where]]
    - JSfunctions:: [[DataArray.includes]]
    - tags:: #file/tasks , #file/tasks/completed
    - image:: 


## Switching Filter Based on Task with inline if statement

- [ ] completed2

```js
const exp = dv.current().file.tasks.where(t=> t.text.includes("completed2")).completed[0]
//console.log(exp)
exp ? dv.span("the task is completed") : dv.span("the task is not completed")
```

>[!info]- Rendered
>```dataviewjs
>const exp = dv.current().file.tasks.where(t=> t.text.includes("completed2")).completed[0]
>//console.log(exp)
>exp ? dv.span("the task is completed"): dv.span("the task is not completed")
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: [[dv.span]], [[dv.current]], [[DataArray.where]]
    - JSfunctions:: [[DataArray.includes]]
    - tags:: #file/tasks , #file/tasks/completed
    - image:: 



## showing alternative outputs if null

```js 
const dql = dv.tryQuery(`Task
    where due < date(today)
    where !completed
    Where contains(text,"📅")
    sort due asc`);

dql ? dv.taskList(dql) : dv.paragraph("Well done");

```

>[!info]- Rendered
>```dataviewjs
>
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: 
    - JSfunctions:: 
    - tags:: 
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

