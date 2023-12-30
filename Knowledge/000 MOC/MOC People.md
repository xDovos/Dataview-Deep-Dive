---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "MOC People", "Status Tasks")`

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the query


# MOC People

## Overview

```js
TABLE DOB, Adress, Country, Email, Website, Twitter
FROM "Knowledge/People"
```

>[!info]- Rendered
>```dataview
>TABLE DOB, Adress, Country, Email, Website, Twitter
>FROM "Knowledge/People"
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[FROM]]
    - functions:: 
    - tags:: 
    - image:: 

## Birthdays

```JS
TABLE DOB, WillBe, On
FROM "Knowledge/People"
WHERE DOB and !DOD
FLATTEN date(today).year - DOB.year AS ThisYearAge
FLATTEN DOB + dur(string(ThisYearAge) + " years") AS ThisBDay
FLATTEN choice(ThisBDay > date(today), ThisYearAge, ThisYearAge+1) AS WillBe
FLATTEN choice(ThisBDay > date(today), ThisBDay, ThisBDay + dur("1 year")) AS On
SORT On
```

>[!info]- Rendered
>```dataview
>TABLE DOB, WillBe, On
>FROM "Knowledge/People"
>WHERE DOB and !DOD
>FLATTEN date(today).year - DOB.year AS ThisYearAge
>FLATTEN DOB + dur(string(ThisYearAge) + " years") AS ThisBDay
>FLATTEN choice(ThisBDay > date(today), ThisYearAge, ThisYearAge+1) AS WillBe
>FLATTEN choice(ThisBDay > date(today), ThisBDay, ThisBDay + dur("1 year")) AS On
>SORT On
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[FROM]], [[WHERE]], [[FLATTEN]], [[Knowledge/001 Dataview/DQL/Data Commands/SORT]]
    - functions:: [[date]], [[dur]], [[string]], [[choice]]
    - tags:: 
    - image:: 

## Appearances

```dataviewjs
const inlinks = dv.current().file.inlinks
const outlinks = dv.current().file.outlinks.mutate(t=> t.embed = false)
const indexA = Array.from({ length: Math.max(inlinks.length, outlinks.length) }, (_, index) => index)
const data = indexA.map((i)=> [inlinks[i] || " ", outlinks[i] || " "])
const style = "<span style='font-size:smaller;color:var(--text-muted)'>("
dv.table(["inlinks "+ style + inlinks.length +")", "outlinks "+ style + outlinks.length +")"], data)
this.container.querySelectorAll(".table-view-table tr:first-of-type th:first-of-type > span.small-text")[0].style.visibility = "hidden";
```

