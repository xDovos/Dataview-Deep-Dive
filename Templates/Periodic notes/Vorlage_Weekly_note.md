---
Type: Weekly
---
today:: `=link(string(dateformat(date(now), "yyyy-MM-dd")))`
next:: [[<%tp.date.now("gggg-[W]WW",  "P1W" ,tp.file.title,"gggg-[W]WW")%>]]
prev::  [[<%tp.date.now("gggg-[W]WW", "P-1W" ,tp.file.title,"gggg-[W]WW")%>]]
monthly:: [[<%tp.date.now("yyyy-[M]MM",0,tp.file.title,"gggg-[W]WW")%>]]

# <%tp.file.title%>

<% tp.file.move("/Journal/Weekly/2023/"+tp.file.title) %>

## Weekly Tracking


```dataview
Table without id link(file.link, dateformat(file.day,"yyyy-MM-dd - cccc")) as "Day" , Pushups, Squats, Pullups, Bridges, Leg_Raises, Twists 
From "Journal/Daily/2023"
where dateformat(file.day,"kkkk-'W'WW") = this.file.name
sort file.day
```

```dataview
table split(T.text, " ")[1] as training , choice(T.completed, "✅","❌") as done
From "Journal/Daily/2023"
where dateformat(file.day,"kkkk-'W'WW") = this.file.name
flatten file.tasks as T
where contains(T.tags, "training")
Sort file.day asc


```


## Tasks
### Open tasks this Week

```dataview
Task
from "Journal/Daily/2022" and #daily
where !completed
where !contains(tags, "habits")
where join(split(dateformat(date(due),"kkkk-WW"),"-"),"-W") = this.file.name 
where due
group by dateformat(due,"yyyy-MM-dd - cccc")
```

### Open tasks next Week 

```dataview
Task
from "Journal/Daily/2022" and #daily
where !completed
where !contains(tags, "habits")
where join(split(dateformat(date(due) - dur(1 w),"kkkk-WW"),"-"),"-W") = this.file.name 
where due
group by dateformat(due,"yyyy-MM-dd - cccc")
```

### Dueless Tasks

```tasks
tags includes daily
not done 
no due date

```



## Log

```dataview
Table rows.L.text as "Notes this week"
from "Journal/Daily/2023"
where dateformat(file.day,"kkkk-'W'WW") = this.file.name
flatten file.lists as L
where !L.task
where meta(L.section).subpath = "Log"
group by link(dateformat(date(file.name),"yyyy-MM-dd - cccc")) as File
sort file.day
```

