---
aliases: 
Type: module
MOC:
---

status::  `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "modulePB.js", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-09-15
- [x] Write the YAML metadata ✅ 2023-09-15
- [ ] Write the query


# modulePB.js


this note holds the code behind the progress bars you see in all the notes.
there are 4 different versions of the same code for 
1. single note with a header name filter
2. single note with a text filter
3. multiple notes overview header filter
4. multiple notes overview text filter
you can see how they work inside [[Progress bar]]

## PBSingleNoteHeader

```js
export function PBSingleNoteHeader(dv, setPage, setFilter){
    const tasks = dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter));
    const value = Math.round(((tasks.where(t => t.completed).length) / tasks.length) * 100); 

    return "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (tasks.length - tasks.where(t => t.completed).length) + " left</span>"
}
```

## PBSingleNoteText

```js
export function PBSingleNoteText(dv, setPage, setFilter){
    const tasks = dv.page(setPage).file.tasks.where(t => t.text.includes(setFilter));
    const value = Math.round(((tasks.where(t => t.completed).length) / tasks.length) * 100); 

    return "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (tasks.length - tasks.where(t => t.completed).length) + " left</span>"
}
```

## PBOverviewHeader

```js

export function PBOverviewHeader(dv, setPages = "", setFilter =""){
    const tasks = dv.pages(setPages).file.tasks.where(t => String(t.section).includes(setFilter));
    const value = Math.round(((tasks.where(t => t.completed).length) / tasks.length) * 100); 

    return "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (tasks.length - tasks.where(t => t.completed).length) + " left</span>"
}
```

## PBOverviewText

```js
export function PBOverviewText(dv, setPages = "", setFilter = ""){
    const tasks = dv.pages(setPages).file.tasks.where(t => t.text.includes(setFilter));
    const value = Math.round(((tasks.where(t => t.completed).length) / tasks.length) * 100); 

    return "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (tasks.length - tasks.where(t => t.completed).length) + " left</span>"
}

```

## DateDiff

```js
export function DateDiff(left, right) {
    return Object.entries(left.diff(right, ["years", "months", "days", "hours", "minutes",]).toObject())
        .filter(([, value]) => value) // remove to preserve 0s
        .map(([key, value]) => `${Math.round(value,1)} ${key}`)
        .join(", ")
}
```

## PBTimeCountdown

```js
export function PBTimeCountdown(startDate, endDate, nowDate){
    const value = Number(((nowDate- startDate)*100)/(endDate-startDate)).toFixed("2")
    const remTime = DateDiff(endDate, nowDate)
    return "<progress value='" + value + "' max='100'></progress>" + 
    	"<span style='font-size:smaller;color:var(--text-muted)'> " + value + "% &nbsp;| &nbsp;" + remTime + " left</span>"
}
```

## PBTimeLive

```js
export function PBTimeLive(startDate, endDate, nowDate){
    const value = Number(((nowDate- startDate)*100)/(endDate-startDate)).toFixed("2")
    const remTime = DateDiff(endDate, startDate)
    return "<progress value='" + value + "' max='100'></progress>" + 
    	"<span style='font-size:smaller;color:var(--text-muted)'> Live &nbsp;| &nbsp;" + remTime + " went by</span>"
}
```



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

