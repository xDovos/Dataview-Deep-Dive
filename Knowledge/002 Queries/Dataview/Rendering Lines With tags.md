---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Rendering Lines With tags", "Status Tasks")`

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the Note


# Rendering Lines With tags

#hi test with #hello
#yo line

## unnamed
path:: "Knowledge/002 Queries/Dataview/Rendering Lines With tags.md"

```js
// Get all files in the vault
// Get all files in the vault
const file = app.vault.getAbstractFileByPath(dv.current().path);
// Get all tags in the file that match the desired tag
const tags = app.metadataCache.getFileCache(file)?.tags?.filter((t) => dv.func.contains(["#hello", "#hi", "#yo"], t.tag))|| [];
if (tags.length > 0) {
    // Get the contents of the file split into lines
    const lines = (await app.vault.cachedRead(file)).split("\n");
    // Find the line each tag is on and render it as a paragraph
    const gtags = dv.array(tags).groupBy(tag => tag.tag)
    console.log(gtags)
    gtags.forEach((tag) => {
        dv.header(2,tag.key)
        console.log(tag.rows)
        tag.rows.forEach(t=>{
            dv.paragraph(lines[t.position.start.line]);
        });
        
    });
}


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

## unnamed

```js 
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

