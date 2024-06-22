---
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: ["[[DV DQL Weekly Notes#DV DQL Weekly Notes Habit tracking]]", "[[DV DQL Weekly Notes#DV DQL Weekly Notes Tasks Due this week]]", "[[DV DQL Weekly Notes#DV DQL Dailies from last week]]"]
---

## DV DQL Weekly Notes Habit tracking

```js dataview
Table without id link(file.link, dateformat(file.day,"yyyy-MM-dd - cccc")) as "Day" 
From "Discord Support/Dataview Data/Daily notes"
where join(split(dateformat(file.day,"kkkk-WW"),"-"),"-W") = this.file.name
sort file.day
```

### Explanation

- It is a Table that grabs the daily note file name with the format "yyyy-MM-dd" and changes it to the format "kkkk-[W]WW" (2022-W48) to match it the weekly note file name. With that it get's the daily notes of the week.
- it puts out the file name with the format "yyyy-MM-dd - cccc" ("2022-12-06 - Thursday")
- The habit fields are then just added as header.

## DV DQL Weekly Notes Tasks Due this week 

```js dataview
Task
from "Journal/Daily/2022" and #daily
where !completed
where !contains(tags, "habits")
where join(split(dateformat(date(due),"kkkk-WW"),"-"),"-W") = this.file.name 
where due
group by due
```

### Explanation

- change the Where condition to this to get the tasks of the next week `where join(split(dateformat(date(due) - dur(1 w),"kkkk-WW"),"-"),"-W") = this.file.name ` 



## DV DQL Dailies from last week

```dataview
TABLE WITHOUT ID 
file.link AS "Note", 
length(file.etags) as "File Tags"

WHERE dateformat(file.day, "kkkk-WW") = dateformat(date(today) - dur(1 w), "kkkk-WW") 
Sort file.name asc
```
## DV DQL TABLE notes created in last 2 weeks

```js dataview
table file.cday
where dateformat(file.cday, "kkkk-WW") >= dateformat(date(today)-dur("4w") , "kkkk-WW")
sort file.cday asc
```




















