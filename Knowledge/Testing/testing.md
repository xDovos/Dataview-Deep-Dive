
# 2023-10-22 Dream about an alien

- I had a ANOTHER dream I was an alien. Later, I found out the alien was actually my dad. [who:: dad], [what:: aliens]

# 2023-10-21 Dream about an alien

- I had a dream I was an alien. Later, I found out the alien was actually my mom. [who:: mom], [what:: aliens]

# query


```dataview
TABLE rows.L.text, rows.L.who as Who, rows.L.what as What
WHERE file.lists and who
FLATTEN file.lists as L
WHERE L.who
GROUP BY L.section as Section

```



```js dataview
Table length(rows.file.link) as count, rows.amount[0] as Total, Percentage
Group by "" as All
Flatten [length(rows.file.link)] as amount 
Flatten rows.file.link as links
Group by containsword(links.reviewtags, "early") as groups
Flatten [round((length(rows.file.link) / rows.amount[0])*100, 2)] as Percentage
```

[[test of testing]]

```dataview
table out, choice(out.file, "✅","❌")
from "Knowledge/Testing"
flatten file.outlinks as out
where out = link("test of "+ file.name)
```


