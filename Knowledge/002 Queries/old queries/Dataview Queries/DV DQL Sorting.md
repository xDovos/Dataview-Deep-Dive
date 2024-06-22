---
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: "[[DV DQL Sorting#DV DQL Sort Length]]"
---
Docs:: [DQL Length()](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#lengthobjectarray)



## DV DQL Sort Length

```js dataview
LIST 
SORT length(file.etags)
```

### Explanation 

- The `length()` function returns the length of an array and the SORT can sort after that length


SORT default(((x) => {
"Drama":1, 
"Crime":2,
"Horror": 3,
"Comedy": 4,
"Thriller": 5,
"Science-Fiction": 6
}[x])(field_to_sort), "99") ASC

```dataview
TABLE
FROM "Discord Support"
SORT regexreplace(string(file.link), "[^\x00-\x7F]+(\s)?", "") asc


```

