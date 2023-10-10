---
homeworktime: "0"
homeworkTask: 
learningTime: "0"
learningTask:
---



- [activity:: "stuff"], [start:: 2023-09-07T10:39], [end:: 2023-09-07T11:39]
- [activity:: "class"], [start:: 2023-09-07T11:39], [end:: 2023-09-07T12:19]
- [activity:: "Homework"], [start:: 2023-09-07T12:31], [end:: 2023-09-07T13:09]
- [activity:: "class"], [start:: 2023-09-07T14:39], [end:: 2023-09-07T16:39]
- [activity:: "free time"], [start:: 2023-09-07T14:39], [end:: 2023-09-07T16:39]
 
 ```dataview
TABLE rows.L.activity as "Activity", rows.L.start as "Start", rows.L.end as "End", map(rows.L, (L)=> dur(L.end - L.start)) as Duration
WHERE activity
FLATTEN file.lists as L
WHERE L.activity
group by file.link as File

```

```dataview
TABLE length(rows), rows.file.link
WHERE file.outlinks
flatten file.outlinks as out
group by out as Link
sort length(rows) desc
```