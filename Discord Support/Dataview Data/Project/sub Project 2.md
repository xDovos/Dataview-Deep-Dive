---
class: area
Type: Dataview_Data
date: 2023-02-12
---
Todo::  `$= const setPage = "sub Project 2"; const setFilter = "#todo" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => t.text.includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => t.text.includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) + " left</span>" `
Project:: [[Test Project]]


#### todo 

- [ ] #todo test 1 [dur:: 10]
- [x] #todo task 2  [dur:: 15] ✅ 2023-05-29
- [ ] <font color="#ff726f">test</font> task 3 (dur:: 30)

## next header

#tag2
- [ ] #tag2 task

