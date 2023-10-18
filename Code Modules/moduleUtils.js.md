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

## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




