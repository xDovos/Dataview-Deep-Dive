---
Type: Dataview_Data

---
todo:: `$= const setPages = '"Discord Support/Dataview Data/Project"'; const setFilter = "#todo" ; const value = Math.round(((dv.pages(setPages).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) / (dv.pages(setPages).file.tasks).where(t => t.text.includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.pages(setPages).file.tasks.where(t => t.text.includes(setFilter)).length - dv.pages(setPages).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) + " left</span>"`
Area:: [[Area1]]

```dataview
Table rows.file.link as "Sub Projects", rows.todo, this.todo
From "Discord Support/Dataview Data/Project"
Group by Project

```


- [ ] text [dur:: 5]
- [ ] text [dur:: 6]