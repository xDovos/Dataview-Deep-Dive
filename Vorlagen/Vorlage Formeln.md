---
alias: 
Type: Formula 
formulas:
  _Var:
    :
      - 
    :
      - 
    :
      - 
    :
      - 
  _Unit:
    - "`=[[]].unit_symbol`"
    - "`=[[]].unit_symbol`"
    - "`=[[]].unit_symbol`"
    - "`=[[]].unit_symbol`"
  _Variables:
    - "[[]]"
    - "[[]]"
    - "[[]]"
    - "[[]]"
---
status::  `$= const setPage = "Vorlage_Weekly_note"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `
###### Status Tasks
- [ ] Add the variable names to the metadata structure 
- [ ] add the Formulas to the metadata
- [ ] Add the links to the Metadata
- [ ] Add the right variable names to the table


##
```dataview
TABLE WITHOUT ID formulas._Var as "Formula Var", formulas._Variables as Variables, formulas._Unit as "Formula Unit"
FROM "Formula"
WHERE file.path = this.file.path
```
