---
aliases: []
Type: 
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "All properties and values", "Status Tasks")`

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the query
- [ ] Queries
    - [x] All properties and values overview ✅ 2023-12-24
        - [x] Write the Query ✅ 2023-12-24
        - [x] Write the Query Metadata ✅ 2023-12-24


# All properties and values 

## All properties and values overview

```js
let uniqueProperties = [];

Object.values(app.metadataCache.getAllPropertyInfos()).forEach(async (prop) => {
  const propAndValues = prop;
  propAndValues.values = DataviewAPI.func.unique(
    DataviewAPI
      .pages('-"Raw Data"')
      .filter((page) => page.file?.frontmatter?.[propAndValues.name])
      ?.[propAndValues.name]?.array?.()
  );
  uniqueProperties.push(propAndValues);
});

uniqueProperties = DataviewAPI.func.unique(uniqueProperties)
dv.table(
  ['Property name', 'Type', 'Unique values'],
  uniqueProperties
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    .map((prop) => [
      prop.name,
      prop.type,
      prop.values
    ])
);
```


>[!info]- Rendered
>```dataviewjs
>let uniqueProperties = [];
>
>Object.values(app.metadataCache.getAllPropertyInfos()).forEach(async (prop) => {
>  const propAndValues = prop;
>  propAndValues.values = DataviewAPI.func.unique(
>    DataviewAPI
>      .pages('-"Raw Data"')
>      .filter((page) => page.file?.frontmatter?.[propAndValues.name])
>      ?.[propAndValues.name]?.array?.()
>  );
>  uniqueProperties.push(propAndValues);
>});
>
>uniqueProperties = DataviewAPI.func.unique(uniqueProperties)
>dv.table(
>  ['Property name', 'Type', 'Unique values'],
>  uniqueProperties
>    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
>    .map((prop) => [
>      prop.name,
>      prop.type,
>      prop.values
>    ])
>);
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: [[dv.pages]], [[dataArray.filter]], [[DataArray.array]], [[dataArray.push]], [[unique]], [[DataArray.sort]], [[DataArray.map]], [[dv.table]]
    - JSfunctions:: [[Object.values]]
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

