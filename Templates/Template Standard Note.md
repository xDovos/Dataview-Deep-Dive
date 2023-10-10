---
aliases: []
Type: 
MOC:
---

status::  

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the query


# <%tp.file.title%>



## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```




