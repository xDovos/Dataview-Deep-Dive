---

Type: Dataview
QueryType: DQL
tags: [DV/DVJS, DV/Query]
self: ["[[DV DQL TABLE lists Manipulation#DV DQL TABLE lists Manipulation]]","[[DV DQL TABLE lists Manipulation#DV DQL TABLE lists under a header]]"]
---
## header 
- [type:: lunch], [start:: 2022-10-10T12:00:00],[end:: 2022-10-10T13:13:13]
- [type:: dinner], [start:: 2022-10-10T20:00:00],[end:: 2022-10-10T21:13:13]
- text
  

- [ ] Single space [priority:: medium], [created:: 2023-04-24], [start:: 2023-04-25], [due:: 2023-04-26]

```dataview
TASK
WHERE file.path = this.file.path
where due
group by file.link
```




## DV DQL TABLE lists Manipulation


```dataview
table without id L.type ,L.start, L.end, round((L.end - L.start).hours,2) + " hours" as "Dur", L.text
where file.path = this.file.path
flatten file.lists as L
where L.type
```


## DV DQL TABLE lists under a header

```dataview
Table rows.L.text
where file.name = this.file.name 
flatten file.lists as L
where meta(L.section).subpath = "header"
group by file.link
```

### Explanation 

- Flatten file.lists as L flattens all lists points into it's own table row so that you can use Where on them 
- WHERE meta(L.section).subpath changes the path link (filename > header) to only the string "header" so that we can compare the header without having to consider the file name that is differently for each file.
- Group by file.link regroups all remaining lists back into one file.link row. Note: you now need rows. before your table header names.


## Lectures

- [date:: 2023-05-10], [subject:: stuff], [note:: note stuff]
- [ ] [date:: 2023-05-12], [subject:: other stuff], [note:: [[lecture note]]]
- [date:: 2023-05-14], [subject:: matter], (note:: [[lecture note2]])
- [x] [date:: 2023-05-20], [subject:: other stuff], [note:: [[lecture note]]] ✅ 2023-05-29

```dataview
TABLE without id L.date, L.subject, L.note
WHERE file.path = this.file.path
flatten file.lists as L
where L.subject

```



- Add setting/configuration panel to change options #trouble
- text #trouble 
```dataview
TABLE L.text as Text
FROM #trouble
where file.path = this.file.path
flatten file.lists as L
where contains(L.tags, "#trouble")

```
- text #trouble 

```dataviewjs
console.log('#'.charCodeAt(0))

```
