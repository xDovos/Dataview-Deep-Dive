---
aliases: 
Type: Dataview
number: 5
Dataview: 2023-09-15T11:03:02 am
---
MOC:: 
up:: 
same::
status::  `$= const setPage = "Progress bar"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] Write an intro to this note ✅ 2023-10-10
- [ ] rewrite the note and it's queries to the vaults standard.
- [ ] Progress bar Types
    - [ ] Inline Progress bars
        - [x] bar with Text Filter ✅ 2023-05-20
            - [x] Explanation ✅ 2023-05-20
            - [x] Modules ✅ 2023-09-30
        - [x] bar with Header Filter ✅ 2023-05-20
            - [ ] Explanation
            - [x] Modules ✅ 2023-09-30
        - [ ] Bar of multiple files
            - [x] Text filter ✅ 2023-05-20
                - [ ] Explanation
                - [x] Modules ✅ 2023-09-30
            - [x] Header Filter ✅ 2023-05-20
                - [ ] Explanation 
                - [x] Modules ✅ 2023-09-30
- [ ] DQL Table of Progress bars/MOC
    - [x] With the tasks ✅ 2023-05-20
    - [x] With the tasks inside a callout ✅ 2023-05-20
        - [ ] Explanation
- [ ] Dvjs Table that creates Progress bars 
    - [x] Tasks based ✅ 2023-05-20
    - [x] Time based native diff ✅ 2023-05-20
    - [x] time based custom diff ✅ 2023-09-30
    - [x] time based Modules ✅ 2023-09-30
        - [ ] Explanation
    - [ ] PB based on property values.


# Progress bar

Progress bars are really useful to visualise progress inside your notes and vault. they show that things are progressing and that you are doing stuff.
in this vault for example each notes status is shown by a progress bar and not by a vague status value or tag.
like seen in this file it shows what i plan to do inside the note and what i already did. 
also because the "TASK" plugin is installed the tasks get a completion date and that way i can see when i completed something on the note the last time.
i use the progress bars mostly tasks based but you can also use them time based like shown here [[Progress bar#DV DVJS TABLE Progress bar time progress]].
in general progress bars don't need to be written in dvjs but it is better to do so because it is easier to get the right files and tasks in dvjs.
some of the progress bars have a return(await self.require.import("Code Modules/modulePB.js.md")) syntax. for these you need to look into the [[modulePB.js]] note to see the actual query. it is a .js.md note so you can open it with obsidian. 
the example note for the progress bars shown in this note are in [[File Name]]


## DVJS Inline Progress bars
### progress bar on one page with a filter

```js 
`$= const setPage = "File Name"; const setFilter = "Text Filter" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => t.text.includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => t.text.includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) + " left</span>" `

```

>[!info]+ Rendered
>
>`$= const setPage = "File Name"; const setFilter = "Text Filter" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => t.text.includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => t.text.includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) + " left</span>" `
>


- Query meta
    - QueryType:: [[DVJS]], [[INLINE]]
    - DVfunctions:: [[dv.pages]], [[DataArray.where]], [[html span]], [[html prgress]]
    - JSfunctions:: [[Math.round]]
    - tags:: #file/tasks, #file/tasks/section
    - image:: [[DVJS INLINE page text filter.png]]

TextFilter:: `$= const setPage = "File Name"; const setFilter = "Text Filter" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => t.text.includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => t.text.includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) + " left</span>" `


### progress bar on one page with a filter Modules

```js 
`$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteText(dv, "File Name", "Text Filter")`
```

>[!info]+ Rendered
>`$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteText(dv, "File Name", "Text Filter")`


- Query meta
    - QueryType:: [[DVJS]], [[INLINE]], [[Plugin Modules]]
    - DVfunctions:: [[modulePB.js#PBSingleNoteText]]
    - JSfunctions:: [[await]], [[return]], [[self.require.import]]
    - tags:: 
    - image:: [[DVJS INLINE page text filter.png]]

#### Explanation

- A progress bar that takes the file name and a text filter
- The file name can be automated inside the template from the Templater plugin 
	- const setPage = "Progress bar";
- The text filter looks into the task text and searches for a match. you can do:
	- Tags: "#tag"
	- Words: "Word"
	- Sentences: "only tasks with this sentence"

### progress bar on one page under one header

HeaderFilter:: `$= const setPage = "File Name"; const setFilter = "Header Name" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `
HeaderFilterModule:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "File Name", "Header Name")`

#### Explanation

- The Section filter looks into the tasks subsection and matches it to the filter. you can do:
	- const setFilter = "Section name"

### progress overview of pages

OverviewText:: `$= const setPages = '"Knowledge"'; const setFilter = "" ; const value = Math.round(((dv.pages(setPages).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) / (dv.pages(setPages).file.tasks).where(t => t.text.includes(setFilter)).length) * 100); "<progress style='height: 10px; width: 100%; background-color: #0000e0; border-radius: 5px;'  value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.pages(setPages).file.tasks.where(t => t.text.includes(setFilter)).length - dv.pages(setPages).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) + " left</span>"`

