---
Alias:  
Type: MOC

---

status::  `$= const setPages = '"Knowledge/"'; const setFilter = "Status Tasks" ; const value = Math.round(((dv.pages(setPages).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.pages(setPages).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.pages(setPages).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.pages(setPages).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>"`

# Vorlage_Weekly_note


```dataview
table status, "`$=const tasks = dv.page(\"" + file.name + "\").file.tasks.where(t=> !t.checked && t.section.subpath == 'Status Tasks');let md =  '>[!todo]- Tasks\n>'+ String.fromCharCode(96).repeat(3) + 'dataviewjs\n>let group2 = dv.array(JSON.parse('+String.fromCharCode(96);let md2 = String.fromCharCode(96)+'));\n>dv.taskList(group2, false);\n>'+ String.fromCharCode(96).repeat(3)+ '\n';dv.span(md + JSON.stringify(tasks.array()) + md2);`" AS TASKS
from "Knowledge/"

```



