---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "DVJS with custom Functions", "Status Tasks")`

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the Note


# DVJS with custom Functions

## using async functions in map

```dataviewjs 
async function content(page){
    const file = app.vault.getAbstractFileByPath(page.file.path)
    const contents = await app.vault.read(file)
    return contents
}
let data = await Promise.all(dv.pages('"Knowledge/000 MOC"').map(async p => [p.file.link, await content(p)]))
dv.table(["File", "content"], data)
```

>[!info]- Rendered
>```dataviewjs
>async function content(page){
>    console.log(page)
>    let content = await dv.io.load(page.file.path)
>    return content
>}
>let pages = dv.pages('"Knowledge/000 MOC"')
>console.log(pages)
>let data = await Promise.all(pages.map(async p => [file.link, await content(p)]))
>dv.table(["File", "content"], data)
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