OverviewSection:: `$= const setPages = ''; const setFilter = "" ; const value = Math.round(((dv.pages(setPages).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.pages(setPages).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.pages(setPages).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.pages(setPages).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `
OverviewSection:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBOverviewHeader(dv, "", "" )`


#### Explanation

- A progress bar that takes a file folder or tags and a text filter
- The text filter looks into the task text and searches for a match. you can do:
	- Tags: "#tag"
	- Words: "Word"
	- Sentences: "only tasks with this sentence"

## DQL TABLE with inline Progress bar fields

```dataview
Table rows.file.link as "Sub Projects", rows.todo, G.todo
From "Discord Support/Dataview Data/Project"
where Project
group by Project as G

```




### Explanation

- it goes over the Sub Project files and groups by the project field inside of them
- then it displays the inline fields with the progress bars (column 3) and get's the progress bar from the main project file (column 4).

## DQL TABLE MOC with progress bar and checking of the tasks

### old version

```dataview
table status, "`$= dv.taskList(dv.page(\"" + file.name + "\").file.tasks.where((t)=> !t.completed).where((t)=> t.section.subpath == 'Status Tasks'), false)`" AS TASKS
from "Knowledge/001 Dataview/DQL/Data Commands"

```

### new version with callouts to hide the tasks

```dataview
table status, "`$=const tasks = dv.page(\"" + file.name + "\").file.tasks.where(t=> !t.checked && t.section.subpath == 'Status Tasks');let md =  '>[!todo]- Tasks\n>'+ String.fromCharCode(96).repeat(3) + 'dataviewjs\n>let group2 = dv.array(JSON.parse('+String.fromCharCode(96);let md2 = String.fromCharCode(96)+'));\n>dv.taskList(group2, false);\n>'+ String.fromCharCode(96).repeat(3)+ '\n';dv.span(md + JSON.stringify(tasks.array()) + md2);`" AS TASKS
from "Knowledge/001 Dataview/DQL/Data Commands"
```

### Modules Version with callouts

```js dataview
table status, "`$=return(await self.require.import('Code Modules/moduleUtils.js.md')).UtilsTaskListCallout(dv, \""+ file.name +"\", t => !t.checked && t.section.subpath == 'Status Tasks')`" AS TASKS
from "Knowledge/001 Dataview/DQL/Data Commands"
```


### Explanation

- Gets the files like any MOC and then puts the inline field with the progress bar as a header.
- the Tasks are done with a dvjs inline taskList query  that pulls the tasts the progress bars are based on. (here it is a Header filter used because the progress bars are based on it.)


## DV DVJS TABLE that creates Progress bars

```js dataviewjs
const pages = dv.pages()
        .where(b => b.class === 'area')
        .sort(b => b.file.ctime)

const setFilter = "" ;

let bars = []
for (let i in pages.values) {
	let value = (Math.round((pages[i].file.tasks
		.where(t => t.completed)
		.where(t => t.text.includes(setFilter)).length / 
		pages[i].file.tasks
		.where(t => t.text.includes(setFilter)).length) * 100))
	
	bars.push("<progress value='" + value + "' max='100'></progress>" + 
		"<span>" + value + "% &nbsp;| &nbsp;" + 
		(pages[i].file.tasks
			.where(t => t.text.includes(setFilter)).length - 
		pages[i].file.tasks
			.where(t => t.completed)
			.where(t => t.text.includes(setFilter)).length) + 
		" left</span>")
}

const data = pages.map((p, i) => [ 
	        p.file.link, 
	        p.file.mtime,
	        bars[i]])

dv.table(["Name", "Modified", "progress bar"], data)
```

### Explanation

- it creates a progress bar about all files queried and puts it into an array
- then it maps it back into the table with the other data.
- Note: it is important to not lose the sort order or the progress bar will be put into the wrong place

## DV DVJS TABLE Progress bar time progress
### native Duration calculation

```dataviewjs
function newBar(start, end, now){
    const value = Number(((now- start)*100)/(end-start)).toFixed("2")
    const remTime = Duration.fromMillis(end-now).rescale().toHuman({ unitDisplay: "long" }).split(",").slice(0,4)
    return "<progress value='" + value + "' max='100'></progress>" + 
    	"<span>" + value + "% &nbsp;| &nbsp;" + remTime + " left</span>"
}
function liveBar(start, end, now){
    const value = Number(((now- start)*100)/(end-start)).toFixed("2")
    const remTime = dv.luxon.Duration.fromMillis(end-start).rescale().toHuman({ unitDisplay: "long" }).split(",")
    return "<progress value='" + value + "' max='100'></progress>" + 
    	"<span> Live &nbsp;| &nbsp;" + remTime + " went by</span>"
}

