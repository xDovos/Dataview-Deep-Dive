---
aliases: []
Type: MOC
---
status::  `$= const setPage = "Vault"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `
VaultNotesOverview:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBOverviewHeader(dv, "", "" )`

###### Status Tasks
- [x] Write the Intro ✅ 2023-08-06
- [x] Create the Journal notes ✅ 2023-08-06
	- [x] Create Daily notes ✅ 2023-08-06
	- [x] Create Weekly notes ✅ 2023-08-06
	- [x] Create Monthly notes ✅ 2023-08-06
- [ ] Create Templates for the Vault
	- [x] Periodic notes ✅ 2023-08-06
	- [x] [[Template Standard Note]] ✅ 2023-08-13
	- [x] [[DQL Codeblock]] ✅ 2023-08-13
	- [x] [[DQL function overview]] ✅ 2023-08-13
	- [ ] MOC notes
	- [ ] Knowledge notes
    	- [x] People notes ✅ 2023-10-11
    	- [x] Movie notes ✅ 2023-10-11
	- [ ] 
- [ ] Create Metadata Menu Classes to speed things up
- [ ] Create Movie notes so that we have data inside a database for analyse queries.
- [ ] Create another type of database that is purely on numbers
- [ ] Create a database that is inside one note and the queries for it.
    - [x] [[ThreeInTen Data]] ✅ 2023-08-10
    - [ ] [[ThreeInTen Analysis]]
- [ ] Look through the old queries and see what setups are needed for them
- [ ] find a Kowledge subject where we can show other types of Queries like MOC
- [ ] Finish the [[How dataview works]] note
    - [ ] or rework it into the vault.
- [ ] Create multiple Canvas that show visually how to navigate the vault and what is in here.
- [ ] 

# Vault

## Intro

- This is a vault that shows [[How dataview works]] with a realistic setup and more queries than necessary.
- It is currently WIP and might take a while to finish. 
- When Datacore comes out i plan to convert what i can to that plugin but that still might take until 2023-12-24
- This vault is not a replacement for dataviews [docs](https://blacksmithgu.github.io/obsidian-dataview/) and it mostly assumes that you read and use it on the side.
- most of the time \`\`\`dataview queries will be called [[DQL]] (DataQueryLanguage) and \`\`\`dataviewjs will be called [[DVJS]]. 
- you can find a MOC of all commands and functions in [[Dataview Overview]].
- it might be that this vault ends up to be like the docs but that isn't the intention and only a side effect of the setup i choose, so it is most likely incomplete because i'm adding stuff as i encounter them.
- some queries like the progress bar for the status field use the "Modules" plugin to put the query into one place in a separate note. in this case the [[modulePB.js]] note. it is a .js.md note, so you can open it with obsidian. the reason you can't see the .md from inside obsidian is because it removes that ending like for every other note/link. the progress bar queries are explained in [[Progress bar]].


## How the query setup in this vault works
(this is an image)

![[Query Setup explanation.png]]

- the setup is made out of 4 parts.
    1. the header with a name of the query
    2. the codeblock in a JS codeblock so that you can see the code.
    3. the codeblock inside a collabsed callout that you can open to see what the query renders. 
        - this is done this way because some queries return very long results and this way the note remains clean and rendering times are faster.
    4. the metadata of that codeblock
        - it consists out of a main bullet point with "Query meta" as text
        - and then key value pairs as sublists to the first one.
        - this way the sub lists are related to the "Query meta" list by the file.lists.children field. and that list is separable by file.lists.section that holds a header link to the name of the query.
- through this setup it is possible to add metadata that is header specific but the query needed to get the metadata separated is very advanced dataview code.
- the advantage is that there is now for each function and Data Commands a note with a query that shows all queries that use it.
- this way you are able to find examples easier and faster.



## Changelog Heatmap Callendar based on Log in the daily notes

This dvjs query requires the [[Plugin Heatmap Calendar]] plugin and shows how many list points you wrote inside the daily notes Log header
`=link(string(date("today")))` this link sends you to todays daily note. it is likely not created yet depending on when you downloaded the vault

```js dataviewjs
const calendarData = {
    colors: {
        orange:      ["#ffa244", "#fd7f00", "#dd6f00", "#bf6000", "#9b4e00"],
        },
    entries: []
}
let lists = dv.pages('"Journal/Daily/2023"').file.lists.where(t => t.section.subpath === "Log").groupBy(t => t.path.match(/\d{4}-\d{2}-\d{2}/i))
//console.log(lists)
for (let page of lists) {
    calendarData.entries.push({
        date: page.key,        // (required) Format YYYY-MM-DD
        intensity: page.rows.length,      // (required) the data you want to track, will map color intensities automatically
        color: "orange",  // (optional) Reference from *calendarData.colors*. If no color is supplied; colors[0] is used
        content: await dv.span(`[[${page.rows.link[0].path}#log|x]]`) //shows the logs on hover.
    })
}
renderHeatmapCalendar(this.container, calendarData)
```

>[!info]+ Rendered
>```dataviewjs
>const calendarData = {
>   colors: {
>      orange:      ["#ffa244", "#fd7f00", "#dd6f00", "#bf6000", "#9b4e00"],
>     },
>entries: []
>}
>let lists = dv.pages('"Journal/Daily/2023"').file.lists.where(t => t.section.subpath === "Log").groupBy(t => t.path.match(/\d{4}-\d{2}-\d{2}/i))
>//console.log(lists)
>for (let page of lists) {
>    calendarData.entries.push({
>        date: page.key,        // (required) Format YYYY-MM-DD
>        intensity: page.rows.length,      // (required) the data you want to track, will map color intensities automatically
>        color: "orange",  // (optional) Reference from *calendarData.colors*. If no color is supplied; colors[0] is used
>        content: await dv.span(`[[${page.rows.link[0].path}#log|x]]`) //shows the logs on hover.
>    })
>}
>renderHeatmapCalendar(this.container, calendarData)
>
>```

- Query meta
    - QueryType:: [[DVJS]], [[Plugin Heatmap Calendar]]
    - DVfunctions:: [[dv.pages]], [[dv.span]], [[DataArray.where]], [[DataArray.groupBy]]
    - JSfunctions:: [[RegEx]], [[console.log]], [[await]]
    - tags:: 
    - image:: 

## Changelog Heatmap Task Completion date 

```js dataviewjs
const calendarData = {
    colors: {
        green: ["#009d0b", "#068806", "#087303", "#085e01", "#074b00"],
        
        },
    entries: []
}
let lists = dv.pages().file.tasks.where(t => t.section.subpath === "Status Tasks" && t.completed).groupBy(t => t.completion.toFormat("yyyy-MM-dd"))
//console.log(lists)
for (let page of lists) {
    calendarData.entries.push({
        date: page.key,        // (required) Format YYYY-MM-DD
        intensity: page.rows.length,      // (required) the data you want to track, will map color intensities automatically
        color: "green",  // (optional) Reference from *calendarData.colors*. If no color is supplied; colors[0] is used
        content: page.rows.length
    })
}
renderHeatmapCalendar(this.container, calendarData)
```

>[!info]+ Rendered
>```dataviewjs
>const calendarData = {
>   colors: {
>      green: ["#009d0b", "#068806", "#087303", "#085e01", "#074b00"],
>        
>        },
>    entries: []
>}
>let lists = dv.pages().file.tasks.where(t => t.section.subpath === "Status Tasks" && t.completed).groupBy(t => t.completion.toFormat("yyyy-MM-dd"))
>//console.log(lists)
>for (let page of lists) {
>    calendarData.entries.push({
>        date: page.key,        // (required) Format YYYY-MM-DD
>        intensity: page.rows.length,      // (required) the data you want to track, will map color intensities automatically
>        color: "green",  // (optional) Reference from *calendarData.colors*. If no color is supplied; colors[0] is used
>        content: page.rows.length
>    })
>}
>
>
>renderHeatmapCalendar(this.container, calendarData)
>
>```


- Query meta
    - QueryType:: [[DVJS]], [[Plugin Heatmap Calendar]]
    - DVfunctions:: [[dv.pages]], [[dv.span]], [[DataArray.where]], [[DataArray.groupBy]]
    - JSfunctions:: [[RegEx]], [[console.log]], [[await]]
    - tags:: 
    - image:: 


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```





