
# 2023-10-22 Dream about an alien

- I had a ANOTHER dream I was an alien. Later, I found out the alien was actually my dad. [who:: dad], [what:: aliens]

# 2023-10-21 Dream about an alien

- I had a dream I was an alien. Later, I found out the alien was actually my mom. [who:: mom], [what:: aliens]

# query


Answer:: Test

```dataviewjs
const { headings, sections } = app.metadataCache.getFileCache(app.vault.getAbstractFileByPath(dv.current().file.path))
console.log(headings)

console.log(sections)
```


```dataview
TABLE truncate(Answer, 20) as "Answer"
where file.path = this.file.path
```

quote:: test1
quote:: test22
quote:: test35
quote:: test64
quote:: test4
quote:: test24
quote:: test33
quote:: test66
quote:: test26
quote:: test35
quote:: test66
quote:: test34
quote:: test63
quote:: test23
quote:: test34
quote:: test668
quote:: test28
quote:: test37
quote:: test69
quote:: test20
quote:: test30
quote:: test6ß
quote:: test26
quote:: test33
quote:: test64
quote:: test232
quote:: test32
quote:: test612
quote:: test25
quote:: test34
quote:: test65


```dataviewjs

let dql = await dv.tryQuery(`LIST 
    FROM "Knowledge/Testing"
        `)
console.log(dql)
if (dql.values.length != 0){
    let data = dql.values.sort((a,b) => Math.random() - 0.5).slice(0,3).map(a => [a])
    dv.paragraph(data)
}else{
    dv.paragraph("no Results")
}
```
