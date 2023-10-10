---
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: "[[DV DQL TABLE with Tasks#DV DQL TABLE with Tasks]]"

---
Docs:: [DQL Length()](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#lengthobjectarray)


## DV DQL TABLE with Tasks

```dataview
table "`$= dv.taskList(dv.page(\"" + file.name + "\").file.tasks.where(t=> !t.completed && t.tags.includes('#todo')), false)`" AS TASKS
From "Discord Support/Dataview Data"
where file.tasks
```

### Explanation 

- it uses a DVJS inline code task query as a header and works the same principle as using a field with a inline code inside of it.
- it returns all tasks inside the file of the table row.

Mnemonic:: "Hi"
Mnemonic:: "yes"
Mnemonic:: "no"
```dataview
Table Mnemonic
where file.path = this.file.path
```
x:: 20
y:: 13
z:: 3


```dataview
Table x, y, z, "`$=Math.sqrt(\""+ x + y + z + "\")`" as Distance
where file.name = this.file.name
```
