---
poster: resistor_colour_code.png
tags:
  - daily
  - daily
Birthday: 1999-05-07
FirstContactDate: 2022-11-08
---
# Unsorted Queries

## Overwriting of the task visuals inside TASK Query

```dataview
TASK
FROM "Vault"
where !completed
flatten [file.link + " @ " + text] AS visual
LIMIT 5
```

## Styling of DQL table outputs and Projects and subtasks based on task parent + children

- [ ] Project 1
    - [ ] subtask 1
    - [ ] subtask 2
- [ ] Project 2
    - [ ] subtask 1
    - [x] subtask 2 ✅ 2023-06-27
    - [ ] subtask 3


```dataview
table without id "### <font color=\"#FFA500\"><b>" + l.text + "</b></font>" as project, 
    "`$= dv.taskList(dv.page(\"" + file.name + "\").file.tasks.where((t)=> t.line == \""+s.line+"\" && t.text == \""+s.text+"\"), false)`" AS TASKS, 
    "<progress  value=\"" + length(filter(l.subtasks.completed, (x) => x)) + "\" max=\"" + length(l.subtasks) + "\"></progress><span>hi</span>" as "Progress"
where file.name = this.file.name
flatten file.lists as l
where l.subtasks != []
flatten l.subtasks as s
where s.line = min(filter(l.subtasks, (x) => !x.checked).line)
```



## DO NOT RUN IT how to destroy your notes with dataview + templater
the refresh will run it multiple times and it will insert a template each time it reruns. (template + folders missing so it won't work.)
it is advised to do it the other way around. write a templater script that loads the dataviewjs api.
```js dataviewjs
const inputs = {
    dests: dv.pages('"Knowledge/Material/Elements"'),
    template: app.vault.getAbstractFileByPath("Vorlagen/temp.md"),
}
const { templater } = app.plugins.getPlugin("templater-obsidian")
for (const dest of inputs.dests.map(dest => app.vault.getAbstractFileByPath(dest.file.path))) {
    const text = await app.vault.read(dest)
    await templater.write_template_to_file(inputs.template, dest)
    await app.vault.process(dest, templateText => `${text}${templateText}`)
}

```

## grouping groups in dvjs

it doesn't run because the original data of 150 files are missing in this vault. [[Grouping of groups in dvjs Elements.png]]

```js dataviewjs
const pages = dv.pages('"Knowledge/Material/Periodic Table/Elements"').groupBy(t=> t.periodic_family)
for(let group of pages){
    dv.header(3, group.key)
    let eGroup = group.rows.groupBy(t=> t.periodic_table_group)
    dv.table(["Subtype", "Files"], eGroup.map(t=> [t.key, t.rows.file.link]))
    
}
```


## markdown file text embedding into a table without link embedding

```dataviewjs

async function content(path){
    const text = await dv.io.load(path);
    const headerToExtract = "## activity logging";
    const regex = new RegExp(`${headerToExtract}([\\s\\S]*?)(?=#|$)`, "g");

    let match;
    let extractedContent = []
    while ((match = regex.exec(text)) !== null) {
         extractedContent.push(match[1].trim());
        //console.log(extractedContent);
    }
    return extractedContent
}
const pages = dv.pages().where(t=> t.file.path == dv.current().file.path);
const data = await Promise.all(pages.map(async t=> [t.file.link, dv.paragraph(await content(t.file.path))]));
//console.log(data) //scary console.log. in this case it logs "p" an obsidian internal variable or so.
dv.table(["link", "content"], data)
```

## Seeded RNG testing

seed:: 0157135145448

```js dataview
TABLE RNG, RNG2
FLATTEN (file.size + this.seed) %50 as RNG
FLATTEN (this.seed - file.size) %101 as RNG2
sort RNG desc, RNG2 desc
limit 10
```

```js dataviewjs
const pages = dv.pages()
  .flatMap(page => {
    const property = (page.file.size + dv.current().seed)%500  
    return (typeof property?.[Symbol.iterator] === "function" ? [...property] : [property])
      .map(value => Object.assign(dv.clone(page), { RNG1: value }))
  })
  
const data = pages.sort(t=> t.RNG1, "desc").limit(10).map(t=> [t.file.link, t.RNG1])
dv.table(["link", "RNG1"], data)


```

```js dataview
TABLE RNG3
FLATTEN (file.size + number(dateformat(date("today"), "yyyyMMdd"))) %50 as RNG
FLATTEN (number(dateformat(date("today"), "yyyyMMdd")) - file.size) %101 as RNG2
sort RNG desc, RNG2 desc
group by RNG
flatten [rows.RNG2] as RNG3
limit 10
```

```js dataviewjs
let rng = dv.pages().sort(t=> t.file.size + Number(dv.date("now").toFormat("yyyyMMddhhmm")) % 100, "desc")
dv.span(rng)
```

## Flatten equivalent in dvjs

```js dataviewjs
const pages = dv.pages()
  .flatMap(page => {
    const property = (page.file.size + dv.current().seed)%500  
    return (typeof property?.[Symbol.iterator] === "function" ? [...property] : [property])
      .map(value => Object.assign(dv.clone(page), { RNG1: value }))
  })
  console.log(pages)
const data = pages.sort(t=> t.RNG1, "desc").limit(10).map(t=> [t.file.link, t.RNG1])
dv.table(["link", "RNG1"], data)


```


## Meeting person table? 

```dataviewjs
function diff(left, right) {
    return Object.entries(left.diff(right, ["years", "months", "days", "hours", "minutes",]).toObject())
        .filter(([, value]) => value) // remove to preserve 0s
        .map(([key, value]) => `${Math.round(value,1)} ${key}`)
        .join(", ")
};

const data = [];
const BD = dv.current().Birthday;
const FCD = dv.current().FirstContactDate;
const headers = ["Occasion", "Date", "Days Since", "Days Until Anniversary"];

data.push(["Birthday", BD, diff(dv.date("today"), BD), diff(BD.set(
    {year: BD.set({year: dv.date("today").year}) <= dv.date("today")?
    dv.date("today").year +1 : 
    dv.date("today").year}), dv.date("today"))]);

data.push(["First Contact", FCD, diff(dv.date("today"), FCD), diff(FCD.set(
    {year: FCD.set({year: dv.date("today").year}) < dv.date("today")? 
    dv.date("today").year +1 : 
    dv.date("today").year}), dv.date("today"))]);

dv.span(dv.markdownTable(headers, data));
```

## metadata menu api stuff and sorting by object

```js dataviewjs
const sortObj = {"High": 1, "Interesting": 2, "Medium": 3, "Curious": 4, "low": 5};
const sort2Obj = {"Edit": 1, "Script": 2, "Paused": 3, "Other":4, "empty": 5};

const {fieldModifier: f} = this.app.plugins.plugins["metadata-menu"].api; 

const pages = dv.pages('"Knowledge/Variables"').where(t=> !t.file?.name?.includes("Template") && 
    !t.class?.includes("Essay") && !["Done", "Idea"].includes(t.Status)).sort((t) => sort2Obj[t.status] ?? 6 , "asc");
let data = await Promise.all(pages.map(async p => [ 
    p.file.link, 
    await f(dv,p, "Priority"), 
    await f(dv,p, "Status")]));
console.log(data);
dv.table(["Writing Project", "Priority", "Status"],data);
```

## callouts don't support inline queries


>[!note]+
>text with [key:: [[Metadata Types]]]
>[key2:: help]
>and a text with frontmatter `=this.key`
>and a text with `=this.Fkey`

## Any Contains stuff

```dataview
table filter(this.file.etags, (t)=>!contains(list("#todo", "#DV"), t))
FROM -"Templates"
Where any(file.etags, (x) => contains(filter(this.file.etags, (t)=>!contains(list("#todo", "#DV"), t)) , x)) 
sort file.mtime DESC
```

## activity logging

- [activity:: "stuff"], [start:: 2023-09-07T10:39], [end:: 2023-09-07T11:39]
- [activity:: "class"], [start:: 2023-09-07T11:39], [end:: 2023-09-07T12:19]
- [activity:: "Homework"], [start:: 2023-09-07T12:31], [end:: 2023-09-07T13:09]
- [activity:: "class"], [start:: 2023-09-07T14:39], [end:: 2023-09-07T16:39]
- [activity:: "free time"], [start:: 2023-09-07T14:39], [end:: 2023-09-07T16:39]
 
 ```dataview
TABLE rows.L.activity as "Activity", rows.L.start as "Start", rows.L.end as "End", map(rows.L, (L)=> dur(L.end - L.start)) as Duration
WHERE activity
FLATTEN file.lists as L
WHERE L.activity
group by file.link as File

```

## shows what notes link into an outlink and how many they are. (a roundabout way of doing inlinks)

```js dataview
TABLE length(rows), rows.file.link
FROM -"Journal"
WHERE file.outlinks
flatten file.outlinks as out
group by out as Link
sort length(rows) desc
```
=
```js dataview
TABLE length(file.inlinks), file.inlinks
FROM -"Journal"
sort length(file.inlinks) desc
```

## shows files with double tags inside the tags properties field

```dataviewjs

const pages = dv.pages().where(t=> t.file.frontmatter.tags?.length > 1 ).where(t=> t.tags.length != new Set(t.tags).size)
const data = pages.map(t=> [t.file.link, t.tags])
dv.table(["File", "Tags"], data)

```

## Counting an Emote inside a note

hello world 
🪙🪙🪙 stuff here
🪙 = coin
🪙🪙🪙🪙

```dataviewjs
// load the conent of the current note
let note = await dv.io.load(dv.current().file.path);

// regex the coin emote out of all text including this codeblock, thus -1 is needed
const pattern = /🪙/g;
const matches = note.match(pattern).length -1 ;

// writing the rendered output.
dv.header(2, "Coin Emoji Counter");
dv.paragraph("<progress max = 50 value = "+ matches +"></progress>")
dv.paragraph(matches + " coin"+ (matches >= 2 ? "s" : "") + " found" )

```
🪙🪙🪙

🪙🪙🪙
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
