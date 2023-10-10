---
Type: Dataview
QueryType: "DVJS"
tags: [DV/DVJS, DV/Query, Templater]
self: ["[[DV DVJS Templater#DV DVJS Templater List]]", "[[DV DVJS Templater#DV DVJS Templater Table]]", "[[DV DVJS Templater#DV DVJS Templater List with DQL Query]]", "[[DV DVJS Templater#DV DVJS Templater Table with DQL Query]]"]
---
Docs:: [markdownList](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvmarkdownlistvalues), [markdownTable](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvmarkdowntableheaders-values)


## DV DVJS Templater List

```js
<%*
const folder = tp.file.folder(true)
const dv = app.plugins.plugins["dataview"].api
const query = dv.pages().where(t => t.file.folder == folder).file.link
let md = dv.markdownList(query)
%>
<% md %>
```

### Explanation

- it uses the markdown functions to get the dataview query into a format that templater can print out correctly into the note.
- right now it is printing out the files of the folder the note is in. the folder can be changed by changing the where() condition

## DV DVJS Templater Table


```js
<%*
const folder = tp.file.folder(true)
const dv = app.plugins.plugins["dataview"].api
const pages = dv.pages().where(t => t.file.folder == folder.file.link)
const header = ["Link", "cday", "mday"]
const data = pages.map(p => [p.file.link, p.file.cday, p.file.mday])
const md = dv.markdownTable(headers, data)
%>
<% md %>
```

### Explanation

- it uses the markdown functions to get the dataview query into a format that templater can print out correctly into the note.
- right now it is printing out the files of the folder the note is in. the folder can be changed by changing the where() condition

## DV DVJS Templater List with DQL Query

```js
<%*
const dv = app.plugins.plugins.dataview.api;
let results = await dv.tryQuery(' \
  LIST WITHOUT ID file.name \
  FROM "Discord Support"')

let md = dv.markdownList(results.values)
%>
<% md %>
```


## DV DVJS Templater Table with DQL Query

```js
<%*
const dv = app.plugins.plugins.dataview.api;
let results = await dv.tryQuery(`
  TABLE file.name
  FROM "Discord Support"`)
  
let md = dv.markdownTable(results.headers, results.values)
%>
<% md %>
```

### Explanation 

- Note there can't be "spaces" behind the \ or the string breaks

## DV DVJS Templater non md files

```js
<%*
const dv = app.plugins.plugins.dataview.api;
const folder = '999 Attachments'
const nonMdFiles = app.vault.getFiles().filter(file => file.extension !== 'md' && file.path.includes(folder))
let files = dv.markdownList(dv.array(nonMdFiles.map(file => dv.fileLink(file.path))).sort((file) => file.path, "asc"))
console.log(files)
  
%>
<% files %>
```

