---
poster: "resistor_colour_code.png"
---

## Gets all subfolders of the current file folder
```dataviewjs
const currentFileDV = dv.current().file
const currentFile = app.vault.getAbstractFileByPath(currentFileDV.path)
const allFolders
 = currentFile.parent.children.filter(absFile=> absFile.hasOwnProperty("children"))
const folderNames = allFolders.map(folder=> folder.name)

dv.list(folderNames)
```

## Flatten Abuse that works


```js dataview
TABLE WITHOUT ID file.link
FROM "Knowledge "
GROUP BY ""
FLATTEN [filter(rows.file, (file) => startswith(file.path, "Knowledge"))] AS include
FLATTEN [filter(rows.file, (file) => startswith(file.path, "Knowledge/Material"))] AS exclude
FLATTEN exclude.lists AS excludeList
FLATTEN [map(filter(excludeList, (entry) => econtains(["Read", "Write"], meta(entry.section).subpath)).text, (text) => link(regexreplace(split(text, "\|")[0], "\[\[|\]\]", ""))).file] AS mentioned
FLATTEN [filter(include, (file) => !econtains(mentioned.path, file.path))] AS results
FLATTEN results AS file
```

## DV DVJS TASK Status Count table

```dataviewjs
const tasksFlattened = dv
    .pages("")
    .filter((n) => n.file.tasks.length)
    .map((n) => n.file)
    .expand("tasks")
    .map((n) => n.tasks.array())
    .array()
    .flat(Infinity),
  statusCounts = tasksFlattened.reduce(
    (c, { status: key }) => ((c[key] = (c[key] || 0) + 1), c),
    {}
  ),
  entries = Object.entries(statusCounts).sort((a, b) =>
    a[0].localeCompare(b[0], "en", { sensitivity: "base" })
  )

entries.forEach((e) => (e[0] = `\`[${e[0]}]\``))

dv.paragraph(dv.markdownTable(["Checkbox status", "#"], entries))
```

```dataviewjs
dv.span(dv.pages().where(t=> t.file.tasks.length >= 1).length)

```



## Clickable Picture Links 


>[!note]- header 
>[![[resistor_colour_code.png]]](<Discord Support/Dataview/test data/Test Data 1>)


```dataview
TABLE "[![["+poster+"]]](<"+file.path+">)" as Image
where file.path = this.file.path

```


## getting the file link after filtering a word inside the tasks 

```dataviewjs 
const filter = "daily"
const temp = dv.pages().where(t=> t.file.tasks).file.tasks.where(t => t.text.includes(filter)).groupBy(t=> t.link).key.path
const pages = temp.map(t=> dv.fileLink(t))
dv.span(pages)

```


##  quotes query and daily quotes generator

- [ ] [quote:: "hi long text2."] , [author:: "me"]
- [x] [quote:: "hi long: text."] , [author:: "me"] ✅ 2023-05-29
- [ ] [quote:: "hi long: text."] , [author:: "me"]


```dataviewjs
const pages = dv.pages().file.lists.where(t=> t.section.subpath == "Daily Quotes");
let maths = dv.date("today").toFormat("yyyyMMdd") % pages.length;
console.log(maths)
dv.span(pages[maths].text);
```

```dataview
table without id L.quote, L.author
where quote
flatten file.lists as L
where L.quote
```


maths = dv.date("today").toFormat("yyyyMMdd") % pages.length
## Daily Quotes

- “Books are the training weights of the mind. They are very helpful, but it would be a bad mistake to suppose that one has made progress simply by having internalized their contents.” – **Epictetus**
- "Next Quote" - me
- "third note you" - also me
- "Next Quote3" - me
- "third note you2" - also me2
- "Next Quote5" - me
- "third note you7" - also me

```dataview
list without id rows.L[NM].text
Where file.lists
flatten file.lists as L
where meta(L.section).subpath = "Daily Quotes"
group by file.name as Temp
flatten number(dateformat(date("now"), "yyyyMMdd")) % length(rows.L) as NM
```


## DV DVJS adding index Column

```dataviewjs
const dql = await dv.tryQuery(`TABLE element_abbreviation as AB, atomic_mass, density, conductivity
FROM "Knowledge/Material/Periodic Table"
where periodic_family = link("Actinoids")`)
let header = ["index", ...dql.headers]
console.log(i)
let data = dql.values.map((t,i) => [i, ...t])

