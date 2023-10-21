---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Metadata", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-21
- [ ] Write the YAML metadata
- [ ] Write the query


# Metadata Types

- docs:: [Metadata Types](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/)

## Strings 


## Numbers


## Boolean


## Objects


### Arrays


### Links



### Dates


### Durations


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




