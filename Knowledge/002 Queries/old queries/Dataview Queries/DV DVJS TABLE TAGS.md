---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: "[[DV DVJS TABLE TAGS#DV DVJS TABLE TAGS 2 column]]"
---

## DV DVJS TABLE TAGS 2 column

```dataviewjs
let DQL = await dv.tryQuery(`table \
Flatten file.tags as T \
group by T as Tags`)

//removing the 1 value sub arrays
DQL = DQL.values.flatMap(x => x)

//separating the 1 level tags from the sub tags
let tag1 = []
let tag2 = []
for(let i in DQL){
    if (DQL[i].split("/").length == 1){
        tag1.push(DQL[i])
    }
    if (DQL[i].split("/").length > 1){
        tag2.push(DQL[i])
    }
}
//grouping the subtags together by the first level tag
tag2 = dv.array(tag2).groupBy(t => t.split("/")[0])

//matching the subtags to the right row with the first level tag
function Match(key1, key2){
    for(let j in key2.values){
        if(key2[j][0] == key1){
            return key2[j][1]
        }
    }
    return null
}

//creating the table
dv.table(["tag", "subtags"], tag1.map(x=>[x, Match(x,tag2.map(x=>[x.key,x.rows]))]))
```

```js dataviewjs
const DQL = await dv.tryQuery(`table rows.file.link 
Flatten file.etags as T 
group by T as Tags`)

//console.table(DQL.values)
dv.table(["Tag", "source"],DQL.values)

```
