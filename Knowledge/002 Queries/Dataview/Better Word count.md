---
aliases: 
Type: Query
MOC: 
float: 51.9
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Better Word count", "Status Tasks")`

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the Note


# Better Word count

## Words in all notes


```dataviewjs
const bwc = app.plugins.plugins["better-word-count"].api;
console.log(bwc)
dv.paragraph("Daily Characters: " + await bwc.getDailyCharacters());

dv.table(["Name", "Word Count", "Character Count"],
    await Promise.all(dv.pagePaths().values.map(async (pagePath) => {
        return [pagePath, await bwc.getWordCountPagePath(pagePath), await bwc.getCharacterCountPagePath(pagePath)]
    }))
);
```

>[!info]- Rendered
>```dataviewjs
>
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: 
    - JSfunctions:: 
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

