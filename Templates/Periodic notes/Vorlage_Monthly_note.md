---
Type: Monthly
---
today:: `=link(string(dateformat(date(now), "yyyy-MM-dd")))`
next:: [[<%tp.date.now("yyyy-[M]MM","P1M",tp.file.title,"yyyy-[M]MM")%>]]
prev::  [[<%tp.date.now("yyyy-[M]MM","P-1M",tp.file.title,"yyyy-[M]MM")%>]]


# <%tp.file.title%>

<% tp.file.move("/Journal/Monthly/2023/"+tp.file.title) %>

## Monthly Tracking

```dataview
Table  link(rows.file.link, dateformat(rows.file.day,"yyyy-MM-dd - cccc")) as "Day", rows.Pushups as Pushups, rows.Squats as Squats, rows.Pullups as Pullups, rows.Bridges as Bridges, rows.Leg_Raises as "Leg Raises", rows.Twists as Twists
From "Journal/Daily/2023"
where dateformat(file.day,"yyyy-'M'MM")= this.file.name
sort file.day
group by weekly
```

## Tasks
### Open tasks this month

```dataview
Task
from "Journal/Daily/2023" and #daily
where !completed
where !contains(tags, "habits")
where join(split(dateformat(date(due) ,"yyyy-MM"),"-"),"-M") = this.file.name 
where due
group by dateformat(due,"yyyy-MM-dd - cccc")
```

### Open tasks next month 

```dataview
Task
from "Journal/Daily/2023" and #daily
where !completed
where !contains(tags, "habits")
where join(split(dateformat(date(due) - dur(1 mo),"yyyy-MM"),"-"),"-M") = this.file.name 
where due
group by dateformat(due,"yyyy-MM-dd - cccc")
```

### Dueless Tasks

```tasks
tags includes daily
not done 
no due date

```



## Daily Log

```dataview
Table rows.L.text as "Notes this Month"
from "Journal/Daily/2023"
where dateformat(file.day,"yyyy-'M'MM") = this.file.name
flatten file.lists as L
where !L.task
where length(L.text) > 1
where meta(L.section).subpath = "Log"
sort rows.file.day
group by dateformat(date(file.name),"yyyy-MM-dd - cccc") as File
```




