---
size: big
tags: ["test"]
---

## DV DVJS TABLE Limit on each field Value

```js dataviewjs 
const small = dv.pages().where(t => t.size == "small").sort(s => s.file.ctime , "asc").limit(6);
const medium = dv.pages().where(t => t.size == "medium").sort(s => s.file.ctime , "asc").limit(2);
const big = dv.pages().where(t => t.size == "big").sort(s => s.file.ctime , "asc").limit(2);
let data = []
if(small.length > 0){
data.push(small)
}
if(medium.length > 0){
data.push(medium)
}
if(big.length > 0){
data.push(big)
}
const headers = ["Link","cday", "size"]
data= data.map(p => [p.file.link, p.file.cday,p.size])
console.log(data)
dv.table(headers, data)
```

