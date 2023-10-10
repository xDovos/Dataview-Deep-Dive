---

class: area
Type: Dataview_Data
date: 2023-02-13
---
Todo::  `$= const setPage = "sub Project 1"; const setFilter = "#todo" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => t.text.includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => t.text.includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => t.text.includes(setFilter)).length) + " left</span>" `

Project:: [[test Project]]


#### todo 

- [ ] #todo test 1 [dur:: 5]
- [ ] #todo task 2 

