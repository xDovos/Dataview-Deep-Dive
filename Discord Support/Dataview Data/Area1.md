---
Type: Test
---

```dataview
Table project
where project
where contains(project.area, this.file.link)
```

```dataview
Table sum(default(rows.T.dur, 0))
where project
where contains(project.area, this.file.link)
flatten file.tasks as T
group by project
```


```dataview
Table sum(default(file.tasks.dur, 0))
where contains(area, this.file.link)

```
