---
position: test
something: test
map2: test
list:
---



```dataview
table flat(map(rows, (r)=> object(r.file.name, list(r.eyecolor))))
where DOB
group by DOB
```


[[test of testing2]]
