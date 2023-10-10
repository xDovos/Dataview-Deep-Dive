---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["[[DV DVJS calender heatmap#DV DVJS calender heatmap based on Task text filter]]", ""]
---
docs:: 

## DV DVJS calender heatmap based on Task text filter

```dataviewjs
dv.span("** 😊 Title  😥**") /* optional ⏹️💤⚡⚠🧩↑↓⏳📔💾📁📝🔄📝🔀⌨️🕸️📅🔍✨ */

const calendarData = {
    //year: 2023,  // (optional) defaults to current year
    colors: {    // (optional) defaults to green
        blue:        ["#8cb9ff", "#69a3ff", "#428bff", "#1872ff", "#0058e2"], // first entry is considered default if supplied
        green:       ["#c6e48b", "#7bc96f", "#49af5d", "#2e8840", "#196127"],
        red:         ["#ff9e82", "#ff7b55", "#ff4d1a", "#e73400", "#bd2a00"],
        orange:      ["#ffa244", "#fd7f00", "#dd6f00", "#bf6000", "#9b4e00"],
        pink:        ["#ff96cb", "#ff70b8", "#ff3a9d", "#ee0077", "#c30062"],
        orangeToRed: ["#ffdf04", "#ffbe04", "#ff9a03", "#ff6d02", "#ff2c01"]
    },
    showCurrentDayBorder: true, // (optional) defaults to true
    defaultEntryIntensity: 4,   // (optional) defaults to 4
    intensityScaleStart: 10,    // (optional) defaults to lowest value passed to entries.intensity
    intensityScaleEnd: 100,     // (optional) defaults to highest value passed to entries.intensity
    entries: [],                // (required) populated in the DataviewJS loop below
}

//DataviewJS loop
const filter = "daily"
const temp = dv.pages().where(t=> t.file.tasks).file.tasks.where(t => t.text.includes(filter)).groupBy(t=> t.link).key.path
const pages = temp.map(t=> dv.page(t))
//console.log(pages)


for (let page of pages) {
    //dv.span("<br>" + page.file.name) // uncomment for troubleshooting
    calendarData.entries.push({
        date: page.file.name,     // (required) Format YYYY-MM-DD
        intensity: 1, // (required) the data you want to track, will map color intensities automatically
        content: "🏋️",           // (optional) Add text to the date cell
        color: "orange",          // (optional) Reference from *calendarData.colors*. If no color is supplied; colors[0] is used
    })
}

renderHeatmapCalendar(this.container, calendarData)
```



## DV DVJS calender heatmap based on field

```dataviewjs
dv.span("** 😊 Title  😥**") /* optional ⏹️💤⚡⚠🧩↑↓⏳📔💾📁📝🔄📝🔀⌨️🕸️📅🔍✨ */

const calendarData = {
    year: 2023,  // (optional) defaults to current year
    colors: {    // (optional) defaults to green
        blue:        ["#8cb9ff", "#69a3ff", "#428bff", "#1872ff", "#0058e2"], // first entry is considered default if supplied
        green:       ["#c6e48b", "#7bc96f", "#49af5d", "#2e8840", "#196127"],
        red:         ["#ff9e82", "#ff7b55", "#ff4d1a", "#e73400", "#bd2a00"],
        orange:      ["#ffa244", "#fd7f00", "#dd6f00", "#bf6000", "#9b4e00"],
        pink:        ["#ff96cb", "#ff70b8", "#ff3a9d", "#ee0077", "#c30062"],
        orangeToRed: ["#ffdf04", "#ffbe04", "#ff9a03", "#ff6d02", "#ff2c01"]
    },
    showCurrentDayBorder: true, // (optional) defaults to true
    defaultEntryIntensity: 4,   // (optional) defaults to 4
    intensityScaleStart: 10,    // (optional) defaults to lowest value passed to entries.intensity
    intensityScaleEnd: 100,     // (optional) defaults to highest value passed to entries.intensity
    entries: [],                // (required) populated in the DataviewJS loop below
}

//DataviewJS loop
const pages = dv.pages('"Journal/Daily"').where(t=> t.Squats)


for (let page of pages) {
    //dv.span("<br>" + page.file.name) // uncomment for troubleshooting
    calendarData.entries.push({
        date: page.file.name,        // (required) Format YYYY-MM-DD
        intensity: page.Squats,      // (required) the data you want to track, will map color intensities automatically
        content: await dv.span(`[[${page.file.name}|⚡]]`),           // (optional) Add text to the date cell
        color: "green",  // (optional) Reference from *calendarData.colors*. If no color is supplied; colors[0] is used
    })
}

renderHeatmapCalendar(this.container, calendarData)
```


## MY List

- 2023-08-12 - Today
- [[2023-08-11]] - Yesterday
- 2023-08-13 - Tomorrow
- 2023-08-13 - whatever
- 2023-08-12 - Today
- 2023-08-13 - Tomorrow
- 2023-08-16 - Tomorrow
- 2023-08-13 - Tomorrow

```dataviewjs
const calendarData = {
    colors: {
        blue:  ["#BCD2E8","#91BAD6","#73A5C6","#528AAE","#2E5984","#1E3F66",],
        },
    entries: []
}
let dates = dv.current().file.lists.where(t=> t.section.subpath === "MY List").groupBy(t => t.text.match(/\d{4}-\d{2}-\d{2}/i))
for (let list of dates) {
    calendarData.entries.push({
        date: list.key,        // (required) Format YYYY-MM-DD
        intensity: list.rows.length,      // (required) the data you want to track, will map color intensities automatically
        color: "blue",  // (optional) Reference from *calendarData.colors*. If no color is supplied; colors[0] is used
    })
}


renderHeatmapCalendar(this.container, calendarData)

```










