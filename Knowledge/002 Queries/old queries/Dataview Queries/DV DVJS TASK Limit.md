---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["[[DV DVJS TASK Limit#DV DVJS TASK limit per document]]", ""]
---
docs:: 
.where(t=> t.file.folder == "test")

## DV DVJS TASK limit per document

```js dataviewjs

function limiter(path){
    //Returns an array of up to 5 tasks from the path it gets.
    return dv.page(path).file.tasks.where(t=> !t.completed).limit(5)
}

//Queries all the files and tasks you want to see and reduces it to the path it comes from.
const pages = dv.pages('"Discord Support/Dataview Data/Test data"').file.tasks.where(t=> !t.completed).groupBy(t=> t.link).key.path

//Creates a list with each note with 5 tasks as value.
let data = []
console.log(pages.length)
for(let i = 0; i< pages.length; i++){
    data.push(limiter(pages[i]))
} 

//Flattens the Array into the format the TaskList wants.
data = dv.array(data).flatMap(t=> t)
dv.taskList(data)
```

```js dataviewjs

//Queries all the files and tasks you want to see and reduces it to the path it comes from.
const pages = dv.pages('"Discord Support/Dataview Data/Test data"').file.tasks.where(t=> !t.completed).groupBy(t=> t.link).key.path

let data = []
pages.forEach(function (t){
    data.push(dv.page(t).file.tasks.where(t=> !t.completed).limit(5)
    )})
data = dv.array(data).flatMap(t => t)
dv.taskList(data)

```
```js dataviewjs

//Queries all the files and tasks you want to see and reduces it to the path it comes from.
const pages = dv.pages('"Discord Support/Dataview Data/Test data"').file.tasks.where(t=> !t.completed).groupBy(t=> t.link).key.path

let data = pages.flatMap(page => dv.page(page).file.tasks.where(t => !t.completed).limit(5) )
dv.taskList(data)

```

```js dataviewjs
const data = dv
  .pages('"Discord Support/Dataview Data/Test data"')
  .file.tasks.where((t) => !t.completed)
  .groupBy((t) => t.link).key.path
  .flatMap((page) =>
    dv.page(page)
      .file.tasks.where((t) => !t.completed)
      .limit(5)
  );
dv.taskList(data);
```






