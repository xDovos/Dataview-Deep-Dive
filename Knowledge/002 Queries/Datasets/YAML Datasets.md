---
Type: Query
movement:
  - name: Horse
    base: 24
    slow: 12
    normal: 14
    fast: 30
  - name: Car
    base: 42
    slow: 13
    normal: 20
    fast: 50
  - name: Shoe
    base: 13
    slow:
      realslow: 1
      notsoslow:
        - 10
        - 5
    normal: 14
    fast: 14
transport:
  Horse:
    name: Horse
    base: 24
    slow: 12
    normal: 14
    fast: 30
    type: Ground
  Car:
    name: Car
    base: 42
    slow: 13
    normal: 20
    fast: 50
    type: Ground
  Plain:
    name: Plain
    base: 13
    slow: 3
    normal: 14
    fast: 14
    type: Air
movies:
  - title: movie1
    genre:
      - "#tag1"
      - "#tag2"
    director: Name
    year: 2023
    rating: 4.5
    Myrating: ⭐
  - title: movie2
    genre:
      - "#tag1"
      - "#tag2"
    director: Name
    year: 2023
    rating: 4.5
    Myrating: ⭐⭐
self:
  - "[[YAML Datasets#DV DQL TABLE dataset movement]]"
  - "[[YAML Datasets#DV DVJS TABLE dataset movement]]"
  - "[[YAML Datasets#DV DVJS TABLE dataset movement reduced table with column field]]"
  - "[[YAML Datasets#DV DVJS TABLE dataset Transport manually Markdown]]"
  - "[[YAML Datasets#DV DVJS TABLE dataset Transport]]"
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "YAML Datasets", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-10-31
- [x] Write the YAML metadata ✅ 2023-10-31
    - [ ] fix the yamlfied json back into json format. i hate that the properties do this.
- [ ] Write the query


# YAML Datasets

## DV DQL TABLE dataset movement

```dataview
TABLE M.name, M.base, M.slow, M.normal, M.fast
where file.path = this.file.path
FLATTEN movement as M
```



```dataview
TABLE rows.M.base as "base", rows.M.slow as "slow", rows.M.normal as "normal", rows.M.fast as "fast"
where file.path = this.file.path
flatten movement as M
group by M.name as name
```

```dataview
TABLE Without id M.title as "Title", M.genre as "genre", M.director as "director", M.year as "year", M.rating as "rating", M.Myrating as "Myrating"
where file.path = this.file.path
flatten movies as M
```


## DV DVJS TABLE dataset movement 
```dataviewjs
const page = dv.current()
const header = ["Name", "Base", "Slow", "Normal", "Fast"]
const data = page.movement.map(p => [p.name, p.base, p.slow, p.normal, p.fast])
//const md = dv.markdownTable(header, data)
//dv.paragraph(md)
console.log(data)
dv.table(header, data)
```

```dataviewjs
const page = dv.current()
const header = ["Name", "Base", "Slow", "Normal", "Fast"]
const data = page.movement.map(p => [p.name, p.base, p.slow, p.normal, p.fast])


```
## DV DVJS TABLE dataset movement reduced table with column field

tableColumn:: "normal"
```dataviewjs
const Type = dv.current().tableColumn
const min = 15
const max = 35
const page = dv.current()
const header = ["name", Type]
let data = page.movement.map(p => [
			p.name, 
			p[Type]])
//data = data.filter(t=> t[1] <= max && t[1] >= min)
dv.table(header, data)
```

## DV DVJS TABLE dataset Transport manually Markdown    

```dataviewjs 
let pg = dv.current();
let table = "| Name | Base | Slow | Normal | Fast |\n"+
            "| ---- | ---- | ---- | ------ | ---- |\n";

for (let move of Object.entries(pg.transport)){
	table += "| " + move[1].name + 
			"| " + move[1].base + 
			"| " + move[1].slow + 
			"| " + move[1].normal + 
			"| " + move[1].fast + 
			"|\n" 
}
dv.paragraph(table)

```

## DV DVJS TABLE dataset Transport

```dataviewjs 
const pg = dv.current()
const header = ["Name", "Base", "Slow", "Normal", "Fast", "Type"]
let data = []

for (let move of Object.entries(pg.transport)){
	if (move[1].type != ""){
		data.push([
			move[1].name, 
			move[1].base, 
			move[1].slow, 
			move[1].normal, 
			move[1].fast,
			move[1].type
		])
	}
}
dv.paragraph(dv.markdownTable(header, data))
dv.table(header, data)
```



## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```



