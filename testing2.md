---
position: test
something: test
map: test
---



```dataview
table flat(map(rows, (r)=> object(r.file.name, list(r.eyecolor))))
where DOB
group by DOB
```

