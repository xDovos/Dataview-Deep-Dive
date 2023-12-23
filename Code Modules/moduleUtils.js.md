---
aliases: 
Type: module
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "moduleUtils.js", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-18
- [x] Write the YAML metadata ✅ 2023-10-18
- [ ] Write the query


# moduleUtils.js

## UtilsTaskListCallout

```js
export function UtilsTaskListCallout(dv, note, filter)
{
    const backticks = String.fromCharCode(96).repeat(3);
    const tasks = dv.page(note).file.tasks.where(item => filter(item));
    let md =  `>[!todo]- Tasks
    >${backticks}dataviewjs
    >dv.taskList(dv.array(JSON.parse('${JSON.stringify(tasks.array())}')), false)
    >${backticks}
    >`;
    return dv.span(md);
}
```

```js
export function relativeDate(isoDateStr) {
    const deltaSecs = (new Date() - new Date(isoDateStr)) / 1000;
    let unit;
    let delta;
    if (deltaSecs < 60) {
        unit = "second";
        delta = deltaSecs;
    } else if (deltaSecs < 60 * 60) {
        unit = "minute";
        delta = Math.ceil(deltaSecs / 60);
    } else if (deltaSecs < 60 * 60 * 24) {
        unit = "hour";
        delta = Math.ceil(deltaSecs / 60 / 60);
    } else if (deltaSecs < 60 * 60 * 24 * 7) {
        unit = "day";
        delta = Math.ceil(deltaSecs / 60 / 60 / 24);
    } else if (deltaSecs < 60 * 60 * 24 * 7 * 4) {
        unit = "week";
        delta = Math.ceil(deltaSecs / 60 / 60 / 24 / 7);
    } else if (deltaSecs < 60 * 60 * 24 * 7 * 4 * 12) {
        unit = "month";
        delta = Math.ceil(deltaSecs / 60 / 60 / 24 / 7 / 4);
    } else {
        unit = "year";
        delta = Math.ceil(deltaSecs / 60 / 60 / 24 / 7 / 4 / 12);
    }
    const formatter = new Intl.RelativeTimeFormat("en", { style: "long", numeric: "auto" });
    return formatter.format(-delta, unit);
}
```

```js
export function UtilsArray(end)
{
    let result = [];
    for (let i = 1; i <= end; i++) {
      result.push(i);
    }
    //console.log(result)
    return result.join(",");
}
```


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




