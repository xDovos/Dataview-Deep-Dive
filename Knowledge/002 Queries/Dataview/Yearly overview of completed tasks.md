---
aliases: 
Type: Query
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Yearly overview of completed tasks", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2024-01-19
- [x] Write the YAML metadata ✅ 2024-01-19
- [x] Write the Note ✅ 2024-01-19
- [ ] Queries
    - [x] Yearly Overview Task completion monthly view ✅ 2024-01-19
        - [x] Write the Query ✅ 2024-01-19
        - [x] Write the Query Metadata ✅ 2024-01-19
    - [x] Yearly Overview Task completion monthly view per note ✅ 2024-01-19
        - [x] Write the Query ✅ 2024-01-19
        - [x] Write the Query Metadata ✅ 2024-01-19


# Yearly overview of completed tasks

## Yearly Overview Task completion monthly view

```js
const indexA = Array.from({ length: 32 }, (_, index) => index)
let header = indexA.map(a=> String(a))
header[0] = "Month"

let data = []

const tasks = dv.pages().file.tasks?.where(t=> t.completed).completion.groupBy(t=> t.toFormat("yyyy-MM"))

for(let task of tasks.values){
    const row = indexA.map(i => dv.func.contains(task.rows.day, i)? task.rows.day.filter(t=> t == i).length: " ")
    row[0] = task.key
    data.push(row)
}

const md = dv.markdownTable(header, data)
dv.paragraph(md)
```

>[!info]+ Rendered
>```dataviewjs
>const indexA = Array.from({ length: 32 }, (_, index) => index)
>let header = indexA.map(a=> String(a))
>header[0] = "Month"
>
>let data = []
>
>const tasks = dv.pages().file.tasks?.where(t=> t.completed).completion.groupBy(t=> t.toFormat("yyyy-MM"))
>
>for(let task of tasks.values){
>    const row = indexA.map(i => dv.func.econtains(task.rows.day, i)? task.rows.day.filter(t=> t == i).length: " ")
>    row[0] = task.key
>    data.push(row)
>}
>
>const md = dv.markdownTable(header, data)
>dv.paragraph(md)
>```

- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions::  [[DataArray.map]], [[dv.pages]], [[dv.markdownTable]], [[dv.paragraph]], [[DataArray.groupBy]]
    - JSfunctions:: [[Array.from]], [[Array.push]], [[forLoop]]
    - tags:: #file/tasks 
    - image:: 


## Yearly Overview Task completion monthly view per note

```js
//the main array that holds all rows in the end
let data = []
// an array that is x long and holds the values from 0 to x - 1
const indexA = Array.from({ length: 32 }, (_, index) => index)
let header = indexA.map(a=> String(a)) //the table header array needs to hold only strings as values or it will bug out the renderer.
header[0] = "Day"

//getting all tasks that are completed and group them by month
const tasksMonths = dv.pages().file.tasks?.where(t=> t.completed).groupBy(t=> t.completion?.toFormat("yyyy-MM")).where(t => t.key)

for(let tasks of tasksMonths.values){
    //gets each object that holds the key and rows in a loop. this makes it possible to group again. this time by the link the tasks are in.
    let tasksDay = tasks.rows.groupBy(t=> dv.fileLink(t.link.path))
    //pushes a table row with the month in the first column and "-" for visual separation between the months
    const row = indexA.map(i => "-")
    row[0] = tasks.key
    data.push(row)
    
    //a second loop to get the tasks for each link and it uses the day and the number inside the indexA array to put the completed amount at the right place. then it puts the link into the first column and adds the row to the table 
    for(let task of tasksDay.values){
        const row2 = indexA.map(i => dv.func.contains(task.rows.completion?.day, i)? task.rows.completion.day.filter(t=> t == i).length : " ")
        row2[0] = task.key
        data.push(row2)
    }
}
//displaying it as markdown table makes the columns narrower. you can change it and commnet the other two out.
//dv.table(header, data)
const md = dv.markdownTable(header, data)
dv.paragraph(md)
```

>[!info]- Rendered
>```dataviewjs
>//the main array that holds all rows in the end
>let data = []
>// an array that is x long and holds the values from 0 to x - 1
>const indexA = Array.from({ length: 32 }, (_, index) => index)
>let header = indexA.map(a=> String(a)) //the table header array needs to hold only strings as values or it will bug out the renderer.
>header[0] = "Day"
>
>//getting all tasks that are completed and group them by month
>const tasksMonths = dv.pages().file.tasks?.where(t=> t.completed).groupBy(t=> t.completion?.toFormat("yyyy-MM")).where(t => t.key)
>
>for(let tasks of tasksMonths.values){
>    //gets each object that holds the key and rows in a loop. this makes it possible to group again. this time by the link the tasks are in.
>    let tasksDay = tasks.rows.groupBy(t=> dv.fileLink(t.link.path))
>    //pushes a table row with the month in the first column and "-" for visual separation between the months
>    const row = indexA.map(i => "-")
>    row[0] = tasks.key
>    data.push(row)
>    
>    //a second loop to get the tasks for each link and it uses the day and the number inside the indexA array to put the completed amount at the right place. then it puts the link into the first column and adds the row to the table 
>    for(let task of tasksDay.values){
>        const row2 = indexA.map(i => dv.func.contains(task.rows.completion?.day, i)? task.rows.completion.day.filter(t=> t == i).length : " ")
>        row2[0] = task.key
>        data.push(row2)
>    }
>}
>//displaying it as markdown table makes the columns narrower. you can change it and commnet the other two out.
>//dv.table(header, data)
>const md = dv.markdownTable(header, data)
>dv.paragraph(md)
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions::  [[DataArray.map]], [[dv.pages]], [[dv.markdownTable]], [[dv.paragraph]], [[DataArray.groupBy]]
    - JSfunctions:: [[Array.from]], [[Array.push]], [[forLoop]]
    - tags:: #file/tasks 
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



