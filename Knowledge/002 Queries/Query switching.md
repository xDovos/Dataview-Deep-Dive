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
    - [ ] Switching Filter Based on Task with if statement
        - [ ] Write the Query
        - [ ] Write the Query Metadata
    - [ ] Switching Filter Based on Task with inline if statement
        - [ ] Write the Query
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



## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




