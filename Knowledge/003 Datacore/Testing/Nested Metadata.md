---
parent:
  - "[[Glossary/Dimensions/Dimensions|Dimensions]]"
fileClass: Dimensions
mathLink: $\boldsymbol{T}[\pu{K,\degree{C},\degree{F},\degree{R}}]$
mathLink-blocks:
  AltNotation: ${\color{Melon}T}$
  Dimensions: $\boldsymbol{\theta}$
  LinkedDimensions: 
  StaticDimensions: 
  LinkedStaticDimensions: 
  MKS: $\boldsymbol{T}[\pu{K}]$
  CGS: $\boldsymbol{T}[\pu{\degree{C}},\pu{K}]$
  FPS: $\boldsymbol{T}[\pu{\degree{F}},\degree{R}]$
  Formula: $\Delta {\color{Melon}T}$
  Formula1: ${\color{brown}T_{s}}_{in}[\pu{K}]-{\color{brown}T_{s}}_{out}[\pu{K}]$
  Formula2: ${\color{brown}T_{s}}-{\color{orange}T_{\infty}}$
  Formula3: ${\color{red}T_{H}}-{\color{blue}T_{C}}$
  Formula4: 
  Formula5: 
  LinkedFormula: <span class="center-align">[[Change in]] [[Temperature#^AltNotation]]</span>
  LinkedFormula1: <span class="center-align"><sup>[[Surface Temperature]]-[[Surface Temperature#^AltNotation]]</span></span>
  LinkedFormula2: <span class="center-align"><sup>[[Surface Temperature#^AltNotation]]-[[Surroundings Temperature]]</span></span>
  LinkedFormula3: <span class="center-align"><sup>[[Hot Temperature]]-[[Cold Temperature]]</span></span>
  LinkedFormula4: 
  LinkedFormula5: 
  ParentVariable: 
aliases: 
Type: Dimension
related:
  - "[[Change in]]"
dimensions: "1"
staticdimensions: 
definition: 
title: Temperature
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Nested Metadata", "Status Tasks")`

```dataviewjs
function get_count(tag){
    return dv.pages(`${tag}`).length;
}
let data = [];
data.push(["Number of notes with #todo", get_count("#todo")]);
data.push(["Number of notes with #work", get_count("#work")]);

dv.table(["Tag", "Value"], data);
```

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the Note

#datacore
# Nested Metadata

```datacorejsx

let COLUMNS = [
    { id: "File", value: (file) => file.$link}
];

function addColumn(field){
    for(let name in field[0]){
        COLUMNS.push({id: name, value: (file) => file.value("mathLink-blocks")[name]})
    }
}


return function View() {
    const qdata = dc.useQuery(`@page and #datacore`);
    addColumn(qdata.map(file => file.value("mathLink-blocks")))
    //console.log(qdata)
    console.log(COLUMNS)
    return (
        <dc.VanillaTable columns={COLUMNS} rows={qdata} paging= {20}/>
    );
}

```




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