const data = []
data.push(["Day", newBar(dv.date("yesterday").toMillis(), dv.date("tomorrow").toMillis(), dv.date("now"))])
data.push(["Week", newBar(dv.date("sow"), dv.date("eow"), dv.date("now"))])
data.push(["Month", newBar(dv.date("som"), dv.date("eom"), dv.date("now"))])
data.push(["Year", newBar(dv.date("soy"), dv.date("eoy"), dv.date("now"))])
data.push(["BDay", newBar(dv.date("2023-03-04").toMillis(), dv.date("2024-03-04").toMillis(), dv.date("now"))])
data.push(["Live", liveBar(dv.date("1999-03-04").toMillis(), dv.date("today").toMillis(), dv.date("today").toMillis())])

dv.table(["Name", "Bar"], data)
```

### Custom Duration calculation

```dataviewjs
function DateDiff(left, right) {
    return Object.entries(left.diff(right, ["years", "months", "days", "hours", "minutes",]).toObject())
        .filter(([, value]) => value) // remove to preserve 0s
        .map(([key, value]) => `${Math.round(value,1)} ${key}`)
        .join(", ")
}
function newBar(start, end, now){
    const value = Number(((now- start)*100)/(end-start)).toFixed("2")
    const remTime = DateDiff(end, now)
    return "<progress value='" + value + "' max='100'></progress>" + 
    	"<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + remTime + " left</span>"
}

function liveBar(start, end, now){
    const value = Number(((now- start)*100)/(end-start)).toFixed("2")
    const remTime = DateDiff(end, start)
    return "<progress value='" + value + "' max='100'></progress>" + 
    	"<span style='font-size:smaller;color:var(--text-muted)'> Live &nbsp;| &nbsp;" + remTime + " went by</span>"
}

function lastBdayCalc(){
console.log(dv.duration(DateDiff(dv.date("today").set({month: Bday.month, day: Bday.day}), dv.date("now"))))
    if(dv.duration(DateDiff(dv.date("today").set({month: Bday.month, day: Bday.day}), dv.date("now"))) <= dv.duration("0 days")){
        return dv.date("today").set({month: Bday.month, day: Bday.day})
    }else{
        return dv.date("today").set({month: Bday.month, day: Bday.day}).minus({year: 1})
    }
}
const Bday = dv.date("1999-10-09")
const lastBday = lastBdayCalc(Bday)
const nextBday = lastBday.plus({year: 1})

const data = []
data.push(["Day", newBar(dv.date("today"), dv.date("tomorrow"), dv.date("now"))])
data.push(["Week", newBar(dv.date("sow"), dv.date("eow"), dv.date("now"))])
data.push(["Month", newBar(dv.date("som"), dv.date("eom"), dv.date("now"))])
data.push(["Quarter", newBar(dv.date("now").startOf("quarter"), dv.date("now").endOf("quarter"), dv.date("now"))])
data.push(["Year", newBar(dv.date("soy"), dv.date("eoy"), dv.date("now"))])
data.push(["BDay", newBar(lastBday, nextBday, dv.date("now"))])
data.push(["Live", liveBar(Bday, dv.date("now"), dv.date("now"))])


dv.table(false, data)
```

### Modules Version

```dataviewjs

module = await self.require.import("Code Modules/modulePB.js.md")

function lastBdayCalc(){
    if(dv.duration(module.DateDiff(dv.date("today").set({month: Bday.month, day: Bday.day}), dv.date("now"))) <= dv.duration("0 days")){
        return dv.date("today").set({month: Bday.month, day: Bday.day})
    }else{
        return dv.date("today").set({month: Bday.month, day: Bday.day}).minus({year: 1})
    }
}

const Bday = dv.date("1999-03-04")
const lastBday = lastBdayCalc(Bday)
const nextBday = lastBday.plus({year: 1})

const data = []
data.push(["Day", module.PBTimeCountdown(dv.date("today"), dv.date("tomorrow"), dv.date("now"))])
data.push(["Week", module.PBTimeCountdown(dv.date("sow"), dv.date("eow"), dv.date("now"))])
data.push(["Month", module.PBTimeCountdown(dv.date("som"), dv.date("eom"), dv.date("now"))])
data.push(["Quarter", module.PBTimeCountdown(dv.date("now").startOf("quarter"), dv.date("now").endOf("quarter"), dv.date("now"))])
data.push(["Year", module.PBTimeCountdown(dv.date("soy"), dv.date("eoy"), dv.date("now"))])
data.push(["BDay", module.PBTimeCountdown(dv.date(lastBday), dv.date(nextBday), dv.date("now"))])
data.push(["Live", module.PBTimeLive(Bday, dv.date("now"), dv.date("now"))])


dv.table(["Name", "Bar"], data)
```

### Explanation

- It has two functions that creates progress bars
    - the first one creates it based on a start, end and current date 
    - the second one does something similar but tells you how long something was ago with the ability to tell how much percent it is from the complete time.
- it is here not based on a query and shows the progress of the current Day, Week, Month, Year, Bday and how old you are
- Note: because of Luxon being too dumb to calculate with dates, the Year, Bday and Live bar and shown time can/will be wrong by a few days to weeks.
    - you can use the custom function that calculates a bit better because it skips the weeks and thus doesn't have the 28 days = 4 weeks = 1 month problem.


