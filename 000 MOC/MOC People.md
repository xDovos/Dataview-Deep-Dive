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
    - dataCommands:: [[TABLE]], [[FROM]], [[WHERE]], [[FLATTEN]], [[SORT]]
    - functions:: [[date]], [[dur]], [[string]], [[choice]]
    - tags:: 
    - image:: 

## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