dv.table(header, data)
```

## DV DVJS time greeting

```dataviewjs
const time = dv.date("now")
const hour = time.toFormat("H"); 
const hourWord = hour > 16 ? hour < 20 ? "Evening" : "Night" : hour < 4 ? "Night" : hour < 12 ? "Morning" : "Afternoon";
dv.header(1,"it\'s " + time.toFormat("cccc, MMMM dd, yyyy 'at' t'.'"))
dv.header(2, "Good "+ hourWord + ", Rob" )
```

## Calendar
date-de-naissance:: 1999-02-13

```dataview
CALENDAR Next
where file.path = this.file.path
FLATTEN date(today).year - date-de-naissance.year as Y
FLATTEN date-de-naissance + dur(string(Y) + "years") as BD
FLATTEN choice(BD > date(today), Y, Y+1) as WB
FLATTEN choice(BD > date(today), BD, BD+dur("1 year")) as Next
SORT Next
```
## DV DQL Tag view
```dataview
Table length(rows.file.link)
FROM ""
where file.etags
flatten file.etags as T
group BY T as "Tags"
sort length(rows.file.link) desc

```

## DV DQL Find Alias use
[[DV DVJS TABLE TAGS|test]]
[[DV DQL Sorting]]

```js dataview
table link(meta(out).path) as "Link Path", out as "Link Alias"
where file.outlinks
flatten file.outlinks as out
where !contains(meta(out).path, meta(out).display)
limit 50
```

```dataview
table map(rows.out, (t)=> choice(meta(t).subpath, 
    "[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
    link(meta(t).path))) as "Outlinks", 
    rows.file.link as "Linked in"
FROM -"Discord Support" and -"DoxFolder"
where file.outlinks
flatten file.outlinks as out
where !contains(meta(out).path, meta(out).display)
group by link(meta(out).path) as "Outlink"
limit 50
```

```dataviewjs
let nivel0 = dv.pages().where(t=> t.nivel == 0).file.link
let nivel1 = dv.pages().where(t=> t.nivel == 1).file.link
let nivel2 = dv.pages().where(t=> t.nivel == 2).file.link
let nivel3 = dv.pages().where(t=> t.nivel == 3).file.link
let nivel4 = dv.pages().where(t=> t.nivel == 4).file.link
let nivel5 = dv.pages().where(t=> t.nivel == 5).file.link
let nivel6 = dv.pages().where(t=> t.nivel == 6).file.link
let nivel7 = dv.pages().where(t=> t.nivel == 7).file.link
let nivel8 = dv.pages().where(t=> t.nivel == 8).file.link
let nivel9 = dv.pages().where(t=> t.nivel == 9).file.link

let data = [0].flatMap(()=> [nivel0, nivel1, nivel2, nivel3, nivel4, nivel5, nivel6, nivel7, nivel8, nivel9 ])
console.log(nivel0)
dv.table(["Nivel 0", "Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4", "Nivel 5", "Nivel 6", "Nivel 7", "Nivel 8", "Nivel 9", ], data)

```

```dataviewjs
let Cclass = "Mage";
let nivel0 = dv.pages().where(t=> t.nivel == 0 && dv.array(t.class).includes(Cclass)).file.link;
let nivel1 = dv.pages().where(t=> t.nivel == 1 && t.class.includes(Cclass)).file.link;
let nivel2 = dv.pages().where(t=> t.nivel == 2 && t.class.includes(Cclass)).file.link;
let nivel3 = dv.pages().where(t=> t.nivel == 3 && t.class == Cclass).file.link;
let nivel4 = dv.pages().where(t=> t.nivel == 4 && t.class == Cclass).file.link;
let nivel5 = dv.pages().where(t=> t.nivel == 5 && t.class == Cclass).file.link;
let nivel6 = dv.pages().where(t=> t.nivel == 6 && t.class == Cclass).file.link;
let nivel7 = dv.pages().where(t=> t.nivel == 7 && t.class == Cclass).file.link;
let nivel8 = dv.pages().where(t=> t.nivel == 8 && t.class == Cclass).file.link;
let nivel9 = dv.pages().where(t=> t.nivel == 9 && t.class == Cclass).file.link;

let long = Math.max(nivel0.length, nivel1.length, nivel2.length, nivel3.length, nivel4.length, nivel5.length, nivel6.length, nivel7.length, nivel8.length, nivel9.length)
let data = []
for(let Iso = 0; Iso< long; Iso++){
     data.push(Iso)
}
//console.log(long)
//console.log(data)
data = data.map((i)=> [nivel0[i], nivel1[i], nivel2[i], nivel3[i], nivel4[i], nivel5[i], nivel6[i], nivel7[i], nivel8[i], nivel9[i]]);

dv.table(["Nivel 0", "Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4", "Nivel 5", "Nivel 6", "Nivel 7", "Nivel 8", "Nivel 9", ], data);
```

## Table without Query

```dataviewjs
let data = [{image: "Battery internal Resistance.png", name: "Plot", size: "400x600"},
            {image: "Plot P to R r.png", name: "image", size: "299x103"}]

data = data.map(t=> [dv.fileLink(t.image, true), t.name, t.size])

dv.table(false, data)
```

## Ghost links


```js dataviewjs
dv.list([...dv.pages()]
    .reduce((acc, { file: { outlinks }}) => {
        acc.push(...outlinks)
        return acc
    }, [])
    .filter(({ path }) => !app.vault.getAbstractFileByPath(path)))

```

